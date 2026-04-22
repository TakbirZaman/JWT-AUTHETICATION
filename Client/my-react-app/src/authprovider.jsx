import { useMemo, useState } from 'react';
import AuthContext from './AuthContext';

const API_BASE_URL = 'http://localhost:5000';
const TOKEN_STORAGE_KEY = 'access-token';
const USER_STORAGE_KEY = 'auth-user';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [loading, setLoading] = useState(false);

  const saveAuthState = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);

    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const clearAuthState = () => {
    saveAuthState(null, '');
  };

  const register = async (name, email, password) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      saveAuthState(data.user, data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      saveAuthState(data.user, data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    clearAuthState();
  };

  const fetchProfile = async () => {
    const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!currentToken) {
      clearAuthState();
      return null;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }

      saveAuthState(data.user, currentToken);
      return data.user;
    } catch {
      clearAuthState();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const authInfo = useMemo(() => {
    return {
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      register,
      signIn,
      logOut,
      fetchProfile,
    };
  }, [user, token, loading]);

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
