import {
  fetchAccountAPI,
  getSettingAPI,
  logoutAPI,
  updateUserAPI,
} from '@/services/api';
import { createContext, useContext, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';

interface IAppContext {
  isAuthenticated: boolean;
  user: IUser | null;
  setUser: (v: IUser | null) => void;
  isLoading: boolean;
  setIsAuthenticated: (v: boolean) => void;
  logout: () => void;
  infoWeb: IInfoWeb | null;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProp = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: TProp) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [infoWeb, setInfoWeb] = useState<IInfoWeb | null>(null);
  const [hasPromptedPhone, setHasPromptedPhone] = useState(false);

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

  useEffect(() => {
    if (!user || hasPromptedPhone) return;

    if (!user.phone) {
      setHasPromptedPhone(true);

      const phone = window.prompt(
        'Vui lòng nhập số điện thoại để tiếp tục sử dụng hệ thống',
      );

      if (!phone) {
        window.location.reload();
        return;
      }

      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        alert('Số điện thoại phải gồm đúng 10 chữ số');
        window.location.reload();
        return;
      }

      const updateUser = async () => {
        try {
          const payload = {
            email: user.email,
            name: user.name,
            phone,
          };

          const res = await updateUserAPI(user._id, payload);

          if (res?.data) {
            logout();
            window.location.href = '/login';
          }
        } catch (error: any) {
          const message =
            error?.response?.data?.message || 'Cập nhật số điện thoại thất bại';
          alert(message);
          window.location.reload();
        }
      };

      updateUser();
    }
  }, [user, hasPromptedPhone]);

  useEffect(() => {
    const getInfoRestaurant = async () => {
      const res = await getSettingAPI();
      if (res.data) {
        const data = res.data;
        setInfoWeb(data);
      }
    };

    getInfoRestaurant();
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
        infoWeb,
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
