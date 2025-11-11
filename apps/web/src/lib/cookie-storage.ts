/**
 * Cookie-based storage utility for secure session management
 * Provides methods to store and retrieve authentication tokens using cookies
 */

export interface CookieOptions {
  maxAge?: number; // in seconds
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean; // Note: Can't be set from client-side JS
}

class CookieStorage {
  /**
   * Set a cookie with the given name and value
   */
  setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof window === 'undefined') return;

    const {
      maxAge,
      expires,
      path = '/',
      domain,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax',
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (maxAge !== undefined) {
      cookieString += `; max-age=${maxAge}`;
    }

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += '; secure';
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Remove a cookie by name
   */
  removeCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
    if (typeof window === 'undefined') return;

    const { path = '/', domain } = options;

    let cookieString = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Check if a cookie exists
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  getAllCookies(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const cookies: Record<string, string> = {};
    const cookieStrings = document.cookie.split(';');

    for (const cookie of cookieStrings) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
}

export const cookieStorage = new CookieStorage();
