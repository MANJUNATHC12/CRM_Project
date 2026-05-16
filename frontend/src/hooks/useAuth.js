import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState({ name: 'Guest', email: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (!token) return;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      
      const fullName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.unique_name || payload.name || 'User';

      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role || [];
      const role = Array.isArray(roles) ? roles[0] : roles;

      setUser({
        name: fullName,
        email: payload.email || payload.sub || '',
        roles: Array.isArray(roles) ? roles : [roles],
        role: role || 'User'
      });
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Invalid token', e);
      localStorage.removeItem('crm_token');
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('crm_token');
    window.location.href = '/login';
  };

  return { user, isAuthenticated, logout };
}
