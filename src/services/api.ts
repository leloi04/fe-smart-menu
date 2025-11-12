import axios from "services/axios.customize";

// User API service
const getUserAPI = (query: string) => {
  const urlBackend = `/users?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IUserModal>>>(urlBackend);
};

// User API service
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
  isGuest: boolean
) => {
  const urlBackend = `/orders/add-customer`;
  return axios.post<IBackendRes<any>>(urlBackend, {
    orderId,
    userId,
    name,
    isGuest,
  });
};

// Table API service
const verifyTableTokenAPI = (token: string) => {
  const urlBackend = `/tables/verify-token`;
  return axios.post<IBackendRes<{ tableId: string; tableNumber: string }>>(
    urlBackend,
    { token }
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
};
