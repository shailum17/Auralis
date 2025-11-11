/**
 * Unified session storage that uses cookies with localStorage fallback
 * Handles session persistence based on user's "Remember Me" preference
 */

import { cookieStorage, CookieOptions } from './cookie-storage';
import { AuthTokens, SessionConfig } from '@/types/auth';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  SESSION_CONFIG: 'sessionConfig',
  TOKEN_METADATA: 'tokenMetadata',
} as const;

class SessionStorage {
  /**
   * Store authentication tokens with appropriate expiration
   */
  storeTokens(tokens: AuthTokens, config?: SessionConfig): void {
    const { rememberMe = false, sessionDuration = 24 } = config || {};

    // Calculate expiration time in seconds
    let maxAge: number | undefined;
    
    if (rememberMe && sessionDuration) {
      // Convert hours to seconds
      maxAge = sessionDuration * 60 * 60;
    } else {
      // Session cookie (expires when browser closes)
      maxAge = undefined;
    }

    const cookieOptions: CookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(maxAge && { maxAge }),
    };

    // Store tokens in cookies
    cookieStorage.setCookie(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken, cookieOptions);
    cookieStorage.setCookie(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken, cookieOptions);

    // Also store in localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
  }

  /**
   * Get authentication tokens from storage
   */
  getTokens(): AuthTokens | null {
    // Try cookies first
    const accessToken = cookieStorage.getCookie(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = cookieStorage.getCookie(TOKEN_KEYS.REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const localAccessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      const localRefreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

      if (localAccessToken && localRefreshToken) {
        return {
          accessToken: localAccessToken,
          refreshToken: localRefreshToken,
        };
      }
    }

    return null;
  }

  /**
   * Store user data
   */
  storeUser(user: any, config?: SessionConfig): void {
    const { rememberMe = false, sessionDuration = 24 } = config || {};
    const userJson = JSON.stringify(user);

    let maxAge: number | undefined;
    
    if (rememberMe && sessionDuration) {
      maxAge = sessionDuration * 60 * 60;
    }

    const cookieOptions: CookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(maxAge && { maxAge }),
    };

    // Store in cookie
    cookieStorage.setCookie(TOKEN_KEYS.USER, userJson, cookieOptions);

    // Also store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.USER, userJson);
    }
  }

  /**
   * Get user data from storage
   */
  getUser(): any | null {
    // Try cookie first
    const userCookie = cookieStorage.getCookie(TOKEN_KEYS.USER);
    if (userCookie) {
      try {
        return JSON.parse(userCookie);
      } catch (error) {
        console.error('Failed to parse user cookie:', error);
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const userLocal = localStorage.getItem(TOKEN_KEYS.USER);
      if (userLocal) {
        try {
          return JSON.parse(userLocal);
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
    }

    return null;
  }

  /**
   * Store session configuration
   */
  storeSessionConfig(config: SessionConfig): void {
    const configJson = JSON.stringify(config);
    const { rememberMe = false, sessionDuration = 24 } = config;

    let maxAge: number | undefined;
    
    if (rememberMe && sessionDuration) {
      maxAge = sessionDuration * 60 * 60;
    }

    const cookieOptions: CookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(maxAge && { maxAge }),
    };

    cookieStorage.setCookie(TOKEN_KEYS.SESSION_CONFIG, configJson, cookieOptions);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.SESSION_CONFIG, configJson);
    }
  }

  /**
   * Get session configuration
   */
  getSessionConfig(): SessionConfig | null {
    // Try cookie first
    const configCookie = cookieStorage.getCookie(TOKEN_KEYS.SESSION_CONFIG);
    if (configCookie) {
      try {
        return JSON.parse(configCookie);
      } catch (error) {
        console.error('Failed to parse session config cookie:', error);
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const configLocal = localStorage.getItem(TOKEN_KEYS.SESSION_CONFIG);
      if (configLocal) {
        try {
          return JSON.parse(configLocal);
        } catch (error) {
          console.error('Failed to parse session config from localStorage:', error);
        }
      }
    }

    return null;
  }

  /**
   * Store token metadata
   */
  storeTokenMetadata(metadata: any): void {
    const metadataJson = JSON.stringify(metadata);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEYS.TOKEN_METADATA, metadataJson);
    }
  }

  /**
   * Get token metadata
   */
  getTokenMetadata(): any | null {
    if (typeof window !== 'undefined') {
      const metadata = localStorage.getItem(TOKEN_KEYS.TOKEN_METADATA);
      if (metadata) {
        try {
          return JSON.parse(metadata);
        } catch (error) {
          console.error('Failed to parse token metadata:', error);
        }
      }
    }

    return null;
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    // Clear cookies
    cookieStorage.removeCookie(TOKEN_KEYS.ACCESS_TOKEN);
    cookieStorage.removeCookie(TOKEN_KEYS.REFRESH_TOKEN);
    cookieStorage.removeCookie(TOKEN_KEYS.USER);
    cookieStorage.removeCookie(TOKEN_KEYS.SESSION_CONFIG);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER);
      localStorage.removeItem(TOKEN_KEYS.SESSION_CONFIG);
      localStorage.removeItem(TOKEN_KEYS.TOKEN_METADATA);
    }
  }

  /**
   * Check if session exists
   */
  hasSession(): boolean {
    const tokens = this.getTokens();
    return tokens !== null;
  }

  /**
   * Update tokens while preserving session config
   */
  updateTokens(tokens: AuthTokens): void {
    const config = this.getSessionConfig();
    this.storeTokens(tokens, config || undefined);
    
    // Update metadata
    const metadata = {
      storedAt: new Date().toISOString(),
    };
    this.storeTokenMetadata(metadata);
  }
}

export const sessionStorage = new SessionStorage();
