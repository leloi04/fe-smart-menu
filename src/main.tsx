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
import DeliverOrderManagement from './pages/staff/manager.deliver';
import ThankYouPage from './pages/clients/payment/thankyou';
import ManageScheduleTablePage from './pages/staff/manager.schedule';
import ManageReservationTablePage from './pages/admin/manager.reservation';
import Dashboard from './pages/admin/dashboard';
import ProtectedCustomer from './components/auth/protected.customer';
import ProtectedChef from './components/auth/protected.chef';
import ProtectedStaff from './components/auth/protected.staff';
import ProtectedAdmin from './components/auth/protected.admin';
import MenuStatusTable from './pages/staff/manager.menu';
import StaffPaymentManager from './pages/staff/manager.payment';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

let router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/rate', element: <RatePage /> },
      {
        path: '/reservation',
        element: (
          <ProtectedCustomer>
            <ReservationPage />
          </ProtectedCustomer>
        ),
      },
      {
        path: '/pre-order',
        element: (
          <ProtectedCustomer>
            <PreOrderPage />
          </ProtectedCustomer>
        ),
      },
      {
        path: '/cart',
        element: (
          <ProtectedCustomer>
            <OrderTabs />
          </ProtectedCustomer>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedCustomer>
            <ProfilePage />
          </ProtectedCustomer>
        ),
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/payments', element: <VNPayReturnPage /> },
  { path: '/payments/success', element: <ThankYouPage /> },
  { path: '/tables/:tableNumber', element: <OrderPage /> },
  {
    path: '/chef',
    element: (
      <ProtectedChef>
        <ChefKitchenPage />
      </ProtectedChef>
    ),
  },
  {
    path: '/staff',
    element: (
      <ProtectedStaff>
        <StaffPage />
      </ProtectedStaff>
    ),
  },
  {
    path: '/staff/tables',
    element: (
      <ProtectedStaff>
        <TableStatusPage />
      </ProtectedStaff>
    ),
  },
  {
    path: '/staff/payments',
    element: (
      <ProtectedStaff>
        <StaffPaymentManager />
      </ProtectedStaff>
    ),
  },
  {
    path: '/staff/bills',
    element: (
      <ProtectedStaff>
        <BillManagementPage />
      </ProtectedStaff>
    ),
  },
  {
    path: '/staff/delivers',
    element: (
      <ProtectedStaff>
        <DeliverOrderManagement />
      </ProtectedStaff>
    ),
  },
  {
    path: '/staff/menus',
    element: (
      <ProtectedStaff>
        <MenuStatusTable />
      </ProtectedStaff>
    ),
  },
  {
    path: '/staff/schedules',
    element: (
      <ProtectedStaff>
        <ManageScheduleTablePage />
      </ProtectedStaff>
    ),
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedAdmin>
            <Dashboard />
          </ProtectedAdmin>
        ),
      },
      {
        path: '/admin/menu',
        element: (
          <ProtectedAdmin>
            <ManageMenuPage />
          </ProtectedAdmin>
        ),
      },
      {
        path: '/admin/tables',
        element: (
          <ProtectedAdmin>
            <ManageTablePage />
          </ProtectedAdmin>
        ),
      },
      {
        path: '/admin/orders',
        element: (
          <ProtectedAdmin>
            <ManageOrderPage />
          </ProtectedAdmin>
        ),
      },
      {
        path: '/admin/reservations',
        element: (
          <ProtectedAdmin>
            <ManageReservationTablePage />
          </ProtectedAdmin>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedAdmin>
            <ManageUserPage />
          </ProtectedAdmin>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <CartProvider>
        <ConfigProvider locale={viVN}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </CartProvider>
    </AppProvider>
  </StrictMode>,
);
