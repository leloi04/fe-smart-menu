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

const refreshTokenAPI = () => {
  const urlBackend = '/auth/refresh-token';
  return axios.get<IBackendRes<ILogin>>(urlBackend);
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

const createUserAPI = (payload: any) => {
  const urlBackend = `/users`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
};

const updateUserAPI = (_id: string, payload: any) => {
  const urlBackend = `/users/${_id}`;
  return axios.patch<IBackendRes<any>>(urlBackend, payload);
};

const deleteUserAPI = (_id: string) => {
  const urlBackend = `/users/${_id}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

const updateUserPasswordAPI = (payload: any) => {
  const urlBackend = `/users/update-password`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
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

const createTableAPI = (payload: any) => {
  const urlBackend = `/tables`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
};

const updateTableAPI = (id: string, payload: any) => {
  const urlBackend = `/tables/${id}`;
  return axios.patch<IBackendRes<ITableModal>>(urlBackend, payload);
};

const deleteTableAPI = (_id: string) => {
  const urlBackend = `/tables/${_id}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

const handleChangeStatusTableAPI = (tableId: string, status: string) => {
  const urlBackend = `/tables/change-status`;
  return axios.post<IBackendRes<any>>(urlBackend, { tableId, status });
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

const createMenuAPI = (payload: any) => {
  const urlBackend = `/menus`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
};

const deleteMenuAPI = (_id: string) => {
  const urlBackend = `/menus/${_id}`;
  return axios.delete<IBackendRes<any>>(urlBackend);
};

const updateMenuAPI = (_id: string, payload: any) => {
  const urlBackend = `/menus/${_id}`;
  return axios.patch<IBackendRes<any>>(urlBackend, payload);
};

const updateStatusMenuAPI = (id: string, status: string) => {
  const urlBackend = `/menus/${id}/status`;
  return axios.patch<IBackendRes<any>>(urlBackend, { status });
};

// Pre-Order
const createPreOrderAPI = (payload: any) => {
  const urlBackend = `/pre-order`;
  return axios.post<IBackendRes<any>>(urlBackend, payload);
};

const fetchPreOrderUncompleted = () => {
  const urlBackend = `/pre-order/uncompleted`;
  return axios.post<IBackendRes<any>>(urlBackend);
};

const fetchPreOrderCompleted = () => {
  const urlBackend = `/pre-order/completed`;
  return axios.post<IBackendRes<any>>(urlBackend);
};

const completePreOrderAPI = (id: string) => {
  const urlBackend = `/pre-order/completed-pre-order`;
  return axios.post<IBackendRes<any>>(urlBackend, { id });
};

const getPreOrderAPI = (id: string) => {
  const urlBackend = `/pre-order/${id}`;
  return axios.get<IBackendRes<IPreOrder>>(urlBackend);
};

// Reservation Table API
const getReservationsTableAPI = (query: string) => {
  const urlBackend = `/reservations?${query}`;
  return axios.get<IBackendRes<IModalPaginate<IReservation>>>(urlBackend);
};

const getPreBookedTableUpComingAPI = (query: string) => {
  const urlBackend = `/reservations/pre-booked-table-upcoming?${query}`;
  return axios.post<IBackendRes<IModalPaginate<IReservation>>>(urlBackend);
};

const fetchReservationDataInStatusAPI = (
  status: string,
  customerPhone: string,
) => {
  const urlBackend = `/reservations/data-in-status`;
  return axios.post<IBackendRes<IReservation[]>>(urlBackend, {
    status,
    customerPhone,
  });
};

const checkInTableAPI = (reservationId: string) => {
  const urlBackend = `/reservations/check-in-table`;
  return axios.post<IBackendRes<IReservation[]>>(urlBackend, {
    reservationId,
  });
};

const cancelTableReservationAPI = (
  reservationId: string,
  date: string,
  timeSlot: string,
) => {
  const urlBackend = `/reservations/cancel-reservation`;
  return axios.post<IBackendRes<IReservation[]>>(urlBackend, {
    reservationId,
    date,
    timeSlot,
  });
};

const validateReservationAPI = (
  date: string,
  timeSlot: string,
  tableId: string,
) => {
  const urlBackend = `/reservations/valid-reservation`;
  return axios.post<IBackendRes<any>>(urlBackend, {
    date,
    timeSlot,
    tableId,
  });
};

// Payment API
const createPaymentBankAPI = (orderId: string, amount: number) => {
  const urlBackend = `/payments/vnpay`;
  return axios.post<IBackendRes<{ url: string }>>(urlBackend, {
    orderId,
    amount,
  });
};

const handlePaymentSuccess = (id: string) => {
  const urlBackend = `/payments/handle-payment-success`;
  return axios.post<IBackendRes<any>>(urlBackend, { id });
};

const vnpayReturnAPI = () => {
  return axios.post(`/payments/vnpay-return${window.location.search}`);
};

const fetchOrderUnpaymentAPI = () => {
  const urlBackend = `/payments/unpayment`;
  return axios.post<IBackendRes<any>>(urlBackend);
};

const createPaymnetAPI = (
  orderId: string,
  amount: number,
  type: string,
  orderIn: string,
) => {
  const urlBackend = `/payments/${type}`;
  return axios.post<IBackendRes<any>>(urlBackend, { orderId, amount, orderIn });
};

// Summary for Dashboard
const summaryOrderAPI = (month: string, year: string) => {
  const urlBackend = `/orders/summary`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const summaryOrderForTableAPI = (year: string) => {
  const urlBackend = `/orders/summary-every-month`;
  return axios.post<IBackendRes<any>>(urlBackend, { year });
};

const topItemsTableAPI = (month: string, year: string) => {
  const urlBackend = `/orders/top-items`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const revenueTableAPI = (month: string, year: string) => {
  const urlBackend = `/orders/revenue-month`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const summaryPreOrderAPI = (month: string, year: string) => {
  const urlBackend = `/pre-order/summary`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const summaryPreOrderOfOnlineAPI = (year: string) => {
  const urlBackend = `/pre-order/summary-every-month`;
  return axios.post<IBackendRes<any>>(urlBackend, { year });
};

const topItemsOnlineAPI = (month: string, year: string) => {
  const urlBackend = `/pre-order/top-items`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const summaryReservationAPI = (month: string, year: string) => {
  const urlBackend = `/reservations/summary`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const summaryPaymentAPI = (month: string, year: string) => {
  const urlBackend = `/payments/summary`;
  return axios.post<IBackendRes<any>>(urlBackend, { month, year });
};

const summaryPaymentMonthlyAPI = (year: string) => {
  const urlBackend = `/payments/summary-every-month`;
  return axios.post<IBackendRes<any>>(urlBackend, { year });
};

const summaryReservationTodayAPI = (date: string) => {
  const urlBackend = `/reservations/summary-today`;
  return axios.post<IBackendRes<any>>(urlBackend, { date });
};

export {
  refreshTokenAPI,
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
  fetchReservationDataInStatusAPI,
  checkInTableAPI,
  cancelTableReservationAPI,
  fetchPreOrderUncompleted,
  fetchPreOrderCompleted,
  completePreOrderAPI,
  handlePaymentSuccess,
  vnpayReturnAPI,
  updateTableAPI,
  getPreBookedTableUpComingAPI,
  validateReservationAPI,
  createMenuAPI,
  deleteMenuAPI,
  updateMenuAPI,
  createTableAPI,
  deleteTableAPI,
  createUserAPI,
  deleteUserAPI,
  updateUserAPI,
  updateUserPasswordAPI,
  getPreOrderAPI,
  updateStatusMenuAPI,
  fetchOrderUnpaymentAPI,
  createPaymnetAPI,
  handleChangeStatusTableAPI,
  summaryOrderAPI,
  summaryOrderForTableAPI,
  topItemsTableAPI,
  revenueTableAPI,
  summaryPreOrderAPI,
  summaryPreOrderOfOnlineAPI,
  topItemsOnlineAPI,
  summaryReservationAPI,
  summaryPaymentAPI,
  summaryPaymentMonthlyAPI,
  summaryReservationTodayAPI,
};
