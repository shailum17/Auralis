'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  User, 
  AuthState, 
  AuthContextType, 
  LoginData, 
  RegisterData, 
  EmailVerificationData,
  OTPRequest,
  OTPVerification,
  PasswordResetRequest,
  PasswordResetData,
  AuthTokens,
  SessionConfig,
  SessionData
} from '@/types/auth';
import { authAPI } from '@/lib/auth-api';
import { authUtils } from '@/lib/auth-utils';

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  tokens: null,
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Token refresh interval (14 minutes - 1 minute before expiry)
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to update state
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Check if current session is valid
  const isSessionValid = useCallback((): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        return false;
      }

      // If access token is expired but refresh token is valid, session can be renewed
      if (authUtils.isTokenExpired(accessToken)) {
        return !authUtils.isTokenExpired(refreshToken);
      }

      return true;
    } catch (error) {
      console.error('Failed to check session validity:', error);
      return false;
    }
  }, []);

  // Force token refresh if needed
  const ensureValidToken = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') return false;
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        return false;
      }

      // If access token is expired or expires soon, refresh it
      const expiryTime = authUtils.getTokenExpirationTime(accessToken);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (!expiryTime || expiryTime.getTime() - now < fiveMinutes) {
        // Call refresh token directly to avoid circular dependency
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          return false;
        }

        if (authUtils.isTokenExpired(refreshToken)) {
          // Clear tokens if refresh token is expired
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenMetadata');
          localStorage.removeItem('sessionConfig');
          localStorage.removeItem('user');
          return false;
        }

        try {
          setState(prev => ({ ...prev, isLoading: true, error: null }));
          
          const response = await authAPI.refreshToken(refreshToken);
          
          if (response.success && response.accessToken && response.refreshToken) {
            const newTokens = {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            };
            
            // Store new tokens
            localStorage.setItem('accessToken', newTokens.accessToken);
            localStorage.setItem('refreshToken', newTokens.refreshToken);
            
            const tokenMetadata = {
              accessTokenExpiry: authUtils.getTokenExpirationTime(newTokens.accessToken),
              refreshTokenExpiry: authUtils.getTokenExpirationTime(newTokens.refreshToken),
              storedAt: new Date().toISOString(),
            };
            localStorage.setItem('tokenMetadata', JSON.stringify(tokenMetadata));
            
            setState(prev => ({ 
              ...prev,
              tokens: newTokens,
              isLoading: false,
              error: null
            }));
            
            return true;
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          setState(prev => ({ 
            ...prev,
            isLoading: false,
            error: 'Failed to refresh authentication token'
          }));
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to ensure valid token:', error);
      return false;
    }
  }, []);

  // Update user data
  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!state.user) {
      console.warn('Cannot update user: no user is currently authenticated');
      return;
    }

    try {
      updateState({ isLoading: true, error: null });
      
      // Update local state immediately for better UX
      const updatedUser = { ...state.user, ...userData };
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // TODO: Sync with backend API when user update endpoint is available
      // const response = await authAPI.updateUser(userData);
      // if (!response.success) {
      //   // Revert changes if API call fails
      //   setState(prev => ({ ...prev, user: state.user }));
      //   updateState({ error: response.error || 'Failed to update user' });
      // }
      
    } catch (error) {
      console.error('Failed to update user:', error);
      updateState({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      });
    }
  }, [state.user, updateState]);

  // Store tokens securely
  const storeTokens = useCallback((tokens: AuthTokens, config?: SessionConfig) => {
    try {
      // Store tokens with encryption in production
      if (typeof window !== 'undefined') {
        // For now using localStorage, but in production should use httpOnly cookies
        // or encrypted storage for better security
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        // Store token metadata for refresh logic
        const tokenMetadata = {
          accessTokenExpiry: authUtils.getTokenExpirationTime(tokens.accessToken),
          refreshTokenExpiry: authUtils.getTokenExpirationTime(tokens.refreshToken),
          storedAt: new Date().toISOString(),
        };
        localStorage.setItem('tokenMetadata', JSON.stringify(tokenMetadata));
        
        if (config) {
          localStorage.setItem('sessionConfig', JSON.stringify(config));
        }
      }
      
      updateState({ tokens });
    } catch (error) {
      console.error('Failed to store tokens:', error);
      updateState({ error: 'Failed to store authentication tokens' });
    }
  }, [updateState]);

  // Clear stored tokens
  const clearTokens = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenMetadata');
        localStorage.removeItem('sessionConfig');
        localStorage.removeItem('user');
      }
      updateState({ tokens: null });
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }, [updateState]);

  // Load tokens from storage
  const loadTokens = useCallback((): AuthTokens | null => {
    try {
      if (typeof window === 'undefined') return null;
      
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const tokenMetadata = localStorage.getItem('tokenMetadata');
      
      if (accessToken && refreshToken) {
        // Check if tokens are expired based on stored metadata
        if (tokenMetadata) {
          try {
            const metadata = JSON.parse(tokenMetadata);
            const now = new Date();
            
            // If refresh token is expired, clear all tokens
            if (metadata.refreshTokenExpiry && new Date(metadata.refreshTokenExpiry) <= now) {
              clearTokens();
              return null;
            }
          } catch (metadataError) {
            console.warn('Failed to parse token metadata:', metadataError);
          }
        }
        
        return { accessToken, refreshToken };
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
    return null;
  }, [clearTokens]);

  // Refresh access token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const tokens = loadTokens();
      if (!tokens?.refreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      // Check if refresh token is expired
      if (authUtils.isTokenExpired(tokens.refreshToken)) {
        console.warn('Refresh token is expired');
        clearTokens();
        return false;
      }

      updateState({ isLoading: true, error: null });
      
      const response = await authAPI.refreshToken(tokens.refreshToken);
      
      if (response.success && response.accessToken && response.refreshToken) {
        const newTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
        
        // Preserve existing session config
        const sessionConfig = localStorage.getItem('sessionConfig');
        const config = sessionConfig ? JSON.parse(sessionConfig) : undefined;
        
        storeTokens(newTokens, config);
        
        updateState({ 
          tokens: newTokens,
          isLoading: false,
          error: null
        });
        
        return true;
      } else {
        console.warn('Token refresh failed:', response.error);
        updateState({ isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      updateState({ 
        isLoading: false,
        error: 'Failed to refresh authentication token'
      });
      return false;
    }
  }, [loadTokens, storeTokens, updateState, clearTokens]);

  // Setup automatic token refresh
  const setupTokenRefresh = useCallback(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    const tokens = loadTokens();
    if (!tokens?.accessToken) {
      return;
    }

    // Calculate refresh interval based on token expiration
    const tokenExpiry = authUtils.getTokenExpirationTime(tokens.accessToken);
    let refreshInterval = TOKEN_REFRESH_INTERVAL; // Default 14 minutes

    if (tokenExpiry) {
      // Refresh 2 minutes before token expires, but not less than 1 minute
      const timeUntilExpiry = tokenExpiry.getTime() - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - (2 * 60 * 1000), 60 * 1000);
      
      if (refreshTime > 0 && refreshTime < TOKEN_REFRESH_INTERVAL) {
        refreshInterval = refreshTime;
      }
    }

    // Get session config to adjust refresh strategy
    const sessionConfig = localStorage.getItem('sessionConfig');
    if (sessionConfig) {
      try {
        const config = JSON.parse(sessionConfig);
        if (config.rememberMe && config.sessionDuration) {
          // For longer sessions, use a more conservative refresh strategy
          const hours = config.sessionDuration;
          if (hours >= 24) {
            refreshInterval = Math.min(refreshInterval, 60 * 60 * 1000); // Max 1 hour
          } else if (hours >= 8) {
            refreshInterval = Math.min(refreshInterval, 30 * 60 * 1000); // Max 30 minutes
          }
        }
      } catch (error) {
        console.error('Error parsing session config:', error);
      }
    }

    const timer = setInterval(async () => {
      const currentTokens = loadTokens();
      if (!currentTokens?.accessToken) {
        clearInterval(timer);
        return;
      }

      // Check if token is close to expiring
      if (authUtils.isTokenExpired(currentTokens.accessToken) || 
          (authUtils.getTokenExpirationTime(currentTokens.accessToken)?.getTime() || 0) - Date.now() < 5 * 60 * 1000) {
        
        const success = await refreshToken();
        if (!success) {
          // If refresh fails, clear tokens and logout user
          console.warn('Token refresh failed, logging out user');
          clearInterval(timer);
          
          // Clear all stored data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenMetadata');
            localStorage.removeItem('sessionConfig');
            localStorage.removeItem('user');
          }
          
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            tokens: null,
          });
        } else {
          // Reschedule next refresh with new token
          setupTokenRefresh();
        }
      }
    }, refreshInterval);

    setRefreshTimer(timer);
  }, [refreshTimer, refreshToken, loadTokens]);

  // Login function
  const login = useCallback(async (data: LoginData) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authAPI.login(data);
      
      if (response.success && response.user && response.accessToken && response.refreshToken) {
        const tokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
        
        const sessionConfig: SessionConfig = {
          rememberMe: data.rememberMe || false,
          sessionDuration: data.sessionDuration || 24,
          autoRefresh: true,
        };
        
        storeTokens(tokens, sessionConfig);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));
        
        updateState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          tokens,
          error: null,
        });
        
        // Setup token refresh if remember me is enabled
        if (sessionConfig.rememberMe) {
          setupTokenRefresh();
        }
        
        return response;
      } else {
        updateState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: authUtils.getAuthErrorMessage(response.error),
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: authUtils.getAuthErrorMessage(errorMessage),
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [updateState, storeTokens, setupTokenRefresh]);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authAPI.register(data);
      
      if (response.success) {
        updateState({ isLoading: false });
        return response;
      } else {
        updateState({
          isLoading: false,
          error: response.error || 'Registration failed',
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      updateState({
        isLoading: false,
        error: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [updateState]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      // Clear refresh timer
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
      
      // Call logout API if tokens exist
      const tokens = loadTokens();
      if (tokens) {
        try {
          await authAPI.logout();
        } catch (apiError) {
          console.warn('Logout API call failed:', apiError);
          // Continue with local cleanup even if API call fails
        }
      }
      
      // Clear all stored data
      clearTokens();
      
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if there are errors
      clearTokens();
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: null,
      });
    }
  }, [updateState, refreshTimer, loadTokens, clearTokens]);

  // Email verification
  const verifyEmail = useCallback(async (data: EmailVerificationData) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authAPI.verifyEmail(data);
      
      if (response.success && response.user && response.accessToken && response.refreshToken) {
        const tokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
        
        storeTokens(tokens);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        updateState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          tokens,
        });
      } else {
        updateState({
          isLoading: false,
          error: response.error || 'Email verification failed',
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      updateState({
        isLoading: false,
        error: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [updateState, storeTokens]);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      const response = await authAPI.requestOTP({
        email,
        type: 'EMAIL_VERIFICATION',
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
      return {
        success: false,
        message: '',
        error: errorMessage,
      };
    }
  }, []);

  // Request OTP
  const requestOTP = useCallback(async (data: OTPRequest) => {
    try {
      const response = await authAPI.requestOTP(data);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request OTP';
      return {
        success: false,
        message: '',
        error: errorMessage,
      };
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (data: OTPVerification) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authAPI.verifyOTP(data);
      
      if (response.success && response.user && response.accessToken && response.refreshToken) {
        const tokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        };
        
        const sessionConfig: SessionConfig = {
          rememberMe: data.rememberMe || false,
          sessionDuration: data.sessionDuration || 24,
          autoRefresh: true,
        };
        
        storeTokens(tokens, sessionConfig);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        updateState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          tokens,
        });
        
        if (sessionConfig.rememberMe) {
          setupTokenRefresh();
        }
      } else {
        updateState({
          isLoading: false,
          error: response.error || 'OTP verification failed',
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      updateState({
        isLoading: false,
        error: errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [updateState, storeTokens, setupTokenRefresh]);

  // Request password reset
  const requestPasswordReset = useCallback(async (data: PasswordResetRequest) => {
    try {
      const response = await authAPI.requestOTP({
        email: data.email,
        type: 'PASSWORD_RESET',
      });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request password reset';
      return {
        success: false,
        message: '',
        error: errorMessage,
      };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (data: PasswordResetData) => {
    try {
      const response = await authAPI.resetPassword(data);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      return {
        success: false,
        message: '',
        error: errorMessage,
      };
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        updateState({ isLoading: true, error: null });
        
        const tokens = loadTokens();
        const storedUser = localStorage.getItem('user');
        
        if (tokens && storedUser) {
          const user = JSON.parse(storedUser);
          
          // Verify token is still valid
          const isValid = await authUtils.validateToken(tokens.accessToken);
          
          if (isValid) {
            updateState({
              user,
              isAuthenticated: true,
              isLoading: false,
              tokens,
            });
            
            // Setup token refresh
            const sessionConfig = localStorage.getItem('sessionConfig');
            if (sessionConfig) {
              const config = JSON.parse(sessionConfig);
              if (config.rememberMe) {
                setupTokenRefresh();
              }
            }
          } else {
            // Try to refresh token
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              const newTokens = loadTokens();
              const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
              updateState({
                user: updatedUser,
                isAuthenticated: true,
                isLoading: false,
                tokens: newTokens,
              });
              
              // Setup token refresh if remember me is enabled
              const sessionConfig = localStorage.getItem('sessionConfig');
              if (sessionConfig) {
                const config = JSON.parse(sessionConfig);
                if (config.rememberMe) {
                  setupTokenRefresh();
                }
              }
            } else {
              // Clear invalid tokens
              clearTokens();
              updateState({ 
                isLoading: false,
                isAuthenticated: false,
                user: null,
                tokens: null
              });
            }
          }
        } else {
          updateState({ 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            tokens: null
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearTokens();
        updateState({ 
          isLoading: false,
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: 'Failed to initialize authentication'
        });
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [loadTokens, updateState, setupTokenRefresh, refreshToken, clearTokens, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [refreshTimer]);

  const contextValue: AuthContextType = {
    ...state,
    isInitialized,
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationEmail,
    requestOTP,
    verifyOTP,
    requestPasswordReset,
    resetPassword,
    refreshToken,
    updateUser,
    clearError,
    isSessionValid,
    ensureValidToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export context for testing
export { AuthContext };