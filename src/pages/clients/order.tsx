import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  addCustomerToOrderAPI,
  createOrderAPI,
  getOrderByTable,
  getTableAPI,
  verifyTableTokenAPI,
} from '@/services/api'; // 👉 API kiểm tra token
import MenuOrder from './order/menu.order';
import { v4 as uuidv4 } from 'uuid';

interface UserInfo {
  name: string;
  isGuest: boolean;
  userId?: string;
}

const OrderPage = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [step, setStep] = useState<'verify' | 'choose' | 'guestName' | 'order'>(
    'verify',
  );
  const [statusTable, setStatusTable] = useState<string>('');
  const [tableData, setTableData] = useState<{
    tableId: string;
    tableNumber: string;
  } | null>(null);

  // 🔹 Bước 1: Xác minh token để lấy thông tin bàn
  useEffect(() => {
    const verifyTable = async () => {
      const res = await verifyTableTokenAPI(token);
      if (res && res.data) {
        setTableData(res.data);
        if (!localStorage.getItem('userInfo')) {
          setStep('choose');
        } else {
          setStep('order');
        }
      } else {
        alert('Liên kết không hợp lệ hoặc bàn không tồn tại!');
      }
    };

    if (token) verifyTable();
  }, [token]);

  // 🔹 Bước 2: Kiểm tra user trong localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserInfo(parsed);
    }
  }, []);

  // 🔹 Bước 3: Xử lý order khi có thông tin bàn
  useEffect(() => {
    // Nếu không có tableData thì không làm gì
    if (!tableData) return;

    // Dùng cờ ref để tránh gọi lại nhiều lần
    if (hasFetched.current) return;
    hasFetched.current = true;

    const handleOrderTable = async () => {
      try {
        const table = await getTableAPI(tableData.tableId);
        const statusTable = table.data.status;
        setStatusTable(statusTable);

        if (statusTable === 'empty') {
          const newOrder = await createOrderAPI({
            tableId: tableData.tableId,
            orderItems: [],
            totalPrice: 0,
          });
          setCurrentOrderId(newOrder.data._id);
        } else {
          if (statusTable === 'cleaning') {
            console.log('đang dọn');
          } else {
            const orderRes = await getOrderByTable(tableData.tableId);
            setCurrentOrderId(orderRes.data._id);
          }
        }
      } catch (err) {
        console.error('❌ Error initializing order:', err);
      }
    };

    handleOrderTable();
  }, [tableData]);

  const handleGuestContinue = () => setStep('guestName');

  const handleGuestSubmit = async () => {
    if (!guestName.trim()) return;
    const newGuest: UserInfo = {
      userId: uuidv4(),
      name: guestName,
      isGuest: true,
    };
    const { userId, name, isGuest } = newGuest;
    if (currentOrderId && userId && name && isGuest) {
      await addCustomerToOrderAPI(currentOrderId, userId, name, isGuest);
    }
    localStorage.setItem('userInfo', JSON.stringify(newGuest));
    setUserInfo(newGuest);
    setStep('order');
  };

  const handleLogin = () => {
    navigate(
      `/login?redirect=${encodeURIComponent(
        `/tables/${tableNumber}?token=${token}`,
      )}`,
    );
  };

  if (statusTable === 'cleaning') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">Bàn đang được dọn vui lòng chờ ...</p>
      </div>
    );
  } else {
    // 🧭 Bước chọn hình thức vào
    if (step === 'verify') {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <p className="text-gray-600">Đang xác minh bàn...</p>
        </div>
      );
    }

    if (step === 'choose') {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
              Chào mừng đến bàn số {tableData?.tableNumber}
            </h1>
            <p className="text-gray-600 mb-6">Vui lòng chọn cách tiếp tục</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleGuestContinue}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                Tiếp tục với tư cách khách
              </button>
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                Đăng nhập tài khoản
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (step === 'guestName') {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
            <h2 className="text-xl font-semibold mb-4">Nhập tên của bạn</h2>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Tên của bạn..."
              className="border border-gray-300 rounded-lg px-4 py-2 w-64 text-center mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleGuestSubmit}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      );
    }

    if (step === 'order' && userInfo && tableData) {
      return (
        <div>
          <MenuOrder
            setStatusTable={setStatusTable}
            statusTable={statusTable}
            setStep={setStep}
            setUserInfo={setUserInfo}
            userInfo={userInfo}
            currentOrderId={currentOrderId}
            tableData={tableData}
          />
        </div>
      );
    }
  }

  return null;
};

export default OrderPage;
