import type { Order } from '@/types';
import { formatTimeShort } from '@/utils/helpers';
import { Modal, Tag, Divider } from 'antd';
import { Package, Clock } from 'lucide-react';

interface TableDetailModalProps {
  orderId?: string;
  order?: Order | null;
  open: boolean;
  onClose: () => void;
}

export default function TableDetailModal({ orderId, order, open, onClose }: TableDetailModalProps) {
  // If an order object is provided, use it. Otherwise we can't look up orders (UI-only mode).
  const current = order ?? null;

  if (!current) {
    // Show a placeholder UI when no order data is supplied.
    return (
      <Modal open={open} onCancel={onClose} footer={null} width={700} title={
        <div className="flex items-center gap-2">
          <Package size={20} className="text-orange-500" />
          <span className="text-lg font-semibold">Chi tiết Order {orderId ? `- ${orderId}` : ''}</span>
        </div>
      }>
        <div className="py-6 text-center text-gray-500">Không có dữ liệu chi tiết. Đây là chế độ giao diện (UI-only).</div>
      </Modal>
    );
  }

  const preparingItems = current.items.filter((item) => 
    item.status === 'preparing' || 
    item.status === 'initial' ||
    item.initialGroup ||
    item.addedGroup
  );
  const initialItems = current.items.filter((item) => item.status === 'initial' && item.initialGroup);
  const addedItems = current.items.filter((item) => item.addedGroup);
  const completedItems = current.items.filter((item) => item.status === 'completed' || item.status === 'served');

  const renderSection = (title: string, items: Order['items'], emptyText: string) => (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Package size={18} className="text-orange-500" />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 ml-6">{emptyText}</p>
      ) : (
        <div className="space-y-2 ml-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between bg-gray-50 p-3 rounded">
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {item.name}
                  {item.variant && <span className="text-sm text-gray-500"> ({item.variant})</span>}
                </div>
                <div className="text-sm text-gray-600">Số lượng: <span className="font-semibold">{item.qty}</span></div>
                {item.toppings && item.toppings.length > 0 && (
                  <div className="text-sm text-gray-500">Topping: {item.toppings.join(', ')}</div>
                )}
                {item.notes && (
                  <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1">Ghi chú: {item.notes}</div>
                )}
              </div>
              <div className="ml-4 text-right">
                {item.status === 'preparing' && item.startTime && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <Clock size={14} />
                    <span>{formatTimeShort(item.startTime)}</span>
                  </div>
                )}
                {item.status === 'completed' && (
                  <Tag color="green">Đã xong</Tag>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={700} title={
      <div className="flex items-center gap-2">
        <Package size={20} className="text-orange-500" />
        <span className="text-lg font-semibold">
          Chi tiết Order - {current.tableNumber !== undefined ? `Bàn ${current.tableNumber}` : current.customerName}
        </span>
      </div>
    }>
      <div className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <Tag color="orange">Mã đơn: {current.id}</Tag>
          <Tag color="blue">{formatTimeShort(current.createdAt)}</Tag>
        </div>

        {current.notes && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p className="text-sm text-gray-700"><strong>Ghi chú đơn:</strong> {current.notes}</p>
          </div>
        )}

        <Divider />

        {/* Phần Món đang chế biến với 2 mục con */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package size={18} className="text-orange-500" />
            Món đang chế biến
          </h3>
          
          {preparingItems.length === 0 ? (
            <p className="text-sm text-gray-400 ml-6">Chưa có món nào đang chế biến.</p>
          ) : (
            <div className="ml-6 space-y-4">
              {/* Mục con 1: Món gọi ban đầu */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Món gọi ban đầu</h4>
                {initialItems.length === 0 ? (
                  <p className="text-xs text-gray-400 ml-4">Chưa có món nào</p>
                ) : (
                  <div className="space-y-2 ml-4">
                    {initialItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {item.name}
                            {item.variant && <span className="text-sm text-gray-500"> ({item.variant})</span>}
                          </div>
                          <div className="text-sm text-gray-600">Số lượng: <span className="font-semibold">{item.qty}</span></div>
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="text-sm text-gray-500">Topping: {item.toppings.join(', ')}</div>
                          )}
                          {item.notes && (
                            <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1">Ghi chú: {item.notes}</div>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          {item.startTime && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Clock size={14} />
                              <span>{formatTimeShort(item.startTime)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mục con 2: Món gọi thêm sau */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Món gọi thêm sau</h4>
                {addedItems.length === 0 ? (
                  <p className="text-xs text-gray-400 ml-4">Chưa có món gọi thêm</p>
                ) : (
                  <div className="space-y-2 ml-4">
                    {addedItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between bg-blue-50 p-3 rounded border-l-4 border-blue-300">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {item.name}
                            {item.variant && <span className="text-sm text-gray-500"> ({item.variant})</span>}
                          </div>
                          <div className="text-sm text-gray-600">Số lượng: <span className="font-semibold">{item.qty}</span></div>
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="text-sm text-gray-500">Topping: {item.toppings.join(', ')}</div>
                          )}
                          {item.notes && (
                            <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1">Ghi chú: {item.notes}</div>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          {item.startTime && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <Clock size={14} />
                              <span>{formatTimeShort(item.startTime)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {renderSection('Món đã xong', completedItems, 'Chưa có món nào hoàn thành.')}
      </div>
    </Modal>
  );
}
