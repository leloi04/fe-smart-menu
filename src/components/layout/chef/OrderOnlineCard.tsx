import { Card, message, Modal, Tag } from 'antd';
import { Clock, User, Package } from 'lucide-react';
import { formatIdOrder, formatTime } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import { getPreOrderAPI } from '@/services/api';
import { socket } from '@/services/socket';

interface OrderOnlineCardProps {
  order: {
    id: string;
    customerName: string;
    orderItems: any[];
    createdAt: Date;
    totalItems: number;
    orderItemsCompleted: any[];
  };
  onViewDetail: (customerName: string, timestamp: string, order: any) => void;
}

export default function OrderOnlineCard({
  order,
  onViewDetail,
}: OrderOnlineCardProps) {
  const completedCount = order.orderItemsCompleted.length;
  const [method, setMethod] = useState<string>('');

  useEffect(() => {
    const fetchPreOrder = async () => {
      const res = await getPreOrderAPI(order.id);
      if (res.data) {
        setMethod(res.data.method);
      }
    };

    fetchPreOrder();
  }, [order]);

  const handleCancel = (order: any) => {
    message.success(
      `Đã hủy đơn hàng của khách tên ${
        order.customerName
      } có mã Order - ${formatIdOrder(order.id)}`,
    );
    socket.emit('cancelPreOrder', order.id);
  };

  return (
    <Card
      hoverable
      className="shadow-md hover:shadow-xl transition-all"
      onClick={() =>
        onViewDetail(order.customerName, order.createdAt.toISOString(), order)
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag color="blue" className="text-base font-bold px-3 py-1">
              Order - {formatIdOrder(order.id)}
            </Tag>
            <Tag color="purple" className="text-base font-bold px-3 py-1">
              {method}
            </Tag>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <User size={16} />
          <span className="font-medium">{order.customerName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Package size={16} />
          <span>
            {[...order.orderItems, ...order.orderItemsCompleted].length} món
          </span>
          {completedCount > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-green-600">{completedCount} đã xong</span>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500 border-t pt-2">
          {[...order.orderItems, ...order.orderItemsCompleted]
            .slice(0, 3)
            .map((item) => (
              <div key={item.id} className="truncate">
                • {item.name} x {item.quantity}
              </div>
            ))}
          {[...order.orderItems, ...order.orderItemsCompleted].length > 3 && (
            <div className="text-gray-400">
              ... và {order.orderItems.length - 3} món khác
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={14} />
          <span>{formatTime(order.createdAt)}</span>
        </div>
        <div className="flex justify-end">
          <button
            className="px-3 py-1 text-sm font-medium text-red-600 border border-red-500 rounded hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: `Xác nhận hủy order của khách tên ${order.customerName}`,
                content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
                okText: 'Hủy đơn',
                cancelText: 'Quay lại',
                okButtonProps: { danger: true },
                onOk: async () => {
                  handleCancel(order);
                },
              });
            }}
          >
            Hủy
          </button>
        </div>
      </div>
    </Card>
  );
}
