import { useEffect, useState } from 'react';
import { getMenuAPI } from '@/services/api';
import type { KitchenArea } from '@/types/global';
import { message } from 'antd';
import OrderDetailModal from './modal.order';
import PaymentOrderSummary from './payment.order';
import { socket } from '@/services/socket';

type Variant = { size: string; price: number; _id: string };
type Topping = { name: string; price: number; _id: string };
type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  status: 'available' | 'out_of_stock';
  variants: Variant[];
  toppings: Topping[];
  kitchenArea: KitchenArea;
};

interface IProps {
  currentOrderId: string;
  tableData: { tableId: string; tableNumber: string } | null;
  userInfo?: {
    name: string;
    isGuest: boolean;
    userId?: string;
  };
  setStep?: (step: 'verify' | 'choose' | 'guestName' | 'order') => void;
  setUserInfo?: React.Dispatch<
    React.SetStateAction<{
      name: string;
      isGuest: boolean;
      userId?: string | undefined;
    } | null>
  >;
  statusTable: string;
  setStatusTable: (v: string) => void;
}

type OrderItem = {
  quantity: number;
  selectedVariant?: string;
  selectedToppings: string[];
  kitchenArea?: KitchenArea;
};

const MenuOrder = (props: IProps) => {
  const {
    currentOrderId,
    tableData,
    userInfo, 
    setStep,
    setUserInfo,
    setStatusTable,
  } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Record<string, OrderItem>>({});
  const [isUserAction, setIsUserAction] = useState(false);
  const [realtimeOrder, setRealtimeOrder] = useState<any>(null);
  const [firstOrder, setFirstOrder] = useState<any>(null);
  const [addOrders, setAddOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const tableId = tableData?.tableId || '';
  const tableNumber = tableData?.tableNumber || '';
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [totalPriceFirstOrder, setTotalPriceFirstOrder] = useState<number>(0);
  const [totalPriceAddItems, setTotalPriceAddItems] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<
    'pending_confirmation' | 'processing' | 'completed' | 'draft'
  >('draft');
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderModal | null>(null);

  const handleOpenModal = (order: IOrderModal) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancelOrder = () => {
    setIsModalOpen(false);
  };

  // ======================
  // 1️⃣ Load menu
  // ======================
  useEffect(() => {
    if (!tableId) return;

    const fetchMenu = async () => {
      try {
        const menuRes = await getMenuAPI('pageSize=100');
        const items: MenuItem[] = menuRes.data.result;
        setMenu(items);

        setOrders((prevOrders) => {
          const newOrders = { ...prevOrders };
          items.forEach((item) => {
            if (!newOrders[item._id]) {
              newOrders[item._id] = {
                quantity: 0,
                selectedVariant: item.variants?.[0]?._id,
                selectedToppings: [],
                kitchenArea: item.kitchenArea,
              };
            }
          });
          return newOrders;
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchMenu();
  }, [tableId]);

  // ======================
  // 2️⃣ Socket connection & realtime updates
  // ======================
  useEffect(() => {
    if (!tableNumber || !tableId) return;

    socket.emit('joinTable', { tableNumber, tableId });

    // Nhận order hiện tại từ server
    socket.on('currentOrder', (data) => {
      setRealtimeOrder(data);
      setInitialSyncDone(true);
    });

    socket.on('firstOrder', (data) => {
      setFirstOrder(data);
      setTotalPriceFirstOrder(data.totalPrice);
    });

    socket.on('orderUpdated', (data) => setRealtimeOrder(data));
    socket.on('orderStatusChanged', (status) => {
      setProgressStatus(status);
      if (status === 'draft') {
        message.info('Order của bạn đã bị hủy. Vui lòng gọi món lại.');
      } else if (status === 'processing') {
        message.success('Order của bạn đang được xử lý!');
      } else if (status === 'cleaning') {
        message.success('Bàn của bạn đã xong hẹn gặp lại bạn ở lần sau!');
        setStatusTable('cleaning');
      }
    });
    socket.on('currentOrderProcessing', (status) => setProgressStatus(status));

    const handleMenuStatusUpdate = (updatedItem: any) => {
      setMenu((prev) =>
        prev.map((item) =>
          item._id === updatedItem._id
            ? { ...item, status: updatedItem.status }
            : item,
        ),
      );
    };
    socket.on('menuStatusUpdated', handleMenuStatusUpdate);

    socket.on('addOrders', (data) => {
      setAddOrders(data);
      setTotalPriceAddItems(
        data.reduce((sum: any, batch: any) => sum + batch.totalPrice, 0),
      );
    });

    socket.on('addItemsOrder', (data) => {
      setAddOrders((prev) => [...prev, data]);
    });

    socket.on('completedOrders', (data) => {
      setCompletedOrders(data);
    });

    return () => {
      socket.off('currentOrder');
      socket.off('firstOrder');
      socket.off('orderUpdated');
      socket.off('orderStatusChanged');
      socket.off('currentOrderProcessing');
      socket.off('addOrders');
      socket.off('addItemsOrder');
      socket.off('completedOrders');
      socket.off('menuStatusUpdated', handleMenuStatusUpdate);
    };
  }, [tableNumber, tableId]);

  // ======================
  // 3️⃣ Sync realtimeOrder vào orders
  // ======================
  useEffect(() => {
    if (!realtimeOrder || !realtimeOrder.orderItems) return;

    // ❗ Nếu user đang thao tác → KHÔNG ghi đè state
    if (isUserAction) return;

    setOrders(() => {
      const newOrders: Record<string, OrderItem> = {};

      // reset toàn bộ order theo menu
      menu.forEach((item) => {
        newOrders[item._id] = {
          quantity: 0,
          selectedVariant: item.variants?.[0]?._id,
          selectedToppings: [],
          kitchenArea: item.kitchenArea,
        };
      });

      // áp order từ backend vào
      realtimeOrder.orderItems.forEach((oi: any) => {
        newOrders[oi.menuItemId] = {
          quantity: oi.quantity,
          selectedVariant: oi.variant?._id,
          selectedToppings: oi.toppings?.map((t: any) => t._id) || [],
          kitchenArea: oi.kitchenArea,
        };
      });

      return newOrders;
    });

    if (realtimeOrder.totalPrice != null) {
      setTotalPrice(realtimeOrder.totalPrice);
    }
  }, [realtimeOrder, menu]);

  // ======================
  // 4️⃣ Gửi order khi orders thay đổi
  // ======================
  useEffect(() => {
    if (!initialSyncDone) return;
    if (!isUserAction) return;
    if (!menu.length) return;

    const updateOrder = Object.entries(orders)
      .map(([id, o]) => {
        const item = menu.find((m) => m._id === id);
        if (!item) return null;

        const variant = item.variants.find((v) => v._id === o.selectedVariant);
        const toppings = item.toppings.filter((t) =>
          o.selectedToppings.includes(t._id),
        );

        return {
          menuItemId: item._id,
          name: item.name,
          quantity: o.quantity,
          variant: variant
            ? { _id: variant._id, size: variant.size, price: variant.price }
            : null,
          toppings: toppings.map((t) => ({
            _id: t._id,
            name: t.name,
            price: t.price,
          })),
          kitchenArea: o.kitchenArea || item.kitchenArea,
        };
      })
      .filter(Boolean) as any[];

    const totalPriceCalc = updateOrder.reduce((sum, i) => {
      const base = i.variant
        ? i.variant.price
        : menu.find((m) => m._id === i.menuItemId)?.price || 0;
      const toppingTotal = i.toppings.reduce(
        (tSum: number, t: any) => tSum + t.price,
        0,
      );
      return sum + (base + toppingTotal) * i.quantity;
    }, 0);

    setTotalPrice(totalPriceCalc);

    socket.emit('updateOrder', {
      currentOrderId,
      updateOrder,
      totalPrice: totalPriceCalc,
      tableNumber,
    });

    // reset flag
    setIsUserAction(false);
  }, [orders, initialSyncDone]);

  // ======================
  // 5️⃣ UI handlers
  // ======================
  const handleQuantityChange = (id: string, delta: number) => {
    setIsUserAction(true);
    setOrders((prev) => {
      const prevItem = prev[id];
      const newQuantity = Math.max(0, (prevItem?.quantity || 0) + delta);

      return {
        ...prev,
        [id]: {
          ...prevItem,
          quantity: newQuantity,
          selectedToppings: newQuantity === 0 ? [] : prevItem.selectedToppings,
        },
      };
    });
  };

  const handleVariantSelect = (itemId: string, variantId: string) => {
    setIsUserAction(true);
    setOrders((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], selectedVariant: variantId },
    }));
  };

  const handleToppingToggle = (itemId: string, toppingId: string) => {
    setIsUserAction(true);
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

  const formatDataOrder = () =>
    Object.entries(orders)
      .map(([id, o]) => {
        const item = menu.find((m) => m._id === id);
        if (!item) return null;
        const variant = item.variants.find((v) => v._id === o.selectedVariant);
        const toppings = item.toppings.filter((t) =>
          o.selectedToppings.includes(t._id),
        );
        return {
          menuItemId: item._id,
          name: item.name,
          quantity: o.quantity,
          variant: variant
            ? { _id: variant._id, size: variant.size, price: variant.price }
            : null,
          toppings: toppings.map((t) => ({
            _id: t._id,
            name: t.name,
            price: t.price,
          })),
          kitchenArea: o.kitchenArea || item.kitchenArea,
        };
      })
      .filter(Boolean) as any[];

  const handleSendOrder = (isAddItems: boolean) => {
    const orderItems = formatDataOrder();
    socket.emit('sendOrder', {
      currentOrderId,
      orderItems,
      totalPrice,
      tableNumber,
      isAddItems,
      statusChanged: 'pending_confirmation',
    });
  };

  const handlePayOrder = () => {
    console.log('💰 Thanh toán thành công!');
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!realtimeOrder) return;
    const orderItems = realtimeOrder?.orderItems;
    console.log('Order: ', orderItems);
    if (orderItems.length == 0) {
      message.warning(`Đơn của bạn hiện tại trống không thể gửi order!`);
      setIsModalOpen(false);
      return;
    }
    handleSendOrder(true);
    setIsModalOpen(false);
  };
  return (
    <div>
      {/* Header */}
      <header className="flex fixed top-0 right-0 left-0 z-30 justify-between items-center bg-white shadow p-4">
        <h1 className="font-semibold text-gray-700">
          Bàn {tableData?.tableNumber} – {userInfo?.name}
        </h1>

        <div className="flex items-center gap-3">
          {/* View Order */}
          <button
            onClick={() => setShowOrderPanel(true)}
            className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            👀 Order
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('userInfo');
              setStep!('choose');
              setUserInfo!(null);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Thoát
          </button>
        </div>
      </header>

      {/* Body order */}
      <div className="flex flex-col items-center bg-[#fff7ed] min-h-screen pb-28 pt-8 px-4 mt-16 mb-12">
        {' '}
        {/* add bottom padding so content not hidden by fixed bar */}
        <h1 className="text-3xl font-bold text-[#7c2d12] mb-4">
          🍽️ Thực đơn bàn ngày hôm nay
        </h1>
        {/* Danh sách món */}
        <div className="w-full max-w-[700px] flex flex-col gap-5">
          {menu.map((item) => {
            const order = orders[item._id];
            if (!order) return null; // tránh lỗi render
            const isAvailable = item.status === 'available';

            return (
              <div
                key={item._id}
                className={`relative border rounded-xl p-3 shadow-md ${
                  isAvailable
                    ? 'bg-[#ffedd5] hover:shadow-lg'
                    : 'bg-[#fde68a] opacity-70 cursor-not-allowed'
                }`}
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/images/menu/${
                      item.image
                    }`}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex flex-col flex-1">
                    <h2 className="text-lg font-semibold text-[#7c2d12]">
                      {item.name}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Variant (giữ logic nhưng hiển thị nhỏ, nếu muốn ẩn thì remove this block) */}
                {item.variants.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-[#7c2d12] mb-1">Kích cỡ:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.variants.map((v) => (
                        <label
                          key={v._id}
                          className={`cursor-pointer px-3 py-1 border rounded-full ${
                            order.selectedVariant === v._id
                              ? 'bg-[#7c2d12] text-white'
                              : 'text-gray-700 border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`variant-${item._id}`}
                            className="hidden"
                            onChange={() =>
                              handleVariantSelect(item._id, v._id)
                            }
                          />
                          {v.size} ({v.price.toLocaleString('vi-VN')} ₫)
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
                              ? 'bg-[#78350f] text-white'
                              : 'text-gray-700 border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            onChange={() =>
                              handleToppingToggle(item._id, t._id)
                            }
                          />
                          {t.name} (+{t.price.toLocaleString('vi-VN')} ₫)
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {isAvailable && (
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#7c2d12] font-medium">
                      Số lượng:
                    </span>
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
        {/* ====================== */}
        {/*  Panel xem món đang chế biến (View Order) */}
        {/* ====================== */}
        {showOrderPanel && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex flex-col"
            onClick={() => setShowOrderPanel(false)}
          >
            <div
              className="flex-1 overflow-y-auto bg-white p-5 pt-8 rounded-t-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#7c2d12]">
                  🧾 Chi tiết Order
                </h2>
                <button
                  onClick={() => setShowOrderPanel(false)}
                  className="text-gray-500 text-sm"
                >
                  Đóng
                </button>
              </div>

              {/* Món đang chế biến*/}
              <h2 className="font-semibold text-[#7c2d12] mb-2">
                Món đang chế biến
              </h2>
              <div className="mb-4">
                <h2 className="font-semibold text-[#9d5237] mb-2 ml-2">
                  Món gọi ban đầu
                </h2>
                {firstOrder?.orderItems.length > 0 ? (
                  firstOrder.orderItems.map((oi: any) => (
                    <div
                      key={oi.menuItemId}
                      className="border p-3 rounded-lg mb-2 bg-orange-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-[#7c2d12]">
                            {oi.name}
                          </p>
                          {oi.variant && (
                            <p className="text-sm text-gray-600">
                              Size: {oi.variant.size}
                            </p>
                          )}
                          {oi.toppings?.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Toppings:{' '}
                              {oi.toppings.map((t: any) => t.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right font-semibold">
                          {oi.quantity}×
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    Các món đã được chế biến xong!
                  </p>
                )}
              </div>

              {/* Món thêm sau khi gửi order */}
              <div className="mb-4">
                <h3 className="font-semibold text-[#9d5237] mb-2 ml-2">
                  Món gọi thêm sau
                </h3>
                {addOrders.length > 0 &&
                  (addOrders.filter((a) => a.orderItems.length > 0).length >
                  0 ? (
                    addOrders.map((batch: any) => {
                      if (batch.orderItems.length > 0) {
                        return (
                          <div key={batch.batchId} className="mb-4">
                            <p className="font-medium text-[#9d5237] mb-2 ml-2">
                              Lần gọi mới
                            </p>

                            {batch.orderItems.length > 0 ? (
                              batch.orderItems.map((oi: any) => (
                                <div
                                  key={oi.menuItemId}
                                  className="border p-3 rounded-lg mb-2 bg-orange-100"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-semibold text-[#7c2d12]">
                                        {oi.name}
                                      </p>

                                      {oi.variant?.size && (
                                        <p className="text-sm text-gray-600">
                                          Size: {oi.variant.size}
                                        </p>
                                      )}

                                      {oi.toppings &&
                                        oi.toppings.length > 0 && (
                                          <p className="text-sm text-gray-600">
                                            Toppings:{' '}
                                            {oi.toppings
                                              .map((t: any) => t.name)
                                              .join(', ')}
                                          </p>
                                        )}
                                    </div>
                                    <div className="text-right font-semibold">
                                      {oi.quantity}×
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm ml-2">
                                Chưa có món nào trong lần gọi này.
                              </p>
                            )}
                          </div>
                        );
                      }
                    })
                  ) : (
                    <p className="text-gray-500 text-sm ml-2">
                      Các món đã được chế biến xong!
                    </p>
                  ))}
              </div>

              {/* Món đã chế biến xong */}
              <div className="mb-4">
                <h3 className="font-semibold text-[#7c2d12] mb-2">
                  Món đã xong
                </h3>
                {completedOrders.length > 0 ? (
                  completedOrders.map((oi: any) => (
                    <div
                      key={oi.menuItemId}
                      className="border p-3 rounded-lg mb-2 bg-green-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-[#7c2d12]">
                            {oi.name}
                          </p>
                          {oi.variant && (
                            <p className="text-sm text-gray-600">
                              Size: {oi.variant.size}
                            </p>
                          )}
                          {oi.toppings?.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Toppings:{' '}
                              {oi.toppings.map((t: any) => t.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right font-semibold">
                          {oi.quantity}×
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có món nào xong.</p>
                )}
              </div>
            </div>

            {/* Tổng tiền cố định dưới cùng */}
            <div className="bg-amber-800 text-white p-4 flex justify-between items-center shadow-lg">
              <p className="font-semibold text-lg">Tổng cộng:</p>
              <p className="font-bold text-xl">
                {(totalPriceAddItems + totalPriceFirstOrder).toLocaleString(
                  'vi-VN',
                )}{' '}
                ₫
              </p>
            </div>
          </div>
        )}
        {/* ====================== */}
        <div className="fixed bottom-4 left-0 w-full flex justify-center z-30 pointer-events-none">
          <div className="w-full max-w-[700px] px-4 pointer-events-auto">
            <div className="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-4 rounded-xl shadow-lg">
              {/* Tổng tiền */}
              {(progressStatus === 'draft' ||
                progressStatus === 'processing') && (
                <div className="flex justify-between w-full mb-3">
                  <p className="font-semibold opacity-90">Tổng cộng</p>
                  <p className="text-2xl font-bold tracking-wide">
                    {totalPrice.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              )}

              {/* Nút hành động chính / trạng thái */}
              <div className="flex gap-3 w-full">
                {(progressStatus === 'processing' ||
                  progressStatus === 'completed') && (
                  <>
                    <button
                      onClick={() => {
                        handleOpenModal(realtimeOrder);
                      }}
                      className="bg-gradient-to-r from-green-500 to-lime-600 px-5 py-3 rounded-lg font-semibold shadow-md flex-1"
                    >
                      ➕ Thêm món
                    </button>

                    {progressStatus === 'processing' ? (
                      <button
                        disabled
                        className="bg-blue-500/80 px-5 py-3 rounded-lg font-semibold shadow-inner cursor-not-allowed flex-1"
                      >
                        🍳 Đang chế biến
                      </button>
                    ) : (
                      <button
                        onClick={handlePayOrder}
                        className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 rounded-lg font-semibold shadow-md flex-1"
                      >
                        💰 Thanh toán
                      </button>
                    )}
                  </>
                )}

                {/* Trạng thái khác (draft / pending_confirmation) */}
                {(progressStatus === 'draft' ||
                  progressStatus === 'pending_confirmation') && (
                  <button
                    onClick={() =>
                      progressStatus === 'draft'
                        ? handleSendOrder(false)
                        : undefined
                    }
                    disabled={progressStatus !== 'draft'}
                    className={`px-6 py-3 rounded-lg font-semibold shadow-md w-full ${
                      progressStatus === 'draft'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        : 'bg-yellow-500/80 cursor-not-allowed'
                    }`}
                  >
                    {progressStatus === 'draft'
                      ? '🚀 Gửi Order'
                      : '⏳ Đang chờ xác nhận...'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderDetailModal
        visible={isModalOpen}
        order={selectedOrder}
        onConfirm={handleConfirm}
        onCancel={handleCancelOrder}
      />

      <PaymentOrderSummary
        amount={totalPriceAddItems + totalPriceFirstOrder}
        dataOrder={completedOrders}
        open={open}
        setOpen={setOpen}
        orderId={currentOrderId}
      />
    </div>
  );
};

export default MenuOrder;
