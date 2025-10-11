// Authentication utility functions

export const clearAuthData = () => {
  // Clear all authentication-related data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};

export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('accessToken');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getUserDisplayName = (user: any): string => {
  if (!user) return 'User';
  return user.username || user.email?.split('@')[0] || 'User';
};

export const getUserInitials = (user: any): string => {
  if (!user) return 'U';
  
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  
  return 'U';
};