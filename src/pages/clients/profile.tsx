import React, { useState } from 'react';
import { Card, Avatar, Tag, Progress, Tabs, Modal } from 'antd';
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

type ReservationStatus = 'upcoming' | 'checked_in' | 'cancelled' | 'expired';

type Reservation = {
  id: number;
  customer: string;
  time: string;
  people: number;
  status: ReservationStatus;
};

type Order = {
  id: string;
  time: string;
  status: 'delivering' | 'completed';
  progress: number;
  step: number;
};

export default function ProfilePage() {
  /* ================= ACCOUNT ================= */
  const { user } = useCurrentApp();

  /* ================= RESERVATIONS ================= */
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 1,
      customer: 'Nguyễn Văn A',
      time: '20/12/2025 - 18:30',
      people: 4,
      status: 'upcoming',
    },
    {
      id: 2,
      customer: 'Nguyễn Văn A',
      time: '19/12/2025 - 18:00',
      people: 2,
      status: 'checked_in',
    },
    {
      id: 3,
      customer: 'Nguyễn Văn A',
      time: '18/12/2025 - 19:00',
      people: 3,
      status: 'cancelled',
    },
  ]);

  const handleCheckIn = (id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'checked_in' } : r)),
    );
  };

  const handleCancel = (id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)),
    );
  };

  const renderReservationCard = (r: Reservation) => (
    <Card key={r.id} className="rounded-xl shadow-sm">
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

          {r.status === 'upcoming' && (
            <>
              <button
                onClick={() => handleCheckIn(r.id)}
                className="px-3 py-2 bg-[#FF6B35] text-white rounded-lg"
              >
                Check-in
              </button>
              <button
                onClick={() => handleCancel(r.id)}
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
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'OD001',
      time: '20/12/2025 - 17:45',
      status: 'delivering',
      progress: 70,
      step: 2,
    },
    {
      id: 'OD002',
      time: '19/12/2025 - 12:20',
      status: 'completed',
      progress: 100,
      step: 3,
    },
  ]);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="container mx-auto px-6 py-10 flex flex-col gap-10">
      {/* ================= ACCOUNT INFO ================= */}
      <Card className="rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <Avatar size={96} icon={<UserOutlined />} />

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-gray-600">{user?.phone}</p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#FF6B35] text-white rounded-xl flex items-center gap-2">
              <EditOutlined /> Chỉnh sửa
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-xl flex items-center gap-2">
              <LockOutlined /> Đổi mật khẩu
            </button>
          </div>
        </div>
      </Card>

      {/* ================= RESERVATION TABS ================= */}
      <section>
        <h2 className="text-xl font-bold mb-4">Lịch đặt bàn</h2>

        <Tabs
          items={[
            {
              key: 'upcoming',
              label: 'Đang chờ',
              children: reservations
                .filter((r) => r.status === 'upcoming')
                .map(renderReservationCard),
            },
            {
              key: 'checked_in',
              label: 'Đã check-in',
              children: reservations
                .filter((r) => r.status === 'checked_in')
                .map(renderReservationCard),
            },
            {
              key: 'cancelled',
              label: 'Đã hủy',
              children: reservations
                .filter((r) => r.status === 'cancelled')
                .map(renderReservationCard),
            },
          ]}
        />
      </section>

      {/* ================= ORDER TRACKING ================= */}
      <section>
        <h2 className="text-xl font-bold mb-4">Theo dõi đơn hàng</h2>

        <div className="grid gap-4">
          {orders.map((o) => (
            <Card key={o.id} className="rounded-xl shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="min-w-[180px]">
                  <p className="font-semibold">Mã đơn: {o.id}</p>
                  <p className="text-gray-600">{o.time}</p>
                </div>

                <div className="flex-1">
                  <Progress percent={o.progress} />
                </div>

                <div className="flex items-center gap-3">
                  <Tag color={o.status === 'completed' ? 'green' : 'blue'}>
                    {o.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                  </Tag>

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
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= ORDER DETAIL – MAP STYLE ================= */}
      <Modal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        footer={null}
        title={`Theo dõi đơn hàng ${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="relative pl-6">
            {[
              {
                title: 'Nhà hàng đã nhận đơn',
                icon: <ShopOutlined />,
                time: '17:45',
              },
              {
                title: 'Đang chuẩn bị món',
                icon: <FireOutlined />,
                time: '17:55',
              },
              {
                title: 'Đang giao hàng',
                icon: <CarOutlined />,
                time: '18:10',
              },
              {
                title: 'Hoàn thành',
                icon: <HomeOutlined />,
                time: '18:25',
              },
            ].map((step, index) => {
              const active = index <= selectedOrder.step;
              return (
                <div key={index} className="flex gap-4 mb-6 relative">
                  {/* Line */}
                  {index < 3 && (
                    <div className="absolute left-[14px] top-8 h-full border-l-2 border-dashed border-gray-300" />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      active
                        ? 'bg-[#FF6B35] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div>
                    <p
                      className={`font-medium ${active ? '' : 'text-gray-400'}`}
                    >
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {active ? step.time : '--:--'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
