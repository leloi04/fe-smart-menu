import { socket } from '@/services/socket';
import { formatTimeShort } from '@/utils/helpers';
import { Modal, Tag, Divider } from 'antd';
import { Package, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TableDetailModalProps {
  tableNumber?: string;
  open: boolean;
  onClose: () => void;
  timestamp: string;
}

export default function PendingDetailModal(props: TableDetailModalProps) {
  const { tableNumber, open, onClose, timestamp } = props;
  const hasFetchedData = useRef(false);
  const [firstOrderItems, setFirstOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (!tableNumber) return;

    if (!hasFetchedData.current) {
      socket.emit('getDetailTable', tableNumber);
      hasFetchedData.current = true;
    }

    socket.on('detailTableData', (data) => {
      setFirstOrderItems(data.firstOrder.orderItems || []);
    });

    return () => {
      socket.off('detailTableData');
    };
  }, [tableNumber]);

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
            Chi tiết Order -{' '}
            {tableNumber !== undefined ? `Bàn ${tableNumber}` : 'Online'}
          </span>
        </div>
      }
    >
      <div className="py-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium text-gray-700">Thời gian đặt:</span>
          <Tag color="blue">{formatTimeShort(new Date(timestamp))}</Tag>
        </div>

        {/* {current.notes && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p className="text-sm text-gray-700"><strong>Ghi chú đơn:</strong> {current.notes}</p>
          </div>
        )} */}

        <Divider />

        {/* Phần Món đang chế biến với 2 mục con */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package size={18} className="text-orange-500" />
            Món khách gọi
          </h3>

          <div className="ml-6 space-y-4">
            <div>
              {firstOrderItems.length === 0 ? (
                <p className="text-xs text-gray-400 ml-4">Chưa có món nào</p>
              ) : (
                <div className="space-y-2 ml-4">
                  {firstOrderItems.map((item, index) => (
                    <div
                      key={item.menuItemId || index}
                      className="flex items-start justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {item.name}
                          {item.variant && (
                            <span className="text-sm text-gray-500">
                              {' '}
                              ({item.variant.size})
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Số lượng:{' '}
                          <span className="font-semibold">{item.quantity}</span>
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="text-sm text-gray-500">
                            Topping:{' '}
                            {item.toppings.map((t: any) => t.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1">
                            Ghi chú: {item.notes}
                          </div>
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
        </div>
      </div>
    </Modal>
  );
}
