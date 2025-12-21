import { Card, Tag, Badge } from 'antd';
import { Clock, User, Package } from 'lucide-react';
import { formatTime, getStatusBadge } from '@/utils/helpers';
import type { Order } from '@/types';

interface OrderOnlineCardProps {
  order: {
    id: string;
    customerName: string;
    orderItems: any[];
    createdAt: Date;
    totalItems: number;
    orderItemsCompleted: any[];
  };
  onViewDetail: (customerName: string, timestamp: string) => void;
}

export default function OrderOnlineCard({
  order,
  onViewDetail,
}: OrderOnlineCardProps) {
  const completedCount = order.orderItemsCompleted.length;

  return (
    <Card
      hoverable
      className="shadow-md hover:shadow-xl transition-all"
      onClick={() =>
        onViewDetail(order.customerName, order.createdAt.toISOString())
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag color="blue" className="text-base font-bold px-3 py-1">
              Order - {order.id}
            </Tag>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <User size={16} />
          <span className="font-medium">{order.customerName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Package size={16} />
          <span>{order.orderItems.length} món</span>
          {completedCount > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-green-600">{completedCount} đã xong</span>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500 border-t pt-2">
          {order.orderItems.slice(0, 3).map((item) => (
            <div key={item.id} className="truncate">
              • {item.name} x {item.quantity}
            </div>
          ))}
          {order.orderItems.length > 3 && (
            <div className="text-gray-400">
              ... và {order.orderItems.length - 3} món khác
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={14} />
          <span>{formatTime(order.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
