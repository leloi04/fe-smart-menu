import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

interface CustomerInfo {
  name: string;
  isGuest: boolean;
  userId?: string;
}

export default function OrderPage() {
  const [showModal, setShowModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [order, setOrder] = useState<any>(null);

  const navigate = useNavigate();
  const tableId = new URLSearchParams(window.location.search).get("table");
  const socket = io("http://localhost:3000"); // 🔧 URL backend socket

  useEffect(() => {
    const saved = localStorage.getItem("customerInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomer(parsed);
    } else {
      setShowModal(true);
    }
  }, []);

  // 🧩 Khi có thông tin khách → join phòng bàn
  useEffect(() => {
    if (!customer || !tableId) return;

    socket.emit("joinTable", tableId);

    socket.on("currentOrder", (orderData) => {
      console.log("🧾 Current Order:", orderData);
      setOrder(orderData);
    });

    socket.on("orderUpdated", (updated) => {
      console.log("🔁 Order updated:", updated);
      setOrder(updated);
    });

    return () => {
      socket.disconnect();
    };
  }, [customer, tableId]);

  // 🧠 Xử lý khách nhập tên
  const handleGuestConfirm = () => {
    if (!guestName.trim()) return alert("Vui lòng nhập tên của bạn");
    const info: CustomerInfo = { name: guestName, isGuest: true };
    localStorage.setItem("customerInfo", JSON.stringify(info));
    setCustomer(info);
    setShowModal(false);
  };

  const handleLogin = () => {
    navigate("/login?redirect=" + encodeURIComponent(window.location.href));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-4">🪑 Bàn {tableId}</h1>

      {order ? (
        <pre className="bg-white shadow p-4 rounded-lg">{JSON.stringify(order, null, 2)}</pre>
      ) : (
        <p className="text-gray-500">Đang tải order...</p>
      )}

      {/* 🔹 Modal chọn Khách / Đăng nhập */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-center">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Chào mừng bạn 👋</h2>
            <p className="text-sm text-gray-500 mb-4">
              Vui lòng chọn cách bạn muốn đặt món
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
              >
                Tôi là Khách
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
              >
                Đăng nhập
              </button>
            </div>

            {!customer && !guestName && !showModal ? null : (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={handleGuestConfirm}
                  className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
