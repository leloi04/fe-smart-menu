import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShoppingBag,
  Calendar,
  Settings,
  Receipt,
  Table2Icon,
  Truck,
  ClipboardClock,
  SquareMenu,
  Landmark,
  Wallpaper,
  MessageSquareMore,
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
  {
    id: 'promotion',
    to: '/admin/promotions',
    icon: Wallpaper,
    label: 'Quản lý promotions',
  },
  {
    id: 'review',
    to: '/admin/reviews',
    icon: MessageSquareMore,
    label: 'Quản lý reviews',
  },
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
  {
    id: 'deliver',
    to: '/staff/delivers',
    icon: Truck,
    label: 'Quản lý vận chuyển đơn',
  },
  {
    id: 'menu',
    to: '/staff/menus',
    icon: SquareMenu,
    label: 'Quản lý trạng thái món',
  },
  {
    id: 'schedule',
    to: '/staff/schedules',
    icon: ClipboardClock,
    label: 'Quản lý lịch đặt bàn',
  },
  {
    id: 'payment',
    to: '/staff/payments',
    icon: Landmark,
    label: 'Quản lý thanh toán order',
  },
  { id: 'bills', to: '/staff/bills', icon: Receipt, label: 'Quản lý hóa đơn' },
];

export const chefNav = [
  { id: 'kds', to: '/chef', icon: LayoutDashboard, label: 'KDS' },
];

export type NavItem = (typeof adminNav)[number];
