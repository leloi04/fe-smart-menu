import { useEffect, useState } from 'react';
import {
  Card,
  Avatar,
  Tag,
  Progress,
  Tabs,
  Modal,
  Divider,
  message,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  ShopOutlined,
  FireOutlined,
  CarOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useCurrentApp } from '@/components/context/app.context';
import {
  cancelTableReservationAPI,
  checkInTableAPI,
  completePreOrderAPI,
  fetchPreOrderCompleted,
  fetchPreOrderUncompleted,
  fetchReservationDataInStatusAPI,
} from '@/services/api';
import { Package } from 'lucide-react';
import UpdateUserProfile from '@/components/layout/customers/update.infor';
import UpdatePasswordModal from '@/components/layout/customers/change.password';

/* ================= TYPES ================= */
type ReservationStatus = 'upcoming' | 'checked_in' | 'cancelled' | 'expired';

type Reservation = {
  id: string;
  customer: string;
  time: string;
  people: number;
  status: ReservationStatus;
};

/* ================= COMPONENT ================= */
export default function ProfilePage() {
  const { user } = useCurrentApp();
  const [reservations, setReservations] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalUpdatePassword, setOpenModalUpdatePassword] =
    useState<boolean>(false);
  const [activeTabReservation, setActiveTabReservation] =
    useState<string>('upcoming');

  useEffect(() => {
    if (!activeTabReservation || !user) return;

    const fetchReservations = async () => {
      const data = await fetchReservationDataInStatusAPI(
        activeTabReservation,
        user.phone.toString(),
      );
      const reservations = data.data.map((r: IReservation) => {
        return {
          id: r._id,
          customer: r.customerName,
          time: `${r.date} - ${r.timeSlot}`,
          people: r.capacity,
          status: r.status,
        };
      });
      setReservations(reservations);
    };
    fetchReservations();
  }, [activeTabReservation]);

  const handleCheckIn = async (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    message.success(
      'Check-in thành công! Chúc quý khách một bữa ăn ngon miệng.',
    );
    await checkInTableAPI(id);
  };

  const handleCancelReservation = async (id: string, time: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    message.success(`Hủy đặt bàn thành công thời gian ${time}!`);
    await cancelTableReservationAPI(id);
  };

  const canCheckIn = (reservationTime: string) => {
    const [datePart, timePart] = reservationTime.split(' - ');
    const reservationDate = new Date(`${datePart}T${timePart}:00`);

    const now = new Date();

    const checkInTime = new Date(reservationDate.getTime() - 30 * 60 * 1000);

    return now >= checkInTime && now <= reservationDate;
  };

  const renderReservationCard = (r: Reservation) => (
    <Card key={r.id} className="rounded-xl shadow-sm mb-4">
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <p className="font-semibold">{r.customer}</p>
          <p className="text-gray-600">{r.time}</p>
          <p className="text-gray-600">Số người: {r.people}</p>
        </div>

        <div className="flex items-center gap-3">
          {r.status === 'upcoming' && <Tag color="orange">Chờ check-in</Tag>}
          {r.status === 'checked_in' && <Tag color="green">Đã check-in</Tag>}
          {r.status === 'cancelled' && <Tag color="red">Đã hủy</Tag>}
          {r.status === 'expired' && <Tag color="red">Quá hạn</Tag>}

          {r.status === 'upcoming' && (
            <>
              <button
                disabled={!canCheckIn(r.time)}
                onClick={() => handleCheckIn(r.id)}
                className={`px-3 py-2 rounded-lg text-white ${
                  canCheckIn(r.time)
                    ? 'bg-[#FF6B35]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Check-in
              </button>

              <button
                onClick={() => handleCancelReservation(r.id, r.time)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  /* ================= ORDERS ================= */
  const [activeTabOrder, setActiveTabOrder] = useState<string>('delivering');
  const PAGE_SIZE = 3;
  const [processingOrders, setProcessingOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);

  const [reservationLimit, setReservationLimit] = useState(PAGE_SIZE);
  const [orderLimit, setOrderLimit] = useState(PAGE_SIZE);

  const handleChangeReservationTab = (key: string) => {
    setActiveTabReservation(key);
    setReservationLimit(PAGE_SIZE);
  };

  const handleChangeOrderTab = (key: string) => {
    setActiveTabOrder(key);
    setOrderLimit(PAGE_SIZE);
  };

  function formatDateVN(isoString: string) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  function mapOrder(order: any) {
    const STATUS_PROGRESS: Record<string, number> = {
      pending: 10,
      confirmed: 25,
      preparing: 50,
      ready: 75,
      delivering: 90,
      completed: 100,
      cancelled: 0,
    };

    const latestTracking = order.tracking?.[order.tracking.length - 1];
    const currentStatus = latestTracking?.status ?? 'pending';

    return {
      id: order._id,
      orderCode: order._id.slice(-6).toUpperCase(),
      method: order.method,
      deliveryAddress: order.deliveryAddress,
      pickupTime: order.pickupTime,
      payment: order.payment,
      paymentStatus: order.paymentStatus,
      note: order.note,
      totalPayment: order.totalPayment,
      createdAt: order.createdAt,

      // 🧾 items (SAFE)
      items: (order.orderItems ?? []).map((item: any) => ({
        kitchenArea: item.kitchenArea,
        name: item.name,
        quantity: item.quantity ?? 1,

        // ✅ variant có thể không tồn tại
        variant: item.variant
          ? {
              size: item.variant.size ?? null,
              price: item.variant.price ?? 0,
            }
          : null,

        // ✅ toppings có thể rỗng
        toppings: (item.toppings ?? []).map((t: any) => ({
          name: t.name,
          price: t.price ?? 0,
        })),
      })),

      // 📦 tracking
      tracking: (order.tracking ?? []).map((t: any) => ({
        status: t.status,
        timestamp: t.timestamp,
      })),

      currentStatus,
      progressPercent: STATUS_PROGRESS[currentStatus] ?? 0,
    };
  }

  useEffect(() => {
    if (!activeTabOrder) return;

    const fetchData = async () => {
      if (activeTabOrder === 'delivering') {
        const res = await fetchPreOrderUncompleted();
        setProcessingOrders(res.data.map(mapOrder));
      } else {
        const res = await fetchPreOrderCompleted();
        setCompletedOrders(res.data.map(mapOrder));
      }
    };

    fetchData();
  }, [activeTabOrder]);

  const handleConfirmReceived = async (id: string, orderCode: string) => {
    await completePreOrderAPI(id);
    message.success(`Xác nhận nhận hàng cho đơn ${orderCode} thành công!`);
    setProcessingOrders((prev) => prev.filter((o) => o.id !== id));
  };

  /* ================= ORDER DETAIL ================= */
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  return (
    <div className="container mx-auto px-6 py-10 flex flex-col gap-10">
      {/* ================= ACCOUNT ================= */}
      <Card className="rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {user?.avatar ? (
            <Avatar
              size={96}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
                user.avatar
              }`}
            />
          ) : (
            <Avatar size={96} icon={<UserOutlined />} />
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {user?.name ?? 'Nguyễn Văn A'}
            </h2>
            <p className="text-gray-600">{user?.email ?? 'a@gmail.com'}</p>
            <p className="text-gray-600">{user?.phone ?? '0123 456 789'}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl flex items-center gap-2"
            >
              <EditOutlined /> Chỉnh sửa
            </button>
            <button
              onClick={() => setOpenModalUpdatePassword(true)}
              className="px-4 py-2 bg-gray-100 rounded-xl flex items-center gap-2"
            >
              <LockOutlined /> Đổi mật khẩu
            </button>
          </div>
        </div>
      </Card>

      {/* ================= RESERVATIONS ================= */}
      <section>
        <h2 className="text-xl font-bold mb-4">Lịch đặt bàn</h2>

        <Tabs
          onChange={handleChangeReservationTab}
          items={[
            {
              key: 'upcoming',
              label: 'Đang chờ',
              children: (
                <>
                  {reservations
                    .slice(0, reservationLimit)
                    .map(renderReservationCard)}

                  {reservations.length > reservationLimit && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() =>
                          setReservationLimit((prev) => prev + PAGE_SIZE)
                        }
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                      >
                        Xem thêm
                      </button>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: 'checked_in',
              label: 'Đã check-in',
              children: (
                <>
                  {reservations
                    .slice(0, reservationLimit)
                    .map(renderReservationCard)}

                  {reservations.length > reservationLimit && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() =>
                          setReservationLimit((prev) => prev + PAGE_SIZE)
                        }
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                      >
                        Xem thêm
                      </button>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: 'cancelled-expired',
              label: 'Đã hủy/ Quá hạn',
              children: (
                <>
                  {reservations
                    .slice(0, reservationLimit)
                    .map(renderReservationCard)}

                  {reservations.length > reservationLimit && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() =>
                          setReservationLimit((prev) => prev + PAGE_SIZE)
                        }
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                      >
                        Xem thêm
                      </button>
                    </div>
                  )}
                </>
              ),
            },
          ]}
        />
      </section>

      {/* ================= ORDER TRACKING ================= */}
      <section>
        <h2 className="text-xl font-bold mb-4">Theo dõi đơn hàng</h2>

        <Tabs
          onChange={handleChangeOrderTab}
          items={[
            {
              key: 'delivering',
              label: 'Đang xử lý',
              children: (
                <>
                  {processingOrders.slice(0, orderLimit).map((o) => (
                    <Card key={o.id} className="rounded-xl shadow-sm mb-4">
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="min-w-[180px]">
                          <p className="font-semibold">Mã đơn: {o.orderCode}</p>
                          <p className="text-gray-600">
                            {formatDateVN(o.createdAt)}
                          </p>
                        </div>

                        <div className="flex-1">
                          <Progress percent={o.progressPercent} />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setOpenDetail(true);
                            }}
                            className="px-3 py-2 bg-gray-100 rounded-lg"
                          >
                            Theo dõi
                          </button>

                          <button
                            onClick={() =>
                              handleConfirmReceived(o.id, o.orderCode)
                            }
                            disabled={
                              o.progressPercent <
                              (o.method === 'ship' ? 80 : 70)
                            }
                            className={`px-3 py-2 rounded-lg text-white ${
                              o.progressPercent >=
                              (o.method === 'ship' ? 80 : 70)
                                ? 'bg-[#FF6B35]'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            Đã nhận hàng
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {processingOrders.length > orderLimit && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() =>
                          setOrderLimit((prev) => prev + PAGE_SIZE)
                        }
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                      >
                        Xem thêm đơn hàng
                      </button>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: 'completed',
              label: 'Đã hoàn thành',
              children: (
                <>
                  {completedOrders.slice(0, orderLimit).map((o) => (
                    <Card key={o.id} className="rounded-xl shadow-sm mb-4">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Mã đơn: {o.orderCode}</p>
                        <p className="text-gray-600">
                          {formatDateVN(o.createdAt)}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setOpenDetail(true);
                          }}
                          className="px-3 py-2 bg-gray-100 rounded-lg"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </Card>
                  ))}

                  {completedOrders.length > orderLimit && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() =>
                          setOrderLimit((prev) => prev + PAGE_SIZE)
                        }
                        className="px-4 py-2 bg-gray-100 rounded-lg"
                      >
                        Xem thêm đơn hàng
                      </button>
                    </div>
                  )}
                </>
              ),
            },
          ]}
        />
      </section>

      {/* ================= ORDER DETAIL MODAL ================= */}
      <Modal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        footer={null}
        title={`Chi tiết đơn hàng ${selectedOrder?.orderCode ?? ''}`}
      >
        {selectedOrder && (
          <>
            {/* ================= TIMELINE ================= */}
            <div className="relative pl-6 mb-6">
              {[
                {
                  key: 'confirmed',
                  title: 'Nhà hàng nhận đơn',
                  icon: <ShopOutlined />,
                  statuses: ['pending', 'confirmed'],
                },
                {
                  key: 'preparing',
                  title: 'Chuẩn bị món',
                  icon: <FireOutlined />,
                  statuses: ['preparing'],
                },
                {
                  key: 'ready',
                  title: 'Món đã sẵn sàng',
                  icon: <Package />,
                  statuses: ['ready'],
                },
                {
                  key: 'delivering',
                  title: 'Đang giao',
                  icon: <CarOutlined />,
                  statuses: ['delivering'],
                },
                {
                  key: 'completed',
                  title: 'Hoàn thành',
                  icon: <HomeOutlined />,
                  statuses: ['completed'],
                },
              ].map((step) => {
                const trackingItem = selectedOrder.tracking.find((t: any) =>
                  step.statuses.includes(t.status),
                );

                const active = !!trackingItem;

                return (
                  <div key={step.key} className="flex gap-4 mb-4">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        active
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </div>

                    <div>
                      <p className={active ? 'font-medium' : 'text-gray-400'}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {trackingItem
                          ? new Date(trackingItem.timestamp).toLocaleString(
                              'vi-VN',
                            )
                          : '--:--'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Divider />

            {/* ================= ITEMS ================= */}
            <h3 className="font-semibold mb-2">Danh sách món</h3>

            {(selectedOrder.items ?? []).map((item: any, index: number) => (
              <div key={index} className="mb-4 text-sm">
                {/* Tên món */}
                <p className="font-medium">{item.name}</p>

                {/* Size */}
                {item.variant?.size && (
                  <p className="text-gray-500 text-xs">
                    Size: {item.variant.size}
                  </p>
                )}

                {/* Toppings */}
                {item.toppings?.length > 0 && (
                  <p className="text-gray-500 text-xs">
                    Toppings: {item.toppings.map((t: any) => t.name).join(', ')}
                  </p>
                )}

                {/* Quantity nếu > 1 */}
                {item.quantity > 1 && (
                  <p className="text-gray-400 text-xs">
                    Số lượng: x{item.quantity}
                  </p>
                )}
              </div>
            ))}

            <Divider />

            {/* ================= TOTAL ================= */}
            <div className="text-sm space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng</span>
                <span>{selectedOrder.totalPayment.toLocaleString()}đ</span>
              </div>
            </div>
          </>
        )}
      </Modal>

      <UpdateUserProfile
        openModal={openModal}
        setOpenModal={setOpenModal}
        userData={user}
      />

      <UpdatePasswordModal
        openModal={openModalUpdatePassword}
        setOpenModal={setOpenModalUpdatePassword}
        email={user?.email}
      />
    </div>
  );
}
