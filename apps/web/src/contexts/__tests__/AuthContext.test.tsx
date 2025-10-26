import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authAPI } from '@/lib/auth-api';
import { authUtils } from '@/lib/auth-utils';

// Mock dependencies
jest.mock('@/lib/auth-api');
jest.mock('@/lib/auth-utils');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should restore user session from localStorage', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: true,
        role: 'USER' as const,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'accessToken') return mockTokens.accessToken;
        if (key === 'refreshToken') return mockTokens.refreshToken;
        return null;
      });

      (authUtils.validateToken as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.tokens).toEqual(mockTokens);
    });

    it('should clear invalid tokens on initialization', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'accessToken') return 'invalid-token';
        if (key === 'refreshToken') return 'invalid-refresh-token';
        return null;
      });

      (authUtils.validateToken as jest.Mock).mockResolvedValue(false);
      (authAPI.refreshToken as jest.Mock).mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Login', () => {
    it('should login successfully with email', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: true,
          role: 'USER' as const,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          identifier: 'test@example.com',
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        });
      });

      expect(authAPI.login).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123',
        rememberMe: false,
        sessionDuration: 24,
      });

      expect(loginResult).toEqual(mockResponse);
      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.tokens).toEqual({
        accessToken: mockResponse.accessToken,
        refreshToken: mockResponse.refreshToken,
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', mockResponse.accessToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', mockResponse.refreshToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.user));
    });

    it('should login successfully with username', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: true,
          role: 'USER' as const,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          identifier: 'testuser',
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        });
      });

      expect(authAPI.login).toHaveBeenCalledWith({
        identifier: 'testuser',
        password: 'password123',
        rememberMe: false,
        sessionDuration: 24,
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        error: 'INVALID_CREDENTIALS',
      };

      (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);
      (authUtils.getAuthErrorMessage as jest.Mock).mockReturnValue('Invalid email/username or password');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          identifier: 'test@example.com',
          password: 'wrongpassword',
          rememberMe: false,
          sessionDuration: 24,
        });
      });

      expect(loginResult).toEqual(mockResponse);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid email/username or password');
      expect(authUtils.getAuthErrorMessage).toHaveBeenCalledWith('INVALID_CREDENTIALS');
    });

    it('should handle network errors during login', async () => {
      (authAPI.login as jest.Mock).mockRejectedValue(new Error('Network error'));
      (authUtils.getAuthErrorMessage as jest.Mock).mockReturnValue('Network error. Please check your connection and try again');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          identifier: 'test@example.com',
          password: 'password123',
          rememberMe: false,
          sessionDuration: 24,
        });
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Network error',
      });

      expect(result.current.error).toBe('Network error. Please check your connection and try again');
      expect(authUtils.getAuthErrorMessage).toHaveBeenCalledWith('Network error');
    });

    it('should setup token refresh for remember me sessions', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: true,
          role: 'USER' as const,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (authAPI.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          identifier: 'test@example.com',
          password: 'password123',
          rememberMe: true,
          sessionDuration: 168, // 1 week
        });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sessionConfig',
        JSON.stringify({
          rememberMe: true,
          sessionDuration: 168,
          autoRefresh: true,
        })
      );
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Setup authenticated state
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        emailVerified: true,
        role: 'USER' as const,
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'accessToken') return 'mock-access-token';
        if (key === 'refreshToken') return 'mock-refresh-token';
        return null;
      });

      (authUtils.validateToken as jest.Mock).mockResolvedValue(true);
      (authAPI.logout as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authAPI.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.tokens).toBeNull();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sessionConfig');
    });

    it('should logout even if API call fails', async () => {
      // Setup authenticated state
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'accessToken') return 'mock-access-token';
        if (key === 'refreshToken') return 'mock-refresh-token';
        return null;
      });

      (authUtils.validateToken as jest.Mock).mockResolvedValue(true);
      (authAPI.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear local state even if API fails
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.tokens).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh tokens successfully', async () => {
      const mockTokens = {
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
      };

      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') return mockTokens.accessToken;
        if (key === 'refreshToken') return mockTokens.refreshToken;
        return null;
      });

      (authUtils.isTokenExpired as jest.Mock).mockReturnValue(false);
      (authUtils.getTokenExpirationTime as jest.Mock).mockReturnValue(new Date(Date.now() + 60000));
      (authAPI.refreshToken as jest.Mock).mockResolvedValue({
        success: true,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(authAPI.refreshToken).toHaveBeenCalledWith(mockTokens.refreshToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', newTokens.accessToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', newTokens.refreshToken);
    });

    it('should handle refresh token failure', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'refreshToken') return 'invalid-refresh-token';
        return null;
      });

      (authUtils.isTokenExpired as jest.Mock).mockReturnValue(false);
      (authAPI.refreshToken as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid refresh token',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
    });

    it('should reject refresh when refresh token is expired', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'refreshToken') return 'expired-refresh-token';
        return null;
      });

      (authUtils.isTokenExpired as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
      expect(authAPI.refreshToken).not.toHaveBeenCalled();
    });

    it('should check session validity', async () => {
      const mockTokens = {
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token',
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') return mockTokens.accessToken;
        if (key === 'refreshToken') return mockTokens.refreshToken;
        return null;
      });

      (authUtils.isTokenExpired as jest.Mock).mockImplementation((token: string) => {
        return token === 'expired-token';
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSessionValid()).toBe(true);

      // Test with expired access token but valid refresh token
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') return 'expired-token';
        if (key === 'refreshToken') return 'valid-refresh-token';
        return null;
      });

      expect(result.current.isSessionValid()).toBe(true);

      // Test with both tokens expired
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') return 'expired-token';
        if (key === 'refreshToken') return 'expired-token';
        return null;
      });

      expect(result.current.isSessionValid()).toBe(false);
    });

    it('should ensure valid token', async () => {
      const mockTokens = {
        accessToken: 'soon-to-expire-token',
        refreshToken: 'valid-refresh-token',
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') return mockTokens.accessToken;
        if (key === 'refreshToken') return mockTokens.refreshToken;
        return null;
      });

      // Mock token expiring in 2 minutes
      (authUtils.getTokenExpirationTime as jest.Mock).mockReturnValue(
        new Date(Date.now() + 2 * 60 * 1000)
      );
      (authUtils.isTokenExpired as jest.Mock).mockReturnValue(false);
      (authAPI.refreshToken as jest.Mock).mockResolvedValue({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let ensureResult;
      await act(async () => {
        ensureResult = await result.current.ensureValidToken();
      });

      expect(ensureResult).toBe(true);
      expect(authAPI.refreshToken).toHaveBeenCalled();
    });
  });

  describe('Session Management', () => {
    it('should update user data', async () => {
      // Setup authenticated state
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        emailVerified: true,
        role: 'USER' as const,
        isActive: true,
        interests: [],
        privacySettings: {
          allowDirectMessages: true,
          showOnlineStatus: true,
          allowProfileViewing: true,
          dataCollection: false,
        },
        wellnessSettings: {
          trackMood: false,
          trackStress: false,
          shareWellnessData: false,
          crisisAlertsEnabled: true,
          allowWellnessInsights: false,
        },
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser);
        if (key === 'accessToken') return 'mock-access-token';
        if (key === 'refreshToken') return 'mock-refresh-token';
        return null;
      });

      (authUtils.validateToken as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.updateUser({ fullName: 'Updated Name' });
      });

      expect(result.current.user?.fullName).toBe('Updated Name');
      expect(result.current.user?.email).toBe('test@example.com'); // Other fields preserved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ ...mockUser, fullName: 'Updated Name' })
      );
    });

    it('should clear errors', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate an error state
      await act(async () => {
        await result.current.login({
          identifier: 'test@example.com',
          password: 'wrongpassword',
          rememberMe: false,
          sessionDuration: 24,
        });
      });

      (authAPI.login as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should not update user when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Try to update user when not authenticated
      await act(async () => {
        await result.current.updateUser({ fullName: 'Should Not Update' });
      });

      expect(result.current.user).toBeNull();
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
        'user',
        expect.any(String)
      );
    });
  });

  describe('Email Verification', () => {
    it('should verify email successfully', async () => {
      const mockResponse = {
        success: true,
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          emailVerified: true,
          role: 'USER' as const,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (authAPI.verifyEmail as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyEmail({
          email: 'test@example.com',
          otp: '123456',
        });
      });

      expect(verifyResult).toEqual(mockResponse);
      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should resend verification email', async () => {
      const mockResponse = {
        success: true,
        message: 'Verification email sent',
      };

      (authAPI.requestOTP as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let resendResult;
      await act(async () => {
        resendResult = await result.current.resendVerificationEmail('test@example.com');
      });

      expect(resendResult).toEqual(mockResponse);
      expect(authAPI.requestOTP).toHaveBeenCalledWith({
        email: 'test@example.com',
        type: 'EMAIL_VERIFICATION',
      });
    });
  });
});