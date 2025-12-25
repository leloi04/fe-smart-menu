import { formatTime } from '@/utils/helpers';
import { Card, Tag, Progress } from 'antd';
import { Clock, Users } from 'lucide-react';

interface TableCardProps {
  tableNumber: string | number;
  orders: any;
  onViewDetail: (tableNumber: string, timestamp: string) => void;
}

export default function TableCard({
  tableNumber,
  orders,
  onViewDetail,
}: TableCardProps) {
  const progress =
    orders.totalItems > 0
      ? Math.round(
          (orders.orderItemsCompleted.length / orders.totalItems) * 100,
        )
      : 0;

  return (
    <Card
      hoverable
      className="shadow-md hover:shadow-xl transition-all"
      onClick={() => onViewDetail(tableNumber.toString(), orders.timestamp)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Tag color="orange" className="text-lg font-bold px-4 py-1">
            Bàn {tableNumber}
          </Tag>
          {orders.orderItemsCompleted.length === orders.totalItems && (
            <Tag color="green" className="font-semibold">
              Đã xong
            </Tag>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} />
          <span className="font-medium">{orders.totalItems} món</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm">
            {orders.orderItemsCompleted.length} đã xong
          </span>
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
            <span>{formatTime(new Date(orders.timestamp))}</span>
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
