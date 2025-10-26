import { 
  LoginData, 
  RegisterData, 
  EmailVerificationData,
  OTPRequest,
  OTPVerification,
  PasswordResetData,
  AuthResponse,
  RegisterResponse,
  EmailVerificationResponse,
  OTPResponse,
  PasswordResetResponse,
  APIResponse
} from '@/types/auth';

// API configuration
const API_BASE_URL = ''; // Empty for same-origin requests to frontend API routes
const AUTH_ENDPOINTS = {
  login: '/api/auth/signin',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  verifyEmail: '/api/auth/verify-email',
  requestOTP: '/api/auth/request-otp',
  verifyOTP: '/api/auth/verify-otp',
  refreshToken: '/api/auth/refresh-token',
  resetPassword: '/api/auth/reset-password',
  validateToken: '/api/auth/validate-token',
} as const;

class AuthAPI {
  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
        ...data, // Spread to maintain backward compatibility
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({
        identifier: data.identifier,
        password: data.password,
        rememberMe: data.rememberMe,
        sessionDuration: data.sessionDuration,
      }),
    });

    return {
      success: response.success,
      user: response.data?.user,
      accessToken: response.data?.accessToken,
      refreshToken: response.data?.refreshToken,
      message: response.data?.message || response.message,
      error: response.error,
      requiresVerification: response.data?.requiresVerification,
    };
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.register, {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        bio: data.bio,
        interests: data.interests,
        academicInfo: data.academicInfo,
        acceptTerms: data.acceptTerms,
      }),
    });

    return {
      success: response.success,
      user: response.data?.user,
      accessToken: response.data?.accessToken,
      refreshToken: response.data?.refreshToken,
      message: response.data?.message || response.message,
      error: response.error,
      requiresVerification: response.data?.requiresVerification || true,
    };
  }

  async logout(): Promise<APIResponse> {
    return this.request(AUTH_ENDPOINTS.logout, {
      method: 'POST',
    });
  }

  // Email verification methods
  async verifyEmail(data: EmailVerificationData): Promise<EmailVerificationResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.verifyEmail, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: response.success,
      user: response.data?.user,
      accessToken: response.data?.accessToken,
      refreshToken: response.data?.refreshToken,
      message: response.data?.message || response.message,
      error: response.error,
    };
  }

  // OTP methods
  async requestOTP(data: OTPRequest): Promise<OTPResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.requestOTP, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: response.success,
      message: response.data?.message || response.message || '',
      email: response.data?.email,
      otpId: response.data?.otpId,
      error: response.error,
    };
  }

  async verifyOTP(data: OTPVerification): Promise<AuthResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.verifyOTP, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: response.success,
      user: response.data?.user,
      accessToken: response.data?.accessToken,
      refreshToken: response.data?.refreshToken,
      message: response.data?.message || response.message,
      error: response.error,
    };
  }

  // Token management
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.refreshToken, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    return {
      success: response.success,
      accessToken: response.data?.accessToken,
      refreshToken: response.data?.refreshToken,
      message: response.data?.message || response.message,
      error: response.error,
    };
  }

  async validateToken(token: string): Promise<boolean> {
    const response = await this.request(AUTH_ENDPOINTS.validateToken, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    return response.success;
  }

  // Password reset methods
  async resetPassword(data: PasswordResetData): Promise<PasswordResetResponse> {
    const response = await this.request<any>(AUTH_ENDPOINTS.resetPassword, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      success: response.success,
      message: response.data?.message || response.message || '',
      error: response.error,
    };
  }

  // Utility methods
  async checkEmailAvailability(email: string): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await this.request('/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return {
        available: response.success && response.data?.available,
        error: response.error,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Check failed',
      };
    }
  }

  async checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
    try {
      const response = await this.request('/auth/check-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      return {
        available: response.success && response.data?.available,
        error: response.error,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Check failed',
      };
    }
  }

  // Development/testing methods
  async testEmail(email: string): Promise<OTPResponse> {
    try {
      const response = await this.request<any>('/auth/test-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return {
        success: response.success,
        message: response.data?.message || response.message || '',
        error: response.error,
      };
    } catch (error) {
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Test email failed',
      };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/me');

    return {
      success: response.success,
      user: response.data?.user,
      error: response.error,
    };
  }

  // Email communication methods
  async sendWelcomeEmail(email: string, recipientName?: string, otp?: string): Promise<{ success: boolean; message: string; error?: string }> {
    const response = await this.request<any>('/auth/email/send-welcome', {
      method: 'POST',
      body: JSON.stringify({ email, recipientName, otp }),
    });

    return {
      success: response.success,
      message: response.data?.message || response.message || '',
      error: response.error,
    };
  }

  async resendVerificationEmail(email: string, recipientName?: string): Promise<{ success: boolean; message: string; otpId?: string; error?: string }> {
    const response = await this.request<any>('/auth/email/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email, recipientName }),
    });

    return {
      success: response.success,
      message: response.data?.message || response.message || '',
      otpId: response.data?.otpId,
      error: response.error,
    };
  }

  async resendOTPEmail(email: string, type: string, recipientName?: string): Promise<{ success: boolean; message: string; otpId?: string; error?: string }> {
    const response = await this.request<any>('/auth/email/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type, recipientName }),
    });

    return {
      success: response.success,
      message: response.data?.message || response.message || '',
      otpId: response.data?.otpId,
      error: response.error,
    };
  }

  async getEmailDeliveryStatus(emailId: string): Promise<{ 
    success: boolean; 
    status?: 'pending' | 'delivered' | 'failed' | 'bounced';
    deliveredAt?: string;
    error?: string;
  }> {
    const response = await this.request<any>(`/auth/email/delivery-status/${emailId}`);

    return {
      success: response.success,
      status: response.data?.status,
      deliveredAt: response.data?.deliveredAt,
      error: response.error,
    };
  }
}

export const authAPI = new AuthAPI();