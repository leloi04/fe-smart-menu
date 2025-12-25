// ChefItemCard.tsx
import { Card, Button, Tag, Space } from 'antd';
import { Clock, CheckCircle, Utensils } from 'lucide-react';
import { formatTime, getKitchenAreaLabel } from '@/utils/helpers';
import type { KitchenArea } from '@/types';
import { socket } from '@/services/socket';

interface ChefItemCardProps {
  item: {
    menuItemId: string;
    name: string;
    variant?: { size: string; price: number };
    toppings: { name: string; price: number }[];
    quantity: number;
    notes?: string;
    kitchenArea: KitchenArea;
    startTime?: Date;
    orderType: 'dine-in' | 'online';
    tableNumber?: string;
    customerName?: string;
    dataKey?: string;
    batchId?: string | null;
    timestamp?: string;
  };
}

export default function ChefItemCard({ item }: ChefItemCardProps) {
  const orderRef = item.tableNumber
    ? `Bàn ${item.tableNumber}`
    : ` ${item.customerName}`;

  const handleCompletedItem = async (data: any) => {
    socket.emit('handleCompletedItem', data);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag color="orange" className="font-semibold">
                {orderRef}
              </Tag>
              {item.customerName && (
                <Tag color="green" className="font-semibold">
                  Online
                </Tag>
              )}
              <Tag color="purple">{getKitchenAreaLabel(item.kitchenArea)}</Tag>
              {item.batchId && <Tag color="green">Món gọi thêm</Tag>}
            </div>

            <div className="text-lg font-bold text-gray-800 mb-1">
              {item.name}
              {item.variant && (
                <span className="text-sm font-normal text-gray-500">
                  {' '}
                  ({item.variant.size})
                </span>
              )}
            </div>

            <div className="text-gray-600 mb-2">
              <span className="font-semibold text-xl text-orange-500">
                x{item.quantity}
              </span>
            </div>

            {item.toppings.length > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                <Utensils size={14} className="inline mr-1" />
                Topping:{' '}
                <span className="font-medium">
                  {item.toppings.map((t: any) => t.name).join(', ')}
                </span>
              </div>
            )}

            {item.notes && (
              <div className="bg-yellow-50 border-l-2 border-yellow-400 px-3 py-2 text-sm text-gray-700">
                <strong>Ghi chú:</strong> {item.notes}
              </div>
            )}
          </div>
        </div>

        {item.timestamp && (
          <div className="flex items-center gap-1 text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded">
            <Clock size={14} />
            <span>Bắt đầu: {formatTime(new Date(item.timestamp))}</span>
          </div>
        )}

        <Space className="w-full justify-end">
          <Button
            type="primary"
            icon={<CheckCircle size={16} />}
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleCompletedItem(item)}
          >
            Hoàn thành
          </Button>
        </Space>
      </div>
    </Card>
  );
}
