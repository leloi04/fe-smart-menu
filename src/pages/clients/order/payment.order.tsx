import { createPaymentBankAPI, fetchMenuItemsAPI } from '@/services/api';
import { CreditCard, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  dataOrder: any[];
  amount: number | string;
  orderId?: string;
}

export default function PaymentOrderSummary(props: IProps) {
  const { amount, dataOrder, open, setOpen, orderId } = props;
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchMenu = async () => {
      const res = await fetchMenuItemsAPI();
      if (!res.data) return;

      const items = dataOrder.map((order: any) => {
        const menu = (res.data as any).find(
          (m: any) => m.menuItemId === order._id,
        );

        return {
          ...order,
          menu,
        };
      });

      setOrderItems(items);
    };

    fetchMenu();
  }, [open, dataOrder]);

  // ===== Helper tính tiền =====
  const calcItemPrice = (item: any) => {
    const variantPrice = item?.variant?.price ?? 0;
    const toppingPrice =
      item?.toppings?.reduce((s: number, t: any) => s + t.price, 0) ?? 0;
    if (variantPrice === 0 && toppingPrice === 0) {
      return item.menu?.price * item.quantity;
    }
    return (variantPrice + toppingPrice) * item.quantity;
  };

  const handlePayment = async (type: string) => {
    if (type === 'card') {
      setShowCardPopup(true);
    } else if (type === 'bank') {
      const res = await createPaymentBankAPI(orderId || '', Number(amount));
      if (res.data) {
        console.log('Redirect to bank payment gateway:', res.data.url);
        window.location.href = res.data.url;
      }
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Thanh toán đơn hàng</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-w-xl mx-auto flex flex-col h-[calc(100vh-56px)]">
            <div className="flex-1 overflow-y-auto space-y-4">
              <h3 className="text-base font-semibold">🧾 Danh sách món</h3>

              {orderItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-start border-b pb-2"
                >
                  <div>
                    <p className="font-medium">
                      {item.menu?.name ?? 'Không xác định'}
                    </p>

                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        Size: {item.variant.size}
                      </p>
                    )}

                    <p className="text-sm text-gray-500">SL: {item.quantity}</p>

                    {item?.toppings?.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Topping:{' '}
                        {item.toppings.map((t: any) => t.name).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right font-medium">
                    {calcItemPrice(item).toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}

              {orderItems.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Chưa có món nào
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng thanh toán</span>
                <span className="text-red-500">
                  {Number(amount).toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePayment('card')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition"
                >
                  <CreditCard className="w-5 h-5" />
                  Thanh toán thẻ
                </button>
                <button
                  onClick={() => handlePayment('bank')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium hover:bg-gray-100 transition"
                >
                  <Landmark className="w-5 h-5" />
                  Thanh toán ngân hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCardPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center space-y-4">
            <h3 className="text-lg font-semibold">Thông báo</h3>

            <p className="text-gray-600">
              Vui lòng ra quầy thanh toán hoặc gọi nhân viên để được hỗ trợ
              thanh toán.
            </p>

            <button
              onClick={() => setShowCardPopup(false)}
              className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 transition"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
