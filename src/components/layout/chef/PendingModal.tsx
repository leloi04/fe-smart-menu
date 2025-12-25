import { Modal, Tabs, Button, Card, Tag, Space, message } from 'antd';
import {
  Clock,
  Users,
  AlertCircle,
  Bell,
  MapPinned,
  Hourglass,
} from 'lucide-react';
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
  setPendingCount: (v: number) => void;
}

export default function PendingModal(props: PendingModalProps) {
  const { open, onClose, initialTab, setPendingCount } = props;
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>('');
  const [orderTableConfirm, setOrderTableConfirm] = useState<any[]>([]);
  const [orderOnlineConfirm, setOrderOnlineConfirm] = useState<any[]>([]);
  const [activeKey, setActiveKey] = useState<string>(initialTab);

  useEffect(() => {
    // ➤ Lắng nghe sự kiện cập nhật đơn hàng từ server
    socket.on('staffTableNotificationSync', (data) => {
      const dineInOrders = data.map((order: any) => ({
        keyRedis: order?.keyRedis,
        batchId: order?.batchId,
        id: order.id,
        tableNumber: order.tableNumber,
        createdAt: new Date(order.timestamp),
        orderItems: order.orderItems.map((item: any) => ({
          id: item.menuItemId,
          name: item.name,
          qty: item.quantity,
          variant: item.variant || null,
          toppings: item.toppings || [],
          kitchenArea: item.kitchenArea,
        })),
        price: order.totalPrice,
        notes: '', // nếu có trường ghi chú thì map vào đây
      }));

      setOrderTableConfirm(dineInOrders);
    });

    socket.on('newOrderTable', (notification: any) => {
      const newOrder = {
        keyRedis: notification?.keyRedis,
        batchId: notification?.batchId,
        id: notification.id,
        tableNumber: notification.tableNumber,
        createdAt: new Date(notification.timestamp),
        orderItems: notification.orderItems.map((item: any) => ({
          id: item.menuItemId,
          name: item.name,
          qty: item.quantity,
          variant: item.variant || null,
          toppings: item.toppings || [],
          kitchenArea: item.kitchenArea,
        })),
        price: notification.totalPrice,
        notes: '',
      };

      // Push vào state hiện có
      setOrderTableConfirm((prev) => [...prev, newOrder]);
    });

    // ➤ Lắng nghe sự kiện cập nhật đơn hàng từ server
    socket.on('staffPreOrderNotificationSync', (data) => {
      const onlineOrders = data.map((order: any) => ({
        keyRedis: order?.keyRedis,
        id: order.id,
        customerName: order.dataUser.name,
        createdAt: new Date(order.timestamp),
        orderItems: order.orderItems.map((item: any) => ({
          id: item.menuItemId,
          name: item.name,
          qty: item.quantity,
          variant: item.variant || null,
          toppings: item.toppings || [],
          kitchenArea: item.kitchenArea,
        })),
        deliveryAddress: order.deliveryAddress,
        pickupTime: order.pickupTime,
        method: order.method,
        notes: order.note,
      }));

      setOrderOnlineConfirm(onlineOrders);
    });

    socket.on('newOrderPreOrder', (notification: any) => {
      const newOnlineOrders = {
        keyRedis: notification?.keyRedis,
        id: notification.id,
        customerName: notification.dataUser.name,
        createdAt: new Date(notification.timestamp),
        orderItems: notification.orderItems.map((item: any) => ({
          id: item.menuItemId,
          name: item.name,
          qty: item.quantity,
          variant: item.variant || null,
          toppings: item.toppings || [],
          kitchenArea: item.kitchenArea,
        })),
        deliveryAddress: notification.deliveryAddress,
        pickupTime: notification.pickupTime,
        method: notification.method,
        notes: notification.note,
      };

      // Push vào state hiện có
      setOrderOnlineConfirm((prev) => [...prev, newOnlineOrders]);
    });

    return () => {
      socket.off('staffTableNotificationSync');
      socket.off('staffPreOrderNotificationSync');
      socket.off('newOrderTable');
      socket.off('newOrderPreOrder');
    };
  }, [open, activeKey]);

  useEffect(() => {
    if (!orderOnlineConfirm && !orderTableConfirm) return;
    const pendingCount = orderOnlineConfirm.length + orderTableConfirm.length;
    setPendingCount(pendingCount);
  }, [orderOnlineConfirm, orderTableConfirm]);

  // Xác nhận order
  const handleConfirm = async (data: {
    customerName?: string;
    orderId: string;
    tableNumber?: number;
    status: string;
    keyRedis: string;
    batchId?: string;
  }) => {
    const { orderId, keyRedis, status, batchId, tableNumber, customerName } =
      data;
    if (orderId && tableNumber) {
      const orderItems = orderTableConfirm.find(
        (o) => o.id === data.orderId,
      ).orderItems;
      const priceOrder = orderTableConfirm.find(
        (o) => o.id === data.orderId,
      ).price;
      const ordersDineIn = orderTableConfirm.filter((o) => o.id !== orderId);
      message.success(`Đã xác nhận order của bàn ${tableNumber}!`);
      setOrderTableConfirm(ordersDineIn);
      socket.emit('handleConfirmNotifyTable', {
        id: orderId,
        key: 'notification_table_order',
        orderItems,
        priceOrder,
      });
      if (batchId) {
        await handleConfirmOrderAPI(
          orderId,
          { tableNumber: tableNumber.toString() },
          status,
          keyRedis,
          batchId,
        );
      } else {
        await handleConfirmOrderAPI(
          orderId,
          { tableNumber: tableNumber.toString() },
          status,
          keyRedis,
        );
      }
    } else {
      const ordersOnline = orderOnlineConfirm.filter((o) => o.id !== orderId);
      message.success(`Đã xác nhận order khách tên ${customerName}!`);
      setOrderOnlineConfirm(ordersOnline);
      socket.emit('handleConfirmNotifyPreOrder', {
        id: orderId,
        key: keyRedis,
        orderItems: orderOnlineConfirm.find((o) => o.id === orderId).orderItems,
        customerName,
      });
    }
  };

  // Hủy xác nhận order
  const handleCancel = async (data: {
    customerName?: string;
    orderId: string;
    tableNumber?: number;
    keyRedis: string;
    batchId?: string;
  }) => {
    const { keyRedis, orderId, batchId, customerName, tableNumber } = data;
    if (tableNumber) {
      Modal.confirm({
        title: `Xác nhận hủy order của bàn ${tableNumber}`,
        content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
        okText: 'Hủy đơn',
        cancelText: 'Quay lại',
        okButtonProps: { danger: true },
        onOk: async () => {
          const orderDineIn = orderTableConfirm.filter((o) => o.id !== orderId);
          message.info(`Đơn order của bàn ${tableNumber} đã được hủy!`);
          setOrderTableConfirm(orderDineIn);
          socket.emit('handleCancelNotifyTable', {
            id: orderId,
            key: keyRedis,
            batchId,
            keyTb: 'notification_table_order',
          });
          if (batchId) {
            await handleConfirmOrderAPI(
              orderId,
              { tableNumber: tableNumber.toString() },
              'only-processing',
              keyRedis,
            );
          } else {
            await handleConfirmOrderAPI(
              orderId,
              { tableNumber: tableNumber.toString() },
              'draft',
              keyRedis,
            );
          }
        },
      });
    } else if (customerName) {
      Modal.confirm({
        title: `Xác nhận hủy order của khách tên ${customerName}`,
        content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
        okText: 'Hủy đơn',
        cancelText: 'Quay lại',
        okButtonProps: { danger: true },
        onOk: async () => {
          const orderDineIn = orderTableConfirm.filter((o) => o.id !== orderId);
          message.info(`Đơn order của khách tên ${customerName} đã được hủy!`);
          setOrderTableConfirm(orderDineIn);
          socket.emit('handleCancelNotifyPreOrder', {
            id: orderId,
            key: keyRedis,
            keyTb: 'notification_pre-order',
          });
        },
      });
    }
  };

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Tag color="orange" className="text-sm font-semibold">
              {order.tableNumber !== undefined
                ? `Bàn ${order.tableNumber}`
                : order.customerName}
            </Tag>
            {order.batchId && (
              <Tag color="green" className="text-sm font-semibold">
                Gọi thêm
              </Tag>
            )}
            {order.method && (
              <Tag color="purple" className="text-sm font-semibold">
                {order.method}
              </Tag>
            )}
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{formatTime(order.createdAt)}</span>
            </div>
          </div>

          {order.deliveryAddress && (
            <div className="flex  items-center gap-2 text-gray-500 text-sm mt-2 mb-2">
              <MapPinned size={18} />
              <span className="line-clamp-1">
                Địa chỉ nhận hàng: {order.deliveryAddress}
              </span>
            </div>
          )}

          {order.pickupTime && (
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-2 mb-2">
              <Hourglass size={14} />
              <span>Thời gian đến nhận hàng: {order.pickupTime}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-700 font-medium">
              {order.orderItems.length} món
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {order.orderItems.map((item) => (
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
              order.customerName
                ? handleConfirm({
                    orderId: order.id,
                    customerName: order.customerName,
                    status: 'processing',
                    keyRedis: order?.keyRedis!,
                  })
                : handleConfirm({
                    orderId: order.id,
                    tableNumber: order.tableNumber,
                    status: 'processing',
                    keyRedis: order?.keyRedis!,
                    batchId: order.batchId,
                  })
            }
          >
            Xác nhận
          </Button>
          <Button
            danger
            onClick={() =>
              order.customerName
                ? handleCancel({
                    orderId: order.id,
                    customerName: order.customerName,
                    keyRedis: order?.keyRedis!,
                  })
                : handleCancel({
                    orderId: order.id,
                    tableNumber: order.tableNumber,
                    keyRedis: order?.keyRedis!,
                    batchId: order.batchId,
                  })
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
      label: `Đơn bàn (${orderTableConfirm.length})`,
      children: (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {orderTableConfirm.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Không có đơn chờ xác nhận
            </div>
          ) : (
            orderTableConfirm.map(renderOrderCard)
          )}
        </div>
      ),
    },
    {
      key: 'online',
      label: `Đơn online (${orderOnlineConfirm.length})`,
      children: (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {orderOnlineConfirm.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Không có đơn online chờ xác nhận
            </div>
          ) : (
            orderOnlineConfirm.map(renderOrderCard)
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
          onChange={(key) => {
            setActiveKey(key);
          }}
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
