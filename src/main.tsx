import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'styles/global.scss';
import 'styles/tailwind-base.css';
import 'leaflet/dist/leaflet.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ReservationPage from 'pages/clients/reservation';
import RatePage from 'pages/clients/rate';
import Layout from '@/layout';
import HomePage from './pages/clients/home';
import OrderPage from './pages/clients/order';
import { LoginPage } from './pages/clients/auth/login';
import { RegisterPage } from './pages/clients/auth/register';
import '@ant-design/v5-patch-for-react-19';
import { AppProvider } from './components/context/app.context';
import ChefKitchenPage from './pages/chefs/chef';
import StaffPage from './pages/staff/staff';
import { CartProvider } from './components/context/cart.context';
import PreOrderPage from './pages/clients/pre-order';
import OrderTabs from './pages/clients/pre-order/menu.pre-order';
import ManageMenuPage from './pages/admin/manager.menu';
import AdminLayout from './components/layout/chef/layouts/AdminLayout';
import ManageTablePage from './pages/admin/manager.table';
import ManageOrderPage from './pages/admin/manager.order';
import ManageUserPage from './pages/admin/manager.user';
import TableStatusPage from './pages/staff/manager.table';
import BillManagementPage from './pages/staff/manager.bill';
import VNPayReturnPage from './pages/clients/payment/payment';
import ProfilePage from './pages/clients/profile';
import ManageReservationTablePage from 'pages/clients/menu';

let router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/menu', element: <ManageReservationTablePage /> },
      { path: '/rate', element: <RatePage /> },
      { path: '/reservation', element: <ReservationPage /> },
      { path: '/pre-order', element: <PreOrderPage /> },
      { path: '/cart', element: <OrderTabs /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/payments', element: <VNPayReturnPage /> },
  { path: '/tables/:tableNumber', element: <OrderPage /> },
  { path: '/chef', element: <ChefKitchenPage /> },
  { path: '/staff', element: <StaffPage /> },
  { path: '/staff/tables', element: <TableStatusPage /> },
  { path: '/staff/bills', element: <BillManagementPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <div>123</div> },
      { path: '/admin/menu', element: <ManageMenuPage /> },
      { path: '/admin/tables', element: <ManageTablePage /> },
      { path: '/admin/orders', element: <ManageOrderPage /> },
      { path: '/admin/reservations', element: <ManageReservationTablePage /> },
      { path: '/admin/users', element: <ManageUserPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AppProvider>
  </StrictMode>,
);
