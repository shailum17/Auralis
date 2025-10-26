import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmailService } from '../../../common/email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface OtpGenerationOptions {
    email: string;
    userId?: string;
    type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET' | 'PASSWORD_LOGIN' | 'REGISTRATION';
    expiryMinutes?: number;
    maxAttempts?: number;
    ipAddress?: string;
    userAgent?: string;
}

export interface OtpVerificationOptions {
    email: string;
    otp: string;
    type: 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET' | 'PASSWORD_LOGIN' | 'REGISTRATION';
    ipAddress?: string;
    userAgent?: string;
}

export interface OtpVerificationResult {
    success: boolean;
    otpId?: string;
    userId?: string;
    attemptsRemaining?: number;
    error?: string;
}

@Injectable()
export class OtpService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    /**
     * Generate and send OTP
     */
    async generateAndSendOtp(options: OtpGenerationOptions): Promise<{ success: boolean; otpId?: string; error?: string }> {
        try {
            // Clean up expired OTPs first
            await this.cleanupExpiredOtps();

            // Check for existing pending OTP using raw MongoDB command
            const existingOtpResult = await this.prisma.$runCommandRaw({
                find: 'otps',
                filter: {
                    email: options.email,
                    type: options.type,
                    status: 'PENDING',
                    expires_at: { $gt: new Date() }
                },
                limit: 1
            }) as any;

            const existingOtp = existingOtpResult.cursor?.firstBatch?.[0];

            // If there's a recent OTP (less than 1 minute old), don't generate new one
            if (existingOtp && new Date().getTime() - existingOtp.createdAt.getTime() < 60000) {
                return {
                    success: false,
                    error: 'Please wait before requesting a new OTP'
                };
            }

            // Invalidate any existing pending OTPs using raw MongoDB command
            await this.prisma.$runCommandRaw({
                update: 'otps',
                updates: [{
                    q: {
                        email: options.email,
                        type: options.type,
                        status: 'PENDING'
                    },
                    u: { $set: { status: 'EXPIRED' } },
                    multi: true
                }]
            });

            // Generate new OTP
            const otp = this.generateSecureOtp();
            const hashedOtp = await bcrypt.hash(otp, 12);
            const expiresAt = new Date(Date.now() + (options.expiryMinutes || 10) * 60 * 1000);

            // Store OTP in database using raw MongoDB command
            const otpInsertResult = await this.prisma.$runCommandRaw({
                insert: 'otps',
                documents: [{
                    user_id: options.userId,
                    email: options.email,
                    otp: otp, // Store plain text temporarily for email sending
                    hashed_otp: hashedOtp,
                    type: options.type,
                    status: 'PENDING',
                    attempts: 0,
                    max_attempts: options.maxAttempts || 3,
                    expires_at: expiresAt,
                    created_at: new Date(),
                    verified_at: null,
                    ip_address: options.ipAddress,
                    user_agent: options.userAgent
                }]
            }) as any;

            const otpId = otpInsertResult.insertedIds?.[0];

            // Send OTP via email using new template system
            const emailSent = await this.emailService.sendOTPEmail(
                options.email,
                otp,
                options.type as any
            );

            if (!emailSent) {
                // Clean up if email failed
                if (otpId) {
                    await this.prisma.$runCommandRaw({
                        delete: 'otps',
                        deletes: [{
                            q: { _id: otpId },
                            limit: 1
                        }]
                    });
                }
                return {
                    success: false,
                    error: 'Failed to send OTP email'
                };
            }

            // Clear plain text OTP from database for security
            if (otpId) {
                await this.prisma.$runCommandRaw({
                    update: 'otps',
                    updates: [{
                        q: { _id: otpId },
                        u: { $set: { otp: '' } }
                    }]
                });
            }

            return {
                success: true,
                otpId: otpId?.toString()
            };

        } catch (error) {
            console.error('OTP generation failed:', error);
            return {
                success: false,
                error: 'Failed to generate OTP'
            };
        }
    }

    /**
     * Verify OTP
     */
    async verifyOtp(options: OtpVerificationOptions): Promise<OtpVerificationResult> {
        try {
            // Find the OTP record using raw MongoDB command
            const otpResult = await this.prisma.$runCommandRaw({
                find: 'otps',
                filter: {
                    email: options.email,
                    type: options.type,
                    status: 'PENDING'
                },
                sort: { created_at: -1 },
                limit: 1
            }) as any;

            const otpRecord = otpResult.cursor?.firstBatch?.[0];

            if (!otpRecord) {
                return {
                    success: false,
                    error: 'No valid OTP found. Please request a new one.'
                };
            }

            // Check if expired
            if (new Date() > new Date(otpRecord.expires_at)) {
                await this.prisma.$runCommandRaw({
                    update: 'otps',
                    updates: [{
                        q: { _id: otpRecord._id },
                        u: { $set: { status: 'EXPIRED' } }
                    }]
                });
                return {
                    success: false,
                    error: 'OTP has expired. Please request a new one.'
                };
            }

            // Check if max attempts exceeded
            if (otpRecord.attempts >= otpRecord.max_attempts) {
                await this.prisma.$runCommandRaw({
                    update: 'otps',
                    updates: [{
                        q: { _id: otpRecord._id },
                        u: { $set: { status: 'FAILED' } }
                    }]
                });
                return {
                    success: false,
                    error: 'Maximum verification attempts exceeded. Please request a new OTP.'
                };
            }

            // Increment attempt count
            await this.prisma.$runCommandRaw({
                update: 'otps',
                updates: [{
                    q: { _id: otpRecord._id },
                    u: { $inc: { attempts: 1 } }
                }]
            });

            // Verify OTP
            const isValid = await bcrypt.compare(options.otp, otpRecord.hashed_otp);

            if (!isValid) {
                const attemptsRemaining = otpRecord.max_attempts - (otpRecord.attempts + 1);

                if (attemptsRemaining <= 0) {
                    await this.prisma.$runCommandRaw({
                        update: 'otps',
                        updates: [{
                            q: { _id: otpRecord._id },
                            u: { $set: { status: 'FAILED' } }
                        }]
                    });
                }

                return {
                    success: false,
                    attemptsRemaining: Math.max(0, attemptsRemaining),
                    error: attemptsRemaining > 0
                        ? `Invalid OTP. ${attemptsRemaining} attempts remaining.`
                        : 'Invalid OTP. Maximum attempts exceeded.'
                };
            }

            // OTP is valid - mark as verified
            await this.prisma.$runCommandRaw({
                update: 'otps',
                updates: [{
                    q: { _id: otpRecord._id },
                    u: {
                        $set: {
                            status: 'VERIFIED',
                            verified_at: new Date()
                        }
                    }
                }]
            });

            return {
                success: true,
                otpId: otpRecord._id.toString(),
                userId: otpRecord.user_id
            };

        } catch (error) {
            console.error('OTP verification failed:', error);
            return {
                success: false,
                error: 'OTP verification failed'
            };
        }
    }

    /**
     * Check OTP status
     */
    async getOtpStatus(email: string, type: string): Promise<{
        exists: boolean;
        status?: string;
        attemptsRemaining?: number;
        expiresAt?: Date;
    }> {
        const otpResult = await this.prisma.$runCommandRaw({
            find: 'otps',
            filter: {
                email,
                type: type as any,
                status: 'PENDING'
            },
            sort: { created_at: -1 },
            limit: 1
        }) as any;

        const otpRecord = otpResult.cursor?.firstBatch?.[0];

        if (!otpRecord) {
            return { exists: false };
        }

        return {
            exists: true,
            status: otpRecord.status,
            attemptsRemaining: otpRecord.max_attempts - otpRecord.attempts,
            expiresAt: new Date(otpRecord.expires_at)
        };
    }

    /**
     * Clean up expired OTPs
     */
    async cleanupExpiredOtps(): Promise<void> {
        // Mark expired OTPs
        await this.prisma.$runCommandRaw({
            update: 'otps',
            updates: [{
                q: {
                    expires_at: { $lt: new Date() },
                    status: 'PENDING'
                },
                u: { $set: { status: 'EXPIRED' } },
                multi: true
            }]
        });

        // Delete old expired OTPs (older than 24 hours)
        await this.prisma.$runCommandRaw({
            delete: 'otps',
            deletes: [{
                q: {
                    status: { $in: ['EXPIRED', 'VERIFIED', 'FAILED'] },
                    created_at: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                },
                limit: 0
            }]
        });
    }

    /**
     * Generate secure OTP
     */
    private generateSecureOtp(): string {
        // Generate cryptographically secure 6-digit OTP
        const buffer = crypto.randomBytes(4);
        const otp = (buffer.readUInt32BE(0) % 900000 + 100000).toString();
        return otp;
    }

    /**
     * Map OTP type for email templates
     */
    private mapOtpTypeForEmail(type: string): string {
        const typeMap = {
            'EMAIL_VERIFICATION': 'email_verification',
            'LOGIN': 'login',
            'PASSWORD_RESET': 'password_reset',
            'PASSWORD_LOGIN': 'password-login',
            'REGISTRATION': 'registration'
        };

        return typeMap[type] || 'login';
    }

    /**
     * Rate limiting check
     */
    async checkRateLimit(email: string, type: string, windowMinutes: number = 15, maxAttempts: number = 5): Promise<boolean> {
        const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

        const countResult = await this.prisma.$runCommandRaw({
            count: 'otps',
            query: {
                email,
                type: type as any,
                created_at: { $gte: windowStart }
            }
        }) as any;

        const recentAttempts = countResult.n || 0;
        return recentAttempts < maxAttempts;
    }
}