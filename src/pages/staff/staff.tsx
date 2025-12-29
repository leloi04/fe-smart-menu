import { useEffect, useState } from 'react';
import { Empty, Button } from 'antd';
import { Bell } from 'lucide-react';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import TableCard from '@/components/layout/chef/TableCard';
import OrderOnlineCard from '@/components/layout/chef/OrderOnlineCard';
import PendingModal from '@/components/layout/chef/PendingModal';
import TableDetailModal from '@/components/layout/chef/TableDetailModal';
import { socket } from '@/services/socket';
import OnlineDetailModal from '@/components/layout/chef/OnlineDetailModal';

// UI-only Staff page with inline fake data
export default function StaffPage() {
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [pendingModalTab, setPendingModalTab] = useState<'dine-in' | 'online'>(
    'dine-in',
  );
  const [activeTab, setActiveTab] = useState<'table' | 'online'>('table');
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [detailCustomerName, setDetailCustomerName] = useState<string | null>(
    null,
  );
  const [dineInOrders, setDineInOrders] = useState<any[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [tableData, setTableData] = useState<
    {
      tableNumber: string;
      totalItems: number | string;
      orderItemsCompleted: any[];
      timestamp: string;
      status: string;
    }[]
  >([]);
  const [onlineData, setOnlineData] = useState<any[]>([]);
  const [timestamp, setTimestamp] = useState<string>('');
  const [preOrderDetail, setPreOrderDetail] = useState<any | null>(null);

  useEffect(() => {
    // ➤ Nhân viên join vào phòng staff
    socket.emit('joinStaff');

    // ➤ Lắng nghe sự kiện cập nhật đơn hàng từ server
    socket.on('staffTableNotificationSync', (data) => {
      const dineInOrders = data.map((order: any) => ({
        id: order.id,
      }));

      setDineInOrders(dineInOrders);
    });

    // ➤ Lắng nghe sự kiện cập nhật đơn hàng từ server
    socket.on('staffPreOrderNotificationSync', (data) => {
      const onlineOrders = data.map((order: any) => ({
        id: order.id,
      }));

      setOnlineOrders(onlineOrders);
    });

    socket.on('newOrderTable', (notification: any) => {
      const newOrder = {
        id: notification.id,
      };

      // Push vào state hiện có
      setDineInOrders((prev) => [...prev, newOrder]);
    });

    socket.on('newOrderPreOrder', (notification: any) => {
      const newOrder = {
        id: notification.id,
      };

      // Push vào state hiện có
      setOnlineOrders((prev) => [...prev, newOrder]);
    });

    socket.on('dataTableUpdated', (data) => {
      setTableData((prev) => {
        const idx = prev.findIndex((d) => d.tableNumber === data.tableNumber);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });
    });

    socket.on('dataTable', (data) => {
      setTableData(data);
    });

    socket.on('dataPreOrderUpdated', (data) => {
      const newDataPreOrder = {
        id: data.id,
        customerName: data.customerName,
        orderItems: data.orderItems,
        totalItems: data.totalItems,
        createdAt: new Date(data.timestamp),
        orderItemsCompleted: data.orderItemsCompleted,
      };
      setOnlineData((prev) => [...prev, newDataPreOrder]);
    });

    socket.on('dataPreOrder', (data) => {
      const dataPreOrder = data.map((i: any) => ({
        id: i.id,
        customerName: i.customerName,
        orderItems: i.orderItems,
        totalItems: i.totalItems,
        createdAt: new Date(i.timestamp),
        orderItemsCompleted: i.orderItemsCompleted,
      }));
      setOnlineData(dataPreOrder);
    });

    return () => {
      socket.emit('leaveStaff');
      socket.off('staffTableNotificationSync');
      socket.off('staffPreOrderNotificationSync');
      socket.off('newOrderTable');
      socket.off('newOrderPreOrder');
      socket.off('dataTableUpdated');
      socket.off('dataTable');
      socket.off('dataPreOrderUpdated');
      socket.off('dataPreOrder');
    };
  }, []);

  useEffect(() => {
    const pendingCount = dineInOrders.length + onlineOrders.length;
    setPendingCount(pendingCount);
  }, [dineInOrders, onlineOrders]);

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

            {onlineData.length === 0 ? (
              <Empty
                description="Không có order online nào đang xử lý"
                className="mt-12"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {onlineData.map((order) => (
                  <OrderOnlineCard
                    key={order.id}
                    order={order}
                    onViewDetail={(customerName, timestamp, order) => (
                      setDetailCustomerName(customerName),
                      setTimestamp(timestamp),
                      setPreOrderDetail(order)
                    )}
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
        setPendingCount={setPendingCount}
      />

      {detailOrderId && (
        <TableDetailModal
          tableNumber={detailOrderId}
          timestamp={timestamp}
          open={!!detailOrderId}
          onClose={() => setDetailOrderId(null)}
        />
      )}

      {detailCustomerName && (
        <OnlineDetailModal
          customerName={detailCustomerName}
          timestamp={timestamp}
          order={preOrderDetail}
          open={!!detailCustomerName}
          onClose={() => setDetailCustomerName(null)}
        />
      )}
    </StaffLayout>
  );
}
