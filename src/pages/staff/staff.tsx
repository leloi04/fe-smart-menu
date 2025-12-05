import { useEffect, useMemo, useState } from 'react';
import { Empty, Button } from 'antd';
import { Bell } from 'lucide-react';
import type { Order } from '@/types';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import TableCard from '@/components/layout/chef/TableCard';
import OrderOnlineCard from '@/components/layout/chef/OrderOnlineCard';
import PendingModal from '@/components/layout/chef/PendingModal';
import TableDetailModal from '@/components/layout/chef/TableDetailModal';
import { socket } from '@/services/socket';

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
  const [pendingModalTab, setPendingModalTab] = useState<'dine-in' | 'online'>(
    'dine-in',
  );
  const [activeTab, setActiveTab] = useState<'table' | 'online'>('table');
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [dineInOrders, setDineInOrders] = useState<any[]>([]);
  const [tableData, setTableData] = useState<
    {
      tableNumber: string;
      totalItems: number | string;
      orderItemsCompleted: any[];
      timestamp: string;
    }[]
  >([]);
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    // ➤ Nhân viên join vào phòng staff
    socket.emit('joinStaff');

    // ➤ Lắng nghe sự kiện cập nhật đơn hàng từ server
    socket.on('staffNotificationSync', (data) => {
      console.log('Received staffNotificationSync: ', data);
      const dineInOrders = data.map((order: any) => ({
        id: order.id, // tạo id mới
        tableNumber: order.tableNumber,
        createdAt: new Date(order.timestamp),
        items: order.orderItems.map((item: any) => ({
          id: item.menuItemId,
          name: item.name,
          qty: item.quantity,
          variant: item.variant || null,
          toppings: item.toppings || [],
          kitchenArea: item.kitchenArea,
        })),
        notes: '', // nếu có trường ghi chú thì map vào đây
      }));

      setDineInOrders(dineInOrders);
    });

    socket.on('newOrderTable', (notification: any) => {
      const newOrder = {
        id: notification.id, // tạo id mới
        tableNumber: notification.tableNumber,
        createdAt: new Date(notification.timestamp),
        items: notification.orderItems.map((item: any) => ({
          id: item.menuItemId,
          name: item.name,
          qty: item.quantity,
          variant: item.variant || null,
          toppings: item.toppings || [],
          kitchenArea: item.kitchenArea,
        })),
        notes: '',
      };

      // Push vào state hiện có
      setDineInOrders((prev) => [...prev, newOrder]);
    });

    if (activeTab === 'table') {
      socket.on('dataTableUpdated', (data) => {
        console.log('Data table updated: ', data);
        setTableData((prev) => [...prev, data]);
      });

      socket.on('dataTable', (data) => {
        setTableData(data);
      });
    } else {
      console.log('activeTab: ', activeTab);
    }

    return () => {
      socket.emit('leaveStaff');
      socket.off('staffNotificationSync');
      socket.off('newOrderTable');
      socket.off('dataTableUpdated');
      socket.off('dataTable');
    };
  }, [activeTab]);

  const orders = fakeOrders;

  // Get online orders
  const onlinePreparingOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.type === 'online' &&
        (o.status === 'preparing' || o.status === 'ready'),
    );
  }, [orders]);

  const pendingCount = useMemo(() => {
    const dineInLength = dineInOrders.length;
    const onlineLength = orders.filter(
      (o) => o.type === 'online' && o.status === 'pending',
    ).length;
    return dineInLength + onlineLength;
  }, [orders, dineInOrders]);

  const handleOpenPendingModal = (type: 'dine-in' | 'online') => {
    setPendingModalTab(type);
    setPendingModalOpen(true);
  };

  return (
    <StaffLayout
      headerActions={
        <Button
          onClick={() =>
            handleOpenPendingModal(activeTab === 'table' ? 'dine-in' : 'online')
          }
          className="flex items-center gap-2"
        >
          <Bell size={16} />
          Đang chờ ({pendingCount})
        </Button>
      }
    >
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'table' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Order theo bàn
              </h2>
              <Button type="default" onClick={() => setActiveTab('online')}>
                Xem Online
              </Button>
            </div>

            {tableData.length === 0 ? (
              <Empty
                description="Không có order của bàn nào đang xử lý"
                className="mt-12"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tableData.map((item) => (
                  <TableCard
                    key={item.tableNumber}
                    tableNumber={item.tableNumber}
                    orders={item}
                    onViewDetail={(tableNumber, timestamp) => (
                      setDetailOrderId(tableNumber), setTimestamp(timestamp)
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Order Online (Đang xử lý)
              </h2>
              <Button type="default" onClick={() => setActiveTab('table')}>
                Xem Theo Bàn
              </Button>
            </div>

            {onlinePreparingOrders.length === 0 ? (
              <Empty
                description="Không có order online nào đang xử lý"
                className="mt-12"
              />
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

      <PendingModal
        open={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
        initialTab={pendingModalTab}
        onlineOrders={orders.filter(
          (o) => o.type === 'online' && o.status === 'pending',
        )}
      />

      {detailOrderId && (
        <TableDetailModal
          tableNumber={detailOrderId}
          timestamp={timestamp}
          open={!!detailOrderId}
          onClose={() => setDetailOrderId(null)}
        />
      )}
    </StaffLayout>
  );
}
