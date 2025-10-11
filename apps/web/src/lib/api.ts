const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('Request body:', options.body);
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as any,
    };
    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Response: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // OTP endpoints
  async requestEmailVerificationOtp(email: string): Promise<ApiResponse> {
    return this.request('/auth/otp/request-email-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmailOtp(data: OtpVerificationData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/otp/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestLoginOtp(email: string): Promise<ApiResponse> {
    return this.request('/auth/otp/request-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyLoginOtp(data: OtpVerificationData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/otp/verify-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Password verification + OTP login
  async verifyPasswordAndRequestOtp(data: LoginData): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/verify-password-request-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPasswordOtp(data: OtpVerificationData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/verify-password-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestPasswordResetOtp(email: string): Promise<ApiResponse> {
    return this.request('/auth/password/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyPasswordResetOtp(data: OtpVerificationData): Promise<ApiResponse<{ resetToken: string }>> {
    return this.request<{ resetToken: string }>('/auth/password/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  }

  // Test email endpoint
  async testEmail(email: string): Promise<ApiResponse> {
    return this.request('/auth/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // User endpoints
  async getUserProfile(token: string): Promise<ApiResponse> {
    return this.request('/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getUserStats(token: string): Promise<ApiResponse> {
    return this.request('/users/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient();