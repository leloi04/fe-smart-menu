import { useMemo, useState } from 'react';
import { Empty, Button } from 'antd';
import { Bell } from 'lucide-react';
import type { Order } from '@/types';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import TableCard from '@/components/layout/chef/TableCard';
import OrderOnlineCard from '@/components/layout/chef/OrderOnlineCard';
import PendingModal from '@/components/layout/chef/PendingModal';
import TableDetailModal from '@/components/layout/chef/TableDetailModal';

// UI-only Staff page with inline fake data
export default function StaffPage() {
  // Fake orders data inline
  const fakeOrders: Order[] = [
    {
      id: 'order-1',
      type: 'dine-in',
      tableNumber: 1,
      status: 'preparing',
      items: [
        {
          id: 'item-1',
          name: 'Cơm Gà Xối Mỡ',
          variant: undefined,
          toppings: [],
          qty: 2,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 5 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-2',
          name: 'Canh Chua Cá',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 5 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-3',
          name: 'Trà Chanh',
          variant: undefined,
          toppings: [],
          qty: 2,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'drinks',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 5 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 10 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-2',
      type: 'dine-in',
      tableNumber: 3,
      status: 'preparing',
      items: [
        {
          id: 'item-4',
          name: 'Cơm Tấm Sườn',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 8 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-5',
          name: 'Tôm Nướng',
          variant: undefined,
          toppings: ['Nước chấm'],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'grill',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 8 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-6',
          name: 'Nước Cam',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'drinks',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 8 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 8 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-3',
      type: 'dine-in',
      tableNumber: 5,
      status: 'ready',
      items: [
        {
          id: 'item-7',
          name: 'Bánh Mỳ Thập Cẩm',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'completed',
          kitchenArea: 'cold',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 15 * 60000),
          completedTime: new Date(Date.now() - 2 * 60000),
        },
        {
          id: 'item-8',
          name: 'Cà Phê Đen',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'completed',
          kitchenArea: 'drinks',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 15 * 60000),
          completedTime: new Date(Date.now() - 2 * 60000),
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 15 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-4',
      type: 'online',
      customerName: 'Nguyễn Văn A',
      status: 'preparing',
      items: [
        {
          id: 'item-9',
          name: 'Phở Bò',
          variant: undefined,
          toppings: ['Hành', 'Mùi'],
          qty: 2,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 12 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-10',
          name: 'Gỏi Cuốn',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'cold',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 12 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-11',
          name: 'Nước Suối',
          variant: undefined,
          toppings: [],
          qty: 3,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'drinks',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 12 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 12 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-5',
      type: 'online',
      customerName: 'Trần Thị B',
      status: 'preparing',
      items: [
        {
          id: 'item-12',
          name: 'Cơm Chiên Dương Châu',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 6 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-13',
          name: 'Gà Quay Tây Hồ',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'grill',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 6 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 6 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-6',
      type: 'dine-in',
      tableNumber: 2,
      status: 'pending',
      items: [
        {
          id: 'item-14',
          name: 'Mực Xào Dừa',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: 'Không cay',
          status: 'initial',
          kitchenArea: 'grill',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 2 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-15',
          name: 'Rau Muống Xào Tỏi',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'initial',
          kitchenArea: 'hot',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 2 * 60000),
          completedTime: undefined,
        },
      ],
      notes: 'Khách yêu cầu không dầu',
      createdAt: new Date(Date.now() - 2 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-7',
      type: 'online',
      customerName: 'Lê Văn C',
      status: 'pending',
      items: [
        {
          id: 'item-16',
          name: 'Bánh Chưng',
          variant: undefined,
          toppings: [],
          qty: 2,
          notes: undefined,
          status: 'initial',
          kitchenArea: 'cold',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 1 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-17',
          name: 'Giò Lụa',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'initial',
          kitchenArea: 'cold',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 1 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 1 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
  ];

  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingModalTab, setPendingModalTab] = useState<'dine-in' | 'online'>('dine-in');
  const [activeTab, setActiveTab] = useState<'table' | 'online'>('table');
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const orders = fakeOrders;

  // Group dine-in orders by table
  const tableOrders = useMemo(() => {
    const grouped = new Map<number, Order[]>();
    orders.forEach((order) => {
      if (order.type === 'dine-in' && (order.status === 'preparing' || order.status === 'ready')) {
        if (order.tableNumber) {
          const existing = grouped.get(order.tableNumber) || [];
          grouped.set(order.tableNumber, [...existing, order]);
        }
      }
    });
    return grouped;
  }, [orders]);

  // Get online orders
  const onlinePreparingOrders = useMemo(() => {
    return orders.filter((o) => o.type === 'online' && (o.status === 'preparing' || o.status === 'ready'));
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  const handleOpenPendingModal = (type: 'dine-in' | 'online') => {
    setPendingModalTab(type);
    setPendingModalOpen(true);
  };

  return (
    <StaffLayout
      headerActions={
        <Button onClick={() => handleOpenPendingModal(activeTab === 'table' ? 'dine-in' : 'online')} className="flex items-center gap-2">
          <Bell size={16} />
          Đang chờ ({pendingCount})
        </Button>
      }
    >
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'table' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Order theo bàn</h2>
              <Button type="default" onClick={() => setActiveTab('online')}>Xem Online</Button>
            </div>

            {tableOrders.size === 0 ? (
              <Empty description="Không có order nào đang xử lý" className="mt-12" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from(tableOrders.entries()).map(([tableNumber, tableOrderList]) => (
                  <TableCard
                    key={tableNumber}
                    tableNumber={tableNumber}
                    orders={tableOrderList}
                    onViewDetail={(orderId) => setDetailOrderId(orderId)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Online (Đang xử lý)</h2>
              <Button type="default" onClick={() => setActiveTab('table')}>Xem Theo Bàn</Button>
            </div>

            {onlinePreparingOrders.length === 0 ? (
              <Empty description="Không có order online nào đang xử lý" className="mt-12" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {onlinePreparingOrders.map((order) => (
                  <OrderOnlineCard
                    key={order.id}
                    order={order}
                    onViewDetail={(orderId) => setDetailOrderId(orderId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PendingModal open={pendingModalOpen} onClose={() => setPendingModalOpen(false)} initialTab={pendingModalTab} dineInOrders={orders.filter((o) => o.type === 'dine-in' && o.status === 'pending')} onlineOrders={orders.filter((o) => o.type === 'online' && o.status === 'pending')} />

      {detailOrderId && <TableDetailModal orderId={detailOrderId} order={orders.find((o) => o.id === detailOrderId)} open={!!detailOrderId} onClose={() => setDetailOrderId(null)} />}
    </StaffLayout>
  );
}
