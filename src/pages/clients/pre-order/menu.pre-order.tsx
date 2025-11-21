import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getMenuAPI } from "@/services/api";

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

type OrderItem = {
  quantity: number;
  selectedVariant?: string;
  selectedToppings: string[];
};

interface IProps {
  orderItems: Record<string, OrderItem>;
  setOrderItems: React.Dispatch<React.SetStateAction<Record<string, OrderItem>>>;
}

const socket: Socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8081");

const MenuPreOrder = ({ orderItems, setOrderItems }: IProps) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  // Lấy menu
  useEffect(() => {
    const fetchMenu = async () => {
      const res = await getMenuAPI("pageSize=100");
      const items = res.data.result;
      setMenu(items);

      // Khởi tạo orderItems nếu chưa có
      const initOrders: Record<string, OrderItem> = {};
      items.forEach((item: MenuItem) => {
        initOrders[item._id] = {
          quantity: 0,
          selectedVariant: item.variants?.[0]?._id,
          selectedToppings: [],
        };
      });
      setOrderItems(initOrders);
    };
    fetchMenu();
  }, []);

  // Realtime menu status
  useEffect(() => {
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
      socket.off("menuStatusUpdated", handleMenuStatusUpdate);
    };
  }, []);

  const handleQuantityChange = (id: string, delta: number) => {
    setOrderItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        quantity: Math.max(0, (prev[id]?.quantity || 0) + delta),
      },
    }));
  };

  const handleVariantSelect = (itemId: string, variantId: string) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], selectedVariant: variantId },
    }));
  };

  const handleToppingToggle = (itemId: string, toppingId: string) => {
    setOrderItems((prev) => {
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

  return (
    <div className="flex flex-col gap-5">
      {menu.map((item) => {
        const order = orderItems[item._id];
        if (!order) return null;
        const isAvailable = item.status === "available";

        return (
          <div
            key={item._id}
            className={`border rounded-xl p-3 shadow-md ${
              isAvailable ? "bg-[#ffedd5]" : "bg-[#fde68a] opacity-70 cursor-not-allowed"
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
  );
};

export default MenuPreOrder;
