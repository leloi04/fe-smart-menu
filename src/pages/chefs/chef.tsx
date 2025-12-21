// ChefPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Select, Empty } from 'antd';
import { ChefHat } from 'lucide-react';
import { getKitchenAreaLabel } from '@/utils/helpers';
import ChefLayout from '@/components/layout/chef/layouts/ChefLayout';
import ChefItemCard from '@/components/layout/chef/ChefItemCard';
import type { KitchenArea } from '@/types/global';
import { io, type Socket } from 'socket.io-client';
import { pre } from 'framer-motion/client';

const socket: Socket = io(
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081',
);

const kitchenAreas: KitchenArea[] = ['HOT', 'GRILL', 'COLD', 'DRINK'];

export default function ChefPage() {
  const [selectedArea, setSelectedArea] = useState<KitchenArea>('HOT');
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    socket.emit('joinChefArea', selectedArea);

    socket.on('currentOrderItems', (data) => {
      setOrderItems(data.items);
    });

    socket.on('newOrderItems', (data) => {
      console.log('Received new order items:', data);
      setOrderItems((prevItems) => [...prevItems, ...data]);
    });

    return () => {
      socket.emit('leaveChefArea', selectedArea);
      socket.off('newOrderItems');
      socket.off('currentOrderItems');
    };
  }, [selectedArea]);

  return (
    <ChefLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChefHat size={32} className="text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Khu Bếp - KDS</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Chọn khu:</span>
            <Select
              value={selectedArea}
              onChange={setSelectedArea}
              className="w-48"
              size="large"
              options={kitchenAreas.map((area) => ({
                value: area,
                label: getKitchenAreaLabel(area),
              }))}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {getKitchenAreaLabel(selectedArea)}
          </h3>
          <p className="text-sm text-gray-500">
            {orderItems.length} món đang trong chế biến
          </p>
        </div>

        {orderItems.length === 0 ? (
          <Empty
            description={`Không có món nào cần chế biến ở ${getKitchenAreaLabel(
              selectedArea,
            )}`}
            className="mt-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderItems.map((item, index) => (
              <ChefItemCard key={index} item={item} />
            ))}
          </div>
        )}
      </div>
    </ChefLayout>
  );
}
