import { Card, Tag, Badge } from 'antd';
import { Clock, User, Package } from 'lucide-react';
import { formatTime, getStatusBadge } from '@/utils/helpers';
import type { Order } from '@/types';

interface OrderOnlineCardProps {
  order: Order;
  onViewDetail: (orderId: string) => void;
}

export default function OrderOnlineCard({ order, onViewDetail }: OrderOnlineCardProps) {
  const statusBadge = getStatusBadge(order.status);
  const completedCount = order.items.filter((item) => item.status === 'completed').length;

  return (
    <Card
      hoverable
      className="shadow-md hover:shadow-xl transition-all"
      onClick={() => onViewDetail(order.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag color="blue" className="text-base font-bold px-3 py-1">
              {order.id}
            </Tag>
            <Badge status={statusBadge.color as any} text={statusBadge.text} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <User size={16} />
          <span className="font-medium">{order.customerName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Package size={16} />
          <span>{order.items.length} món</span>
          {completedCount > 0 && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-green-600">{completedCount} đã xong</span>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500 border-t pt-2">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="truncate">
              • {item.name} x {item.qty}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-gray-400">... và {order.items.length - 3} món khác</div>
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
