import axios from 'services/axios.customize';

// Account API Service
const loginAPI = (username: string, password: string) => {
  const urlBackend = '/auth/login';
  return axios.post<IBackendRes<ILogin>>(urlBackend, { username, password });
};

const fetchAccountAPI = () => {
  const urlBackend = '/auth/account';
  return axios.get<IBackendRes<IFetchAccount>>(urlBackend);
};

const logoutAPI = () => {
  const urlBackend = '/auth/logout';
  return axios.post<IBackendRes<ILogin>>(urlBackend);
};

const registerAPI = (
  name: string,
  email: string,
  password: string,
  phone: string,
) => {
  const urlBackend = '/auth/register';
  return axios.post<IBackendRes<IRegister>>(urlBackend, {
    name,
    email,
    password,
    phone,
  });
};

// User API service
const getUserAPI = (query: string) => {
  const urlBackend = `/users?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IUserModal>>>(urlBackend);
};

const getMenuAPI = (query: string) => {
  const urlBackend = `/menus?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IMenuModal>>>(urlBackend);
};

// Order API service
const createOrderAPI = (payload: any) => {
  const urlBackend = `/orders`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
};

const getOrderAPI = (orderId: string) => {
  const urlBackend = `/orders/${orderId}`;
  return axios.get<IBackendRes<IOrderModal>>(urlBackend);
};

const getOrderByTable = (tableId: string) => {
  const urlBackend = `/orders/current-order`;
  return axios.post<IBackendRes<any>>(urlBackend, { tableId });
};

const addCustomerToOrderAPI = (
  orderId: string,
  userId: string,
  name: string,
  isGuest: boolean,
) => {
  const urlBackend = `/orders/add-customer`;
  return axios.post<IBackendRes<any>>(urlBackend, {
    orderId,
    userId,
    name,
    isGuest,
  });
};

const handleConfirmOrderAPI = (
  orderId: string,
  tableNumber: string,
  status: string,
) => {
  const urlBackend = `/orders/status-changed`;
  return axios.post<IBackendRes<any>>(urlBackend, {
    orderId,
    tableNumber,
    status,
  });
};

// Table API service
const verifyTableTokenAPI = (token: string) => {
  const urlBackend = `/tables/verify-token`;
  return axios.post<IBackendRes<{ tableId: string; tableNumber: string }>>(
    urlBackend,
    { token },
  );
};

const getTableByTokenAPI = (token: string) => {
  const urlBackend = `/tables/by-token`;
  return axios.post<IBackendRes<any>>(urlBackend, { token });
};

const getTableAPI = (tableId: string) => {
  const urlBackend = `/tables/${tableId}`;
  return axios.get<IBackendRes<ITableModal>>(urlBackend);
};

const getAllTableAPI = () => {
  const urlBackend = `/tables/data`;
  return axios.post<IBackendRes<ITableModal[]>>(urlBackend);
};

// Menu API
const getCategoryAPI = () => {
  const urlBackend = `/menus/category`;
  return axios.post<IBackendRes<any>>(urlBackend);
};

const getMenus = (query: string) => {
  const urlBackend = `/menus?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IMenuModal>>>(urlBackend);
};

const getMenuItemAPI = (id: string) => {
  const urlBackend = `/menus/${id}`;
  return axios.get<IBackendRes<IMenuModal>>(urlBackend);
};

const fetchMenuItemsAPI = () => {
  const urlBackend = `/menus/items`;
  return axios.post<IBackendRes<IMenuModal>>(urlBackend);
};

export {
  getUserAPI,
  getMenuAPI,
  createOrderAPI,
  getTableByTokenAPI,
  verifyTableTokenAPI,
  getOrderByTable,
  getTableAPI,
  addCustomerToOrderAPI,
  getOrderAPI,
  loginAPI,
  logoutAPI,
  registerAPI,
  fetchAccountAPI,
  handleConfirmOrderAPI,
  getCategoryAPI,
  fetchMenuItemsAPI,
  getAllTableAPI,
  getMenus,
  getMenuItemAPI,
};
