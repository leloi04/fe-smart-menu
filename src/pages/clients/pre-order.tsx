import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import MenuPreOrder from "./pre-order/menu.pre-order";

type OrderItem = { quantity: number; selectedVariant?: string; selectedToppings: string[] };

const socket: Socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8081");

const PreOrderPage = () => {
  const [step, setStep] = useState<"chooseMethod" | "guestName" | "order">("chooseMethod");
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const [guestName, setGuestName] = useState("");
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  const handleGuestSubmit = () => {
    if (!guestName.trim()) return;
    localStorage.setItem("guestName", guestName);
    setStep("order");
  };

  // tính tổng tiền
  useEffect(() => {
    const total = Object.entries(orderItems)
      .filter(([_, item]) => item.quantity > 0)
      .reduce((sum, [_, item]) => {
        // tạm tính base là 1000 nếu không có giá (demo)
        const base = 1000;
        const toppingTotal = item.selectedToppings.length * 500; // demo topping
        return sum + (base + toppingTotal) * item.quantity;
      }, 0);
    setTotalPrice(total);
  }, [orderItems]);

  const handleSendPreOrder = () => {
    const formattedOrder = Object.entries(orderItems)
      .filter(([_, o]) => o.quantity > 0)
      .map(([menuItemId, o]) => ({
        menuItemId,
        quantity: o.quantity,
        variant: o.selectedVariant,
        toppings: o.selectedToppings,
      }));

    const orderPayload = {
      customerName: guestName,
      method,
      orderItems: formattedOrder,
      totalAmount: totalPrice,
      pickupTime: new Date(), // demo: đặt ngay
    };

    console.log("📤 Gửi pre-order:", orderPayload);

    // gửi qua socket
    socket.emit("preOrder", orderPayload);
    alert("✅ Pre-order đã gửi!");
  };

  // UI
  if (step === "chooseMethod") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Đặt món trước</h1>
          <p className="text-gray-600 mb-6">Chọn cách nhận món</p>
          <div className="flex flex-col gap-4">
            <button
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              onClick={() => { setMethod("pickup"); setStep("guestName"); }}
            >
              Nhận tại quán
            </button>
            <button
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              onClick={() => { setMethod("delivery"); setStep("guestName"); }}
            >
              Giao hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "guestName") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
          <h2 className="text-xl font-semibold mb-4">Nhập tên của bạn</h2>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Tên của bạn..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 text-center mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleGuestSubmit}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
          >
            Xác nhận
          </button>
        </div>
      </div>
    );
  }

  // bước đặt món
  return (
    <div className="flex flex-col items-center bg-[#fff7ed] min-h-screen py-8 px-4">
      <h1 className="text-3xl font-bold text-[#7c2d12] mb-4">
        🍽️ Thực đơn {method === "pickup" ? "tại quán" : "giao hàng"}
      </h1>

      <MenuPreOrder orderItems={orderItems} setOrderItems={setOrderItems} />

      <div className="bg-gradient-to-r from-amber-800 to-amber-700 text-white flex justify-between items-center p-4 mt-4 rounded-xl shadow-lg w-full max-w-[700px]">
        <div>
          <p className="font-semibold opacity-90">Tổng cộng</p>
          <p className="text-2xl font-bold tracking-wide">
            {totalPrice.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <button
          onClick={handleSendPreOrder}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all px-6 py-3 rounded-lg font-semibold shadow-md"
        >
          🚀 Gửi Pre-Order
        </button>
      </div>
    </div>
  );
};

export default PreOrderPage;
