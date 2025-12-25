import { fetchAccountAPI, logoutAPI } from '@/services/api';
import { createContext, useContext, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';

interface IAppContext {
  isAuthenticated: boolean;
  user: IUser | null;
  setUser: (v: IUser | null) => void;
  isLoading: boolean;
  setIsAuthenticated: (v: boolean) => void;
  logout: () => void;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProp = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: TProp) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetchAccountAPI();
        if (res?.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    fetchAccount();
  }, []);

  const logout = async () => {
    await logoutAPI();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cart');
  };

  return isLoading ? (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <ScaleLoader />
    </div>
  ) : (
    <CurrentAppContext.Provider
      value={{
        isAuthenticated,
        user,
        setUser,
        isLoading,
        setIsAuthenticated,
        logout,
      }}
    >
      {children}
    </CurrentAppContext.Provider>
  );
};

export const useCurrentApp = () => {
  const context = useContext(CurrentAppContext);
  if (!context) {
    throw new Error('useCurrentApp must be used inside <AppProvider>');
  }
  return context;
};
