// Global type declarations for development OTP storage

interface OtpData {
  otp: string;
  expires: number;
  attempts: number;
  userData?: any; // Store registration data with OTP
}

interface OtpStore {
  [email: string]: OtpData;
}

declare global {
  var otpStore: OtpStore | undefined;
  var pendingUsers: { [email: string]: any } | undefined;
}

export {};