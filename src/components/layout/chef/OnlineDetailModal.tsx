import { formatTimeShort } from '@/utils/helpers';
import { Modal, Tag, Divider } from 'antd';
import { Package, Clock } from 'lucide-react';

interface TableDetailModalProps {
  customerName?: string;
  open: boolean;
  onClose: () => void;
  timestamp: string;
  order: any;
}

export default function OnlineDetailModal(props: TableDetailModalProps) {
  const { customerName, open, onClose, timestamp, order } = props;

  const renderSection = (title: string, items: any[], emptyText: string) => (
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
            <div
              key={item.id || item.menuItemId}
              className="flex items-start justify-between bg-gray-50 p-3 rounded"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {item.name}
                  {item.variant && (
                    <span className="text-sm text-gray-500">
                      {' '}
                      (
                      {typeof item.variant === 'string'
                        ? item.variant
                        : item.variant.size}
                      )
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Số lượng:{' '}
                  <span className="font-semibold">
                    {item.qty ?? item.quantity}
                  </span>
                </div>
                {item.toppings && item.toppings.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Topping: {item.toppings.map((t: any) => t.name).join(', ')}
                  </div>
                )}
                {item.notes && (
                  <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1">
                    Ghi chú: {item.notes}
                  </div>
                )}
              </div>
              <div className="ml-4 text-right">
                {item.timestamp && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <Clock size={14} />
                    <span>{formatTimeShort(new Date(item.timestamp))}</span>
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
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      title={
        <div className="flex items-center gap-2">
          <Package size={20} className="text-orange-500" />
          <span className="text-lg font-semibold">
            Chi tiết Order - Khách {customerName}
          </span>
        </div>
      }
    >
      <div className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium text-gray-700">Thời gian đặt:</span>
          <Tag color="blue">{formatTimeShort(new Date(timestamp))}</Tag>
        </div>

        <Divider />

        {renderSection(
          'Món đang chế biến',
          order.orderItems ?? [],
          'Chưa có món nào đang chế biến.',
        )}

        {renderSection(
          'Món đã xong',
          order.orderItemsCompleted ?? [],
          'Chưa có món nào hoàn thành.',
        )}
      </div>
    </Modal>
  );
}
