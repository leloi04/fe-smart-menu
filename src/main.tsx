import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "styles/global.scss"
import "leaflet/dist/leaflet.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import MenuPage from 'pages/clients/menu';
import ReservationPage from 'pages/clients/reservation';
import RatePage from 'pages/clients/rate';
import LoginPage from 'pages/clients/auth/login';
import RegisterPage from 'pages/clients/auth/register';
import Layout from '@/layout';
import HomePage from './pages/clients/home';
import OrderPage from './pages/clients/order';
import PaymentPage from './pages/clients/payment';

let router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
       { index: true, element: <HomePage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/reservation", element: <ReservationPage /> },
      { path: "/rate", element: <RatePage /> },
    ],
  },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/payment", element: <PaymentPage /> },
      { path: "/tables/:tableNumber", element: <OrderPage /> },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />,
  </StrictMode>,
)
