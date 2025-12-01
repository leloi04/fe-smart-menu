import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "styles/global.scss"
import "styles/tailwind-base.css"
import "leaflet/dist/leaflet.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import MenuPage from 'pages/clients/menu';
import ReservationPage from 'pages/clients/reservation';
import RatePage from 'pages/clients/rate';
import Layout from '@/layout';
import HomePage from './pages/clients/home';
import OrderPage from './pages/clients/order';
import PaymentPage from './pages/clients/payment';
import PreOrderPage from './pages/clients/pre-order';
import { LoginPage } from './pages/clients/auth/login';
import { RegisterPage } from './pages/clients/auth/register';
import '@ant-design/v5-patch-for-react-19'; 
import { AppProvider } from './components/context/app.context';
import ChefKitchenPage from './pages/chefs/chef';
import StaffPage from './pages/staff/staff';

let router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
       { index: true, element: <HomePage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/rate", element: <RatePage /> },
      { path: "/reservation", element: <ReservationPage /> },
      { path: "/pre-order", element: <PreOrderPage /> },
    ],
  },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/payment", element: <PaymentPage /> },
      { path: "/tables/:tableNumber", element: <OrderPage /> },
      { path: "/chef", element: <ChefKitchenPage /> },
      { path: "/staff", element: <StaffPage /> },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
)
