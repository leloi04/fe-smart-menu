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

// File API
const updateFileAPI = (fileImg: any, folder: string) => {
  const bodyFormData = new FormData();
  bodyFormData.append('fileUpload', fileImg);
  return axios<
    IBackendRes<{
      fileUpload: string;
    }>
  >({
    method: 'post',
    url: '/files/upload',
    data: bodyFormData,
    headers: {
      'Content-Type': 'multipart/formdata',
      folder_type: folder,
    },
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
const getOrdersAPI = (query: string) => {
  const urlBackend = `/orders?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IOrderModal>>>(urlBackend);
};

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
  dataSet: { tableNumber?: string; customerName?: string },
  status: string,
  keyRedis: string,
  batchId?: string,
) => {
  const urlBackend = `/orders/status-changed`;
  return axios.post<IBackendRes<any>>(urlBackend, {
    orderId,
    dataSet,
    status,
    keyRedis,
    batchId,
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

const getTableAllAPI = (query: string) => {
  const urlBackend = `/tables?${query}`;
  return axios.get<IBackendRes<IModalPaginate<ITableModal>>>(urlBackend);
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

// Pre-Order
const createPreOrderAPI = (payload: any) => {
  const urlBackend = `/pre-order`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
};

// Reservation Table API
const getReservationsTableAPI = (query: string) => {
  const urlBackend = `/reservations?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IReservation>>>(urlBackend);
};

// Payment API
const createPaymentBankAPI = (orderId: string, amount: number) => {
  const urlBackend = `/payments/vnpay`;
  return axios.post<IBackendRes<{ url: string }>>(urlBackend, {
    orderId,
    amount,
  });
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
  createPreOrderAPI,
  getTableAllAPI,
  getOrdersAPI,
  getReservationsTableAPI,
  updateFileAPI,
  createPaymentBankAPI,
};
