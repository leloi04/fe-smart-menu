import { useState, useMemo } from "react";

function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "vnpay" | null>(null);
  const [message, setMessage] = useState("");

  // 🧾 Danh sách món ăn demo
  const items = [
    { name: "Cà phê sữa đá", price: 25000 },
    { name: "Bánh mì trứng", price: 20000 },
    { name: "Trà đào cam sả", price: 30000 },
  ];

  // 💰 Tổng tiền
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  const handleCashPayment = async () => {
    setSelectedMethod("cash");
    setIsProcessing(true);
    setMessage("💵 Vui lòng di chuyển qua quầy để thanh toán...");

    await new Promise((res) => setTimeout(res, 2500));
    alert("✅ Thanh toán tiền mặt đang được xác nhận. Vui lòng đợi nhân viên xác nhận!")
    setMessage("✅ Thanh toán tiền mặt đang được xác nhận. Vui lòng đợi nhân viên xác nhận!");
    setIsProcessing(false);
  };

  const handleVNPayPayment = async () => {
    try {
      setSelectedMethod("vnpay");
      setIsProcessing(true);
      setMessage("⏳ Đang khởi tạo liên kết VNPAY...");

      const res = await fetch("/api/payments/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "fake_order_123",
          amount: total,
        }),
      });

      const data = await res.json();

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setMessage("❌ Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Lỗi khi kết nối với VNPAY. Vui lòng thử lại sau.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[400px] text-center">
        <h1 className="text-2xl font-semibold mb-6">🧾 Xác nhận đơn hàng</h1>

        {/* Danh sách món */}
        <div className="text-left mb-6 border-b pb-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between py-1 text-gray-700">
              <span>{item.name}</span>
              <span className="font-medium">{item.price.toLocaleString()} đ</span>
            </div>
          ))}
          <div className="flex justify-between mt-3 font-semibold text-lg border-t pt-2">
            <span>Tổng cộng</span>
            <span className="text-green-600">{total.toLocaleString()} đ</span>
          </div>
        </div>

        {/* Chọn phương thức thanh toán */}
        <h2 className="text-lg font-semibold mb-4">💳 Chọn phương thức thanh toán</h2>
        <div className="space-y-4">
          <button
            className={`w-full py-3 text-lg font-medium rounded-lg transition ${
              selectedMethod === "cash"
                ? "bg-green-600 text-white"
                : "bg-green-100 hover:bg-green-200 text-green-700"
            }`}
            onClick={handleCashPayment}
            disabled={isProcessing}
          >
            💵 Thanh toán tiền mặt
          </button>

          <button
            className={`w-full py-3 text-lg font-medium rounded-lg transition ${
              selectedMethod === "vnpay"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 hover:bg-blue-200 text-blue-700"
            }`}
            onClick={handleVNPayPayment}
            disabled={isProcessing}
          >
            💳 Thanh toán qua VNPAY
          </button>
        </div>

        {/* Thông báo tiến trình */}
        {isProcessing && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {/* Thông báo kết quả */}
        {!isProcessing && message && (
          <p className="mt-6 text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
