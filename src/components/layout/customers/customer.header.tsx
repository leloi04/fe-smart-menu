import { useCurrentApp } from '@/components/context/app.context';
import { message } from 'antd';
import {
  Calendar,
  Home,
  Menu,
  ShoppingBag,
  ShoppingCart,
  User,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function AppHeader() {
  const { logout, infoWeb } = useCurrentApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    message.success('Đăng xuất thành công');
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/reservation', icon: Calendar, label: 'Đặt bàn' },
    { path: '/pre-order', icon: ShoppingCart, label: 'Đặt món' },
    { path: '/cart', icon: ShoppingBag, label: 'Giỏ hàng' },
    { path: '/profile', icon: User, label: 'Tài khoản' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            {infoWeb?.logo ? (
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/images/logo/${
                  infoWeb.logo
                }`}
                alt="logo"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <UtensilsCrossed className="w-8 h-8 text-[#FF6B35]" />
            )}
            <span
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {infoWeb?.name ? infoWeb.name : 'Restaurant'}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {/* {item.badge && item.badge > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )} */}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-[#FF6B35] transition-colors"
            >
              Đăng xuất
            </button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {/* {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )} */}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-orange-50 rounded-lg"
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
