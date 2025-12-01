import type { OrderItem } from '@/types';
import { formatTime, getKitchenAreaLabel } from '@/utils/helpers';
import { Card, Button, Tag, Space } from 'antd';
import { Clock, PlayCircle, CheckCircle, Utensils } from 'lucide-react';

interface ChefItemCardProps {
  item: OrderItem & {
    orderId: string;
    orderType: string;
    tableNumber?: number;
    customerName?: string;
  };
  onStart?: (orderId: string, itemId: string) => void;
  onComplete: (orderId: string, itemId: string) => void;
}

export default function ChefItemCard({ item, onStart, onComplete }: ChefItemCardProps) {
  const orderRef =
    item.orderType === 'dine-in' ? `Bàn ${item.tableNumber}` : item.customerName || 'Online';

  return (
    <Card
      className="shadow-md hover:shadow-lg transition-shadow"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="orange" className="font-semibold">
                {orderRef}
              </Tag>
              <Tag color="purple">{getKitchenAreaLabel(item.kitchenArea)}</Tag>
            </div>

            <div className="text-lg font-bold text-gray-800 mb-1">
              {item.name}
              {item.variant && <span className="text-sm font-normal text-gray-500"> ({item.variant})</span>}
            </div>

            <div className="text-gray-600 mb-2">
              <span className="font-semibold text-xl text-orange-500">x{item.qty}</span>
            </div>

            {item.toppings.length > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                <Utensils size={14} className="inline mr-1" />
                Topping: <span className="font-medium">{item.toppings.join(', ')}</span>
              </div>
            )}

            {item.notes && (
              <div className="bg-yellow-50 border-l-2 border-yellow-400 px-3 py-2 text-sm text-gray-700">
                <strong>Ghi chú:</strong> {item.notes}
              </div>
            )}
          </div>
        </div>

        {item.startTime && (
          <div className="flex items-center gap-1 text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded">
            <Clock size={14} />
            <span>Bắt đầu: {formatTime(item.startTime)}</span>
          </div>
        )}

        <Space className="w-full justify-end">
          {onStart && !item.startTime && (
            <Button
              icon={<PlayCircle size={16} />}
              onClick={() => onStart(item.orderId, item.id)}
            >
              Bắt đầu
            </Button>
          )}
          <Button
            type="primary"
            icon={<CheckCircle size={16} />}
            className="bg-green-500 hover:bg-green-600"
            onClick={() => onComplete(item.orderId, item.id)}
          >
            Hoàn thành
          </Button>
        </Space>
      </div>
    </Card>
  );
}
