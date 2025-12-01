import type { Order } from '@/types';
import { formatTime } from '@/utils/helpers';
import { Card, Tag, Progress } from 'antd';
import { Clock, Users } from 'lucide-react';

interface TableCardProps {
  tableNumber: number;
  orders: Order[];
  onViewDetail: (orderId: string) => void;
}

export default function TableCard({ tableNumber, orders, onViewDetail }: TableCardProps) {
  const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);
  const completedItems = orders.reduce(
    (sum, order) => sum + order.items.filter((item) => item.status === 'completed').length,
    0
  );

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const latestOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  return (
    <Card
      hoverable
      className="shadow-md hover:shadow-xl transition-all"
      onClick={() => onViewDetail(orders[0].id)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Tag color="orange" className="text-lg font-bold px-4 py-1">
            Bàn {tableNumber}
          </Tag>
          {orders.some((o) => o.status === 'ready') && (
            <Tag color="green" className="font-semibold">
              Đã xong
            </Tag>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} />
          <span className="font-medium">{totalItems} món</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm">{completedItems} đã xong</span>
        </div>

        <Progress
          percent={progress}
          strokeColor="#10b981"
          trailColor="#fef3c7"
          showInfo={false}
        />

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatTime(latestOrder.createdAt)}</span>
          </div>
          {orders.length > 1 && (
            <Tag color="blue" className="text-xs">
              {orders.length} đơn
            </Tag>
          )}
        </div>
      </div>
    </Card>
  );
}
