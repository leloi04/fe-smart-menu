import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useCurrentApp } from '@/components/context/app.context';
import { message } from 'antd';

interface NavItem {
  id: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface PanelLayoutProps {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
  headerActions?: ReactNode;
}

export default function PanelLayout({
  title,
  navItems,
  children,
  headerActions,
}: PanelLayoutProps) {
  const { user, logout } = useCurrentApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    message.success('Đăng xuất thành công');
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay – CHỈ mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:fixed
          top-0 left-0 h-screen
          bg-white border-r border-gray-200
          z-30 flex flex-col
          transition-all duration-300
          ${
            /* MOBILE: drawer */
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }
          ${
            /* DESKTOP + TABLET */
            sidebarOpen
              ? 'md:w-64 md:translate-x-0'
              : 'md:w-20 md:translate-x-0'
          }
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <span
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {title}
            </span>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.id === 'dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`
          flex-1 flex flex-col
          transition-all duration-300
          ml-0
          ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center space-x-3">
              {/* ☰ mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              <h1
                className="text-lg md:text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {title}
              </h1>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4">
              {/* 🔔 luôn hiện */}
              {headerActions}

              {/* 👤 chỉ tablet + laptop */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
