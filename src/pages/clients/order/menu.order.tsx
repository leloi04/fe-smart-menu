import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getMenuAPI} from "@/services/api";

type Variant = { size: string; price: number; _id: string };
type Topping = { name: string; price: number; _id: string };
type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  status: "available" | "out_of_stock";
  variants: Variant[];
  toppings: Topping[];
};

interface IProps {
  currentOrderId: string;
  tableData: { tableId: string; tableNumber: string } | null;
}

type OrderItem = { quantity: number; selectedVariant?: string; selectedToppings: string[] };

const socket: Socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8081");

const MenuOrder = (props: IProps) => {
  const { currentOrderId, tableData } = props;
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Record<string, OrderItem>>({});
  const [realtimeOrder,setRealtimeOrder] = useState<any>(null);
  const tableId = tableData?.tableId || "";
  const tableNumber = tableData?.tableNumber || "";
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<"pending_confirmation" | "processing" | "completed" | "draft">("draft");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid" | null>(null);

  // 🍽️ Lấy menu
  useEffect(() => {
  const fetchMenuAndOrder = async () => {
     try {
      const menuRes = await getMenuAPI("pageSize=100")

      // Xử lý menu
      const items = menuRes.data.result;
      setMenu(items);

      // Khởi tạo danh sách order (client-side state)
      const initOrders: Record<string, OrderItem> = {};
      items.forEach((item: MenuItem) => {
        initOrders[item._id] = {
          quantity: 0,
          selectedVariant: item.variants?.[0]?._id,
          selectedToppings: [],
        };
      });

      setOrders(initOrders);

    } catch (err) {
      console.error("❌ Lỗi load menu/order:", err);
    }
  };

  fetchMenuAndOrder();
}, [tableId]);

  // 🔌 Kết nối socket & nhận realtime order
  useEffect(() => {
    if (tableNumber && tableId) {
      socket.emit("joinTable", {tableNumber, tableId});
      
      socket.on("currentOrder", (data) => {
          setRealtimeOrder(data);
        });

      socket.on("currentOrderProcessing", (data) => {
          setProgressStatus(data)
        });

        socket.on("orderStatusChanged", (data) => {
          setProgressStatus(data)
        });

      socket.on("orderUpdated", (data) => {
        setRealtimeOrder(data);
      });
    }


    const handleMenuStatusUpdate = (updatedItem: any) => {
    setMenu((prev) =>
      prev.map((item) =>
        item._id === updatedItem._id
          ? { ...item, status: updatedItem.status }
          : item
      )
    );
  };

  socket.on("menuStatusUpdated", handleMenuStatusUpdate);

    return () => {
      socket.off("currentOrderProcessing");
      socket.off("orderStatusChanged");
      socket.off("currentOrder");
      socket.off("orderUpdated");
      socket.off("menuStatusUpdated", handleMenuStatusUpdate);
    };
  }, [tableNumber, tableId]);

  useEffect(() => {
    const emitUpdateOrder = () => {
      const updateOrder = Object.entries(orders)
        .filter(([_, o]) => o.quantity > 0)
        .map(([id, o]) => {
          const item = menu.find((m) => m._id === id);
          if (!item) return null;
          const variant = item.variants.find((v) => v._id === o.selectedVariant);
          const toppings = item.toppings.filter((t) => o.selectedToppings.includes(t._id));
          return {
            menuItemId: item._id,
            name: item.name,
            quantity: o.quantity,
            variant: variant ? { _id: variant._id, size: variant.size, price: variant.price } : null,
            toppings: toppings.map((t) => ({ _id: t._id, name: t.name, price: t.price })),
          };
        })
        .filter(Boolean) as any[];

        const totalPrice = updateOrder.reduce((sum, i) => {
          const base = i.variant ? i.variant.price : menu.find(m => m._id === i.menuItemId)?.price || 0;
          const toppingTotal = i.toppings.reduce((tSum: number, t: any) => tSum + t.price, 0);
          return sum + (base + toppingTotal) * i.quantity;
        }, 0);

        setTotalPrice(totalPrice);

        if(currentOrderId && updateOrder.length > 0 && totalPrice >= 0 && tableNumber) {
          socket.emit("updateOrder", {currentOrderId, updateOrder, totalPrice, tableNumber});
        }
    }

    emitUpdateOrder();
  }, [orders]);

  useEffect(() => {
  if (!realtimeOrder || !realtimeOrder.orderItems || menu.length === 0) return;

  setOrders((prev) => {
    const newOrders = { ...prev };
    let hasChanged = false;

    realtimeOrder.orderItems.forEach((oi: any) => {
      const existing = newOrders[oi.menuItemId];
      const newValue = {
        quantity: oi.quantity,
        selectedVariant: oi.variant?._id || undefined,
        selectedToppings: oi.toppings?.map((t: any) => t._id) || [],
      };

      const isDifferent =
        existing?.quantity !== newValue.quantity ||
        existing?.selectedVariant !== newValue.selectedVariant ||
        JSON.stringify(existing?.selectedToppings || []) !==
          JSON.stringify(newValue.selectedToppings);

      if (isDifferent) {
        newOrders[oi.menuItemId] = newValue;
        hasChanged = true;
      }
    });

    return hasChanged ? newOrders : prev;
  });

  if (realtimeOrder.totalPrice !== undefined) {
    setTotalPrice(realtimeOrder.totalPrice);
  }
}, [realtimeOrder, menu]);

  // 🔹 Thay đổi số lượng món
  const handleQuantityChange = (id: string, delta: number) => {
    setOrders((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Math.max(0, (prev[id]?.quantity || 0) + delta),
      },
    }));
  };

  // 🔹 Chọn size
  const handleVariantSelect = (itemId: string, variantId: string) => {
    setOrders((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], selectedVariant: variantId },
    }));
  };

  // 🔹 Chọn topping
  const handleToppingToggle = (itemId: string, toppingId: string) => {
    setOrders((prev) => {
      const selected = prev[itemId].selectedToppings;
      const updated = selected.includes(toppingId)
        ? selected.filter((t) => t !== toppingId)
        : [...selected, toppingId];
      return {
        ...prev,
        [itemId]: { ...prev[itemId], selectedToppings: updated },
      };
    });
  };

  const formatDataOrder = () => {
    const orderItems = Object.entries(orders)
    .filter(([_, o]) => o.quantity > 0)
    .map(([id, o]) => {
      const item = menu.find((m) => m._id === id);
      if (!item) return null;

      const variant = item.variants.find((v) => v._id === o.selectedVariant);
      const toppings = item.toppings.filter((t) => o.selectedToppings.includes(t._id));

      return {
        menuItemId: item._id,
        name: item.name,
        quantity: o.quantity,
        variant: variant ? { _id: variant._id, size: variant.size, price: variant.price } : null,
        toppings: toppings.map((t) => ({ _id: t._id, name: t.name, price: t.price })),
      };
    })
    .filter(Boolean) as any[];

    return orderItems
  }

  // 🚀 Gửi order
  const handleSendOrder = async (isAddItems: boolean) => {
   // 🧾 Chuẩn bị dữ liệu order
    const orderItems = formatDataOrder()

    console.log("📤 Gửi order với orderItems:", {orderItems, totalPrice});
    try {
      if(isAddItems) {
        console.log("order gửi khi thêm món")
        socket.emit("sendOrder", {currentOrderId, orderItems, totalPrice, tableNumber, isAddItems});
      } else {
        socket.emit("sendOrder", {currentOrderId, orderItems, totalPrice, tableNumber, statusChanged: "pending_confirmation", isAddItems});
        console.log("order gửi gốc")
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayOrder = async () => {
  try {
    console.log("thanh toán thành công!")
    // await payOrderAPI(currentOrderId);
    // socket.emit("orderPaid", { tableNumber });
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="flex flex-col items-center bg-[#fff7ed] min-h-screen py-8 px-4">
      <h1 className="text-3xl font-bold text-[#7c2d12] mb-4">
        🍽️ Thực đơn bàn ngày hôm nay
      </h1>

      {/* Danh sách món */}
      <div className="w-full max-w-[700px] flex flex-col gap-5">
        {menu.map((item) => {
          const order = orders[item._id];
          if (!order) return null; // tránh lỗi render
          const isAvailable = item.status === "available";

          return (
            <div
              key={item._id}
              className={`relative border rounded-xl p-3 shadow-md ${
                isAvailable
                  ? "bg-[#ffedd5] hover:shadow-lg"
                  : "bg-[#fde68a] opacity-70 cursor-not-allowed"
              }`}
            >
              <div className="flex gap-4 items-start">
                <img
                  src={`/images/${item.image}`}
                  alt={item.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex flex-col flex-1">
                  <h2 className="text-lg font-semibold text-[#7c2d12]">{item.name}</h2>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                </div>
              </div>

              {/* Variant */}
              {item.variants.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-[#7c2d12] mb-1">Kích cỡ:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.variants.map((v) => (
                      <label
                        key={v._id}
                        className={`cursor-pointer px-3 py-1 border rounded-full ${
                          order.selectedVariant === v._id
                            ? "bg-[#7c2d12] text-white"
                            : "text-gray-700 border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`variant-${item._id}`}
                          className="hidden"
                          onChange={() => handleVariantSelect(item._id, v._id)}
                        />
                        {v.size} ({v.price.toLocaleString("vi-VN")} ₫)
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings */}
              {item.toppings.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-[#7c2d12] mb-1">Topping:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.toppings.map((t) => (
                      <label
                        key={t._id}
                        className={`cursor-pointer px-3 py-1 border rounded-full ${
                          order.selectedToppings.includes(t._id)
                            ? "bg-[#78350f] text-white"
                            : "text-gray-700 border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          onChange={() => handleToppingToggle(item._id, t._id)}
                        />
                        {t.name} (+{t.price.toLocaleString("vi-VN")} ₫)
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {isAvailable && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#7c2d12] font-medium">Số lượng:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(item._id, -1)}
                      className="bg-[#7c2d12] text-white w-8 h-8 rounded-full"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold text-[#7c2d12] w-6 text-center">
                      {order.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item._id, 1)}
                      className="bg-[#7c2d12] text-white w-8 h-8 rounded-full"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tổng cộng + Gửi order */}

        <div className="bg-gradient-to-r from-amber-800 to-amber-700 text-white flex justify-between items-center p-4 mt-4 rounded-xl shadow-lg">
  {/* Tổng tiền */}
  {progressStatus === "draft" && (
  <div>
    <p className="font-semibold opacity-90">Tổng cộng</p>
    <p className="text-2xl font-bold tracking-wide">
      {totalPrice.toLocaleString("vi-VN")} ₫
    </p>
  </div>
  )}

  {/* Nút hành động */}
  {progressStatus === "draft" && (
    <button
      onClick={() => handleSendOrder(false)} // gửi order lần đầu
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all px-6 py-3 rounded-lg font-semibold shadow-md flex items-center gap-2"
    >
      🚀 Gửi Order
    </button>
  )}

  {progressStatus === "pending_confirmation" && (
    <button
      disabled
      className="bg-yellow-500/80 px-6 py-3 rounded-lg font-semibold shadow-inner cursor-not-allowed flex items-center gap-2"
    >
      ⏳ Đang chờ xác nhận...
    </button>
  )}

  {progressStatus === "processing" && (
    <div className="flex gap-3">
      <button
        onClick={() => handleSendOrder(true)} // thêm món
        className="bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 transition-all px-5 py-3 rounded-lg font-semibold shadow-md flex items-center gap-2"
      >
        ➕ Thêm món
      </button>
     <button
      disabled
      className="bg-blue-500/80 px-6 py-3 rounded-lg font-semibold shadow-inner cursor-not-allowed flex items-center gap-2"
    >
      🍳 Đang chế biến
    </button>
    </div>
  )}

  {progressStatus === "completed" && (
    <div className="flex gap-3">
      <button
        onClick={() => handleSendOrder(true)} // thêm món
        className="bg-gradient-to-r from-green-500 to-lime-600 hover:from-green-600 hover:to-lime-700 transition-all px-5 py-3 rounded-lg font-semibold shadow-md flex items-center gap-2"
      >
        ➕ Thêm món
      </button>
      <button
        onClick={handlePayOrder} // thanh toán
        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all px-5 py-3 rounded-lg font-semibold shadow-md flex items-center gap-2"
      >
        💰 Thanh toán
      </button>
    </div>
  )}
        </div>

      
    </div>
  );
};

export default MenuOrder;
