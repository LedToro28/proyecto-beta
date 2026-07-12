import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const data = await api.getSession();
      if (data.loggedIn) {
        setUser({
          username: data.username,
          role: data.role,
          agencyName: data.agencyName,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkSession(); }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    await checkSession();
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, loading, login, logout, checkSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
