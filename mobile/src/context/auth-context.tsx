import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. IP Auto-Discovery Helper (matching HomeScreen and ProfileScreen)
const getAutoDiscoverIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.100'; // Default developer fallback IP
};

const API_URL = `http://${getAutoDiscoverIp()}:8000/api`;

// 2. Cross-Platform Local Storage Wrapper
const isWeb = Platform.OS === 'web';
const globalMemoryStorage: Record<string, string> = {};

const saveToStorage = async (key: string, value: string) => {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } else {
    globalMemoryStorage[key] = value;
  }
};

const getFromStorage = async (key: string): Promise<string | null> => {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } else {
    return globalMemoryStorage[key] || null;
  }
  return null;
};

const removeFromStorage = async (key: string) => {
  if (isWeb) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } else {
    delete globalMemoryStorage[key];
  }
};

export interface User {
  id: number;
  username: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  is_logged_in: boolean;
  active_order_tracking?: boolean;
  courier_progress?: number;
  delivery_minutes?: number;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (payload: {
    username: string;
    password: string;
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user session on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUserJson = await getFromStorage('user_session');
        if (storedUserJson) {
          const storedUser = JSON.parse(storedUserJson);
          
          // Verify with backend if possible, else keep local session
          try {
            const response = await fetch(`${API_URL}/profile/current/?user_id=${storedUser.id}`);
            if (response.ok) {
              const freshData = await response.json();
              setUser(freshData);
              await saveToStorage('user_session', JSON.stringify(freshData));
            } else {
              setUser(storedUser);
            }
          } catch (e) {
            // Offline fallback: use stored local data
            setUser(storedUser);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/profile/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        await saveToStorage('user_session', JSON.stringify(data));
        return true;
      } else {
        setError(data.error || 'Giriş yapılamadı.');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback offline verification if user exists locally
      const storedUserJson = await getFromStorage('user_session');
      if (storedUserJson) {
        const localUser = JSON.parse(storedUserJson);
        if (localUser.username.toLowerCase() === username.toLowerCase()) {
          setUser(localUser);
          return true;
        }
      }
      setError('Ağ hatası. Lütfen bağlantınızı kontrol edin.');
      return false;
    }
  };

  const register = async (payload: {
    username: string;
    password: string;
    name: string;
    phone: string;
    email: string;
    address: string;
  }): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/profile/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        await saveToStorage('user_session', JSON.stringify(data));
        return true;
      } else {
        setError(data.error || 'Hesap oluşturulamadı.');
        return false;
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Ağ hatası. Lütfen bağlantınızı kontrol edin.');
      return false;
    }
  };

  const logout = async () => {
    if (user) {
      try {
        // Notify backend of logout
        await fetch(`${API_URL}/profile/save_profile/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, is_logged_in: false }),
        });
      } catch (e) {
        console.warn('Backend logout sync skipped', e);
      }
    }
    setUser(null);
    setError(null);
    await removeFromStorage('user_session');
  };

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setError(null);

    const payload = {
      user_id: user.id,
      ...user,
      ...updatedData,
    };

    try {
      const response = await fetch(`${API_URL}/profile/save_profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        await saveToStorage('user_session', JSON.stringify(data));
        return true;
      } else {
        setError(data.error || 'Profil güncellenemedi.');
        return false;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      // Fallback offline update
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      await saveToStorage('user_session', JSON.stringify(updatedUser));
      return true;
    }
  };

  const clearError = () => setError(null);

  const isLoggedIn = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
