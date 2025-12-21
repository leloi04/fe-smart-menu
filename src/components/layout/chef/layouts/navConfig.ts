import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShoppingBag,
  Calendar,
  Settings,
  Table,
  Receipt,
  Table2Icon,
} from 'lucide-react';

export const adminNav = [
  { id: 'dashboard', to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  {
    id: 'menu',
    to: '/admin/menu',
    icon: UtensilsCrossed,
    label: 'Quản lý món',
  },
  { id: 'tables', to: '/admin/tables', icon: Users, label: 'Quản lý bàn' },
  { id: 'orders', to: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
  {
    id: 'reservations',
    to: '/admin/reservations',
    icon: Calendar,
    label: 'Đặt bàn',
  },
  { id: 'staff', to: '/admin/users', icon: Users, label: 'Nhân viên' },
  { id: 'settings', to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
];

export const staffNav = [
  {
    id: 'dashboard',
    to: '/staff',
    icon: LayoutDashboard,
    label: 'Quản lý đơn',
  },
  { id: 'tables', to: '/staff/tables', icon: Table2Icon, label: 'Quản lý bàn' },
  { id: 'bills', to: '/staff/bills', icon: Receipt, label: 'Quản lý hóa đơn' },
];

export const chefNav = [
  { id: 'kds', to: '/chef', icon: LayoutDashboard, label: 'KDS' },
];

export type NavItem = (typeof adminNav)[number];
