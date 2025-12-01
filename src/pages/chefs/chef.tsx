import { useMemo, useState } from 'react';
import { Select, Empty } from 'antd';
import { ChefHat } from 'lucide-react';
import { getKitchenAreaLabel } from '../../utils/helpers';
import type { KitchenArea, Order } from '@/types';
import ChefLayout from '@/components/layout/chef/layouts/ChefLayout';
import ChefItemCard from '@/components/layout/chef/ChefItemCard';
import PendingModal from '@/components/layout/chef/PendingModal';

// UI-only Chef page with inline fake data
export default function ChefPage() {
  // Fake orders data inline
  const fakeOrders: Order[] = [
    {
      id: 'order-1',
      type: 'dine-in',
      tableNumber: 1,
      status: 'preparing',
      items: [
        {
          id: 'item-1',
          name: 'Cơm Gà Xối Mỡ',
          variant: undefined,
          toppings: [],
          qty: 2,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 5 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-2',
          name: 'Canh Chua Cá',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 5 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-3',
          name: 'Trà Chanh',
          variant: undefined,
          toppings: [],
          qty: 2,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'drinks',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 5 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 10 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-2',
      type: 'dine-in',
      tableNumber: 3,
      status: 'preparing',
      items: [
        {
          id: 'item-4',
          name: 'Cơm Tấm Sườn',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 8 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-5',
          name: 'Tôm Nướng',
          variant: undefined,
          toppings: ['Nước chấm'],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'grill',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 8 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-6',
          name: 'Nước Cam',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'drinks',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 8 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 8 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-4',
      type: 'online',
      customerName: 'Nguyễn Văn A',
      status: 'preparing',
      items: [
        {
          id: 'item-9',
          name: 'Phở Bò',
          variant: undefined,
          toppings: ['Hành', 'Mùi'],
          qty: 2,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 12 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-10',
          name: 'Gỏi Cuốn',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'cold',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 12 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 12 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-5',
      type: 'online',
      customerName: 'Trần Thị B',
      status: 'preparing',
      items: [
        {
          id: 'item-12',
          name: 'Cơm Chiên Dương Châu',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'hot',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 6 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-13',
          name: 'Gà Quay Tây Hồ',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'preparing',
          kitchenArea: 'grill',
          initialGroup: undefined,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 6 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 6 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-6',
      type: 'dine-in',
      tableNumber: 2,
      status: 'pending',
      items: [
        {
          id: 'item-14',
          name: 'Mực Xào Dừa',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: 'Không cay',
          status: 'initial',
          kitchenArea: 'grill',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 2 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-15',
          name: 'Rau Muống Xào Tỏi',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'initial',
          kitchenArea: 'hot',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 2 * 60000),
          completedTime: undefined,
        },
      ],
      notes: 'Khách yêu cầu không dầu',
      createdAt: new Date(Date.now() - 2 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
    {
      id: 'order-7',
      type: 'online',
      customerName: 'Lê Văn C',
      status: 'pending',
      items: [
        {
          id: 'item-16',
          name: 'Bánh Chưng',
          variant: undefined,
          toppings: [],
          qty: 2,
          notes: undefined,
          status: 'initial',
          kitchenArea: 'cold',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 1 * 60000),
          completedTime: undefined,
        },
        {
          id: 'item-17',
          name: 'Giò Lụa',
          variant: undefined,
          toppings: [],
          qty: 1,
          notes: undefined,
          status: 'initial',
          kitchenArea: 'cold',
          initialGroup: true,
          addedGroup: undefined,
          startTime: new Date(Date.now() - 1 * 60000),
          completedTime: undefined,
        },
      ],
      notes: undefined,
      createdAt: new Date(Date.now() - 1 * 60000),
      confirmedAt: undefined,
      completedAt: undefined,
    },
  ];

  const [selectedArea, setSelectedArea] = useState<KitchenArea>('hot');
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const orders = fakeOrders;

  type ChefViewItem = {
    id: string;
    name: string;
    variant?: string;
    toppings: string[];
    qty: number;
    notes?: string;
    status: string;
    kitchenArea: KitchenArea;
    initialGroup?: boolean;
    addedGroup?: boolean;
    startTime?: Date;
    completedTime?: Date;
    orderId: string;
    orderType: string;
    tableNumber?: number;
    customerName?: string;
  };

  const items = useMemo<ChefViewItem[]>(() => {
    const preparing = orders.filter((o) => o.status === 'preparing' || o.status === 'pending');
    const list: ChefViewItem[] = [];
    preparing.forEach((order) => {
      order.items
        .filter((it: any) => it.kitchenArea === selectedArea && (it.status === 'preparing' || it.status === 'initial'))
        .forEach((it: any) => {
          const obj: ChefViewItem = {
            id: it.id,
            name: it.name,
            variant: it.variant,
            toppings: it.toppings ?? [],
            qty: it.qty,
            notes: it.notes,
            status: it.status as string,
            kitchenArea: it.kitchenArea,
            initialGroup: it.initialGroup as boolean | undefined,
            addedGroup: it.addedGroup as boolean | undefined,
            startTime: it.startTime,
            completedTime: it.completedTime,
            orderId: order.id,
            orderType: order.type,
            tableNumber: order.tableNumber,
            customerName: order.customerName,
          };
          list.push(obj);
        });
    });
    return list;
  }, [orders, selectedArea]);

  const kitchenAreas: KitchenArea[] = ['hot', 'grill', 'cold', 'drinks'];

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
              options={kitchenAreas.map((area) => ({ value: area, label: getKitchenAreaLabel(area) }))}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{getKitchenAreaLabel(selectedArea)}</h3>
              <p className="text-sm text-gray-500">{items.length} món đang chờ chế biến</p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Empty description={`Không có món nào cần chế biến ở ${getKitchenAreaLabel(selectedArea)}`} className="mt-12" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ChefItemCard key={`${item.orderId}-${item.id}`} item={item as any} onComplete={() => {}} />
            ))}
          </div>
        )}

        <PendingModal open={pendingModalOpen} onClose={() => setPendingModalOpen(false)} initialTab={'dine-in'} dineInOrders={[]} onlineOrders={[]} />
      </div>
    </ChefLayout>
  );
}
