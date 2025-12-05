import { Modal, Tabs, Button, Card, Tag, Space, message } from 'antd';
import { Clock, Users, AlertCircle, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Order } from '@/types';
import { formatTime } from '@/utils/helpers';
import { handleConfirmOrderAPI } from '@/services/api';
import PendingDetailModal from './PendingDetailModal';
import { socket } from '@/services/socket';

interface PendingModalProps {
  open: boolean;
  onClose: () => void;
  initialTab: 'dine-in' | 'online';
  onlineOrders?: Order[];
}

export default function PendingModal(props: PendingModalProps) {
  const { open, onClose, initialTab, onlineOrders = [] } = props;
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>('');
  const [orderComfirm, setOrderComfirm] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState<string>(initialTab);

  useEffect(() => {
    // ➤ Lắng nghe sự kiện cập nhật đơn hàng từ server
    socket.on('staffNotificationSync', (data) => {
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

      setOrderComfirm(dineInOrders);
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
      setOrderComfirm((prev) => [...prev, newOrder]);
    });

    console.log('Socket listeners for PendingModal set up.');

    return () => {
      socket.off('staffNotificationSync');
      socket.off('newOrderTable');
    };
  }, [open]);

  const handleConfirm = async (
    orderId: string,
    tableNumber: number,
    status: string,
  ) => {
    const orderDineIn = orderComfirm.filter((o) => o.id !== orderId);
    // const orderItems = orderComfirm.find((o) => o.id === orderId)?.items;
    if (orderId && tableNumber) {
      message.success(`Đã xác nhận order của bàn ${tableNumber}!`);
      setOrderComfirm(orderDineIn);
      socket.emit('handleConfirmNotify', orderDineIn);
      await handleConfirmOrderAPI(orderId, tableNumber.toString(), status);
    } else {
      message.error(`Xác nhận không thành công order của bàn ${tableNumber}!`);
      console.error('Invalid orderId or tableNumber for confirming order.');
    }
  };

  const handleCancel = (
    orderId: string,
    tableNumber: number,
    status: string,
  ) => {
    Modal.confirm({
      title: `Xác nhận hủy order của bàn ${tableNumber}`,
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk: async () => {
        const orderDineIn = orderComfirm.filter((o) => o.id !== orderId);
        message.info(`Đơn order của bàn ${tableNumber} đã được hủy!`);
        setOrderComfirm(orderDineIn);
        socket.emit('handleConfirmNotify', orderDineIn);
        await handleConfirmOrderAPI(orderId, tableNumber.toString(), status);
      },
    });
  };

  const renderOrderCard = (order: Order) => (
    <Card
      key={order.id}
      className="mb-4 hover:shadow-lg transition-shadow"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Tag color="orange" className="text-sm font-semibold">
              {order.tableNumber !== undefined
                ? `Bàn ${order.tableNumber}`
                : order.customerName}
            </Tag>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{formatTime(order.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-700 font-medium">
              {order.items.length} món
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="ml-2">
                • {item.name} x {item.qty}
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
              <span className="text-sm text-gray-700">{order.notes}</span>
            </div>
          )}
        </div>

        <Space direction="vertical" className="ml-4">
          <Button
            type="link"
            size="small"
            onClick={() => (
              setDetailOrderId(order.tableNumber!.toString()),
              setTimestamp(order.createdAt as any)
            )}
          >
            Xem chi tiết
          </Button>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600"
            onClick={() =>
              handleConfirm(
                order.id,
                order.tableNumber ? order.tableNumber : 123,
                'processing',
              )
            }
          >
            Xác nhận
          </Button>
          <Button
            danger
            onClick={() =>
              handleCancel(
                order.id,
                order.tableNumber ? order.tableNumber : 123,
                'draft',
              )
            }
          >
            Hủy
          </Button>
        </Space>
      </div>
    </Card>
  );

  const items = [
    {
      key: 'dine-in',
      label: `Đơn bàn (${orderComfirm.length})`,
      children: (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {orderComfirm.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Không có đơn chờ xác nhận
            </div>
          ) : (
            orderComfirm.map(renderOrderCard)
          )}
        </div>
      ),
    },
    {
      key: 'online',
      label: `Đơn online (${onlineOrders.length})`,
      children: (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {onlineOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Không có đơn online chờ xác nhận
            </div>
          ) : (
            onlineOrders.map(renderOrderCard)
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={800}
        title={
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-orange-500" />
            <span className="text-lg font-semibold">Đơn chờ xác nhận</span>
          </div>
        }
        className="top-8"
      >
        <Tabs
          defaultActiveKey={initialTab}
          onChange={(key) => setActiveKey(key)}
          items={items}
        />
      </Modal>

      {detailOrderId && (
        <PendingDetailModal
          tableNumber={detailOrderId}
          timestamp={timestamp}
          open={!!detailOrderId}
          onClose={() => setDetailOrderId(null)}
        />
      )}
    </>
  );
}
