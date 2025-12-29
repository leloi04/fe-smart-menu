import { socket } from '@/services/socket';
import type { Order } from '@/types';
import { formatTime, formatTimeShort } from '@/utils/helpers';
import { Modal, Tag, Divider } from 'antd';
import { Package, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableDetailModalProps {
  tableNumber?: string;
  open: boolean;
  onClose: () => void;
  timestamp: string;
}

export default function TableDetailModal(props: TableDetailModalProps) {
  const { tableNumber, open, onClose, timestamp } = props;
  const [firstOrderItems, setFirstOrderItems] = useState<any[]>([]);
  const [addedOrderBatches, setAddedOrderBatches] = useState<any[]>([]);
  const [completedOrderItems, setCompletedOrderItems] = useState<any[]>([]);
  const [completedOrderItemsSocket, setCompletedOrderItemsSocket] = useState<
    any[]
  >([]);

  useEffect(() => {
    if (!tableNumber) return;

    socket.emit('getDetailTable', tableNumber);

    socket.on('detailTableData', (data) => {
      setFirstOrderItems(data.firstOrder.orderItems || []);
      setAddedOrderBatches(data.addOrders || []);
      setCompletedOrderItemsSocket(data.completedOrders || []);
    });

    return () => {
      socket.off('detailTableData');
    };
  }, [tableNumber]);

  useEffect(() => {
    const result = completedOrderItemsSocket.map((item: any) => ({
      id: item.batchId
        ? `${item.dataKey}-${item.menuItemId}-${item.batchId}`
        : `${item.dataKey}-${item.menuItemId}`,
      name: item.name,
      variant: item.variant ? item.variant.size : null,
      qty: item.quantity,
      toppings: item.toppings?.length
        ? item.toppings.map((t: any) => t.name)
        : [],
      notes: item.notes || null,
      status: 'completed',
      startTime: item.timestamp,
    }));

    setCompletedOrderItems(result);
  }, [completedOrderItemsSocket]);

  const renderSection = (
    title: string,
    items: Order['orderItems'],
    emptyText: string,
  ) => (
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
              key={item.id}
              className="flex items-start justify-between bg-gray-50 p-3 rounded"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {item.name}
                  {item.variant && (
                    <span className="text-sm text-gray-500">
                      {' '}
                      ({item.variant})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Số lượng: <span className="font-semibold">{item.qty}</span>
                </div>
                {item.toppings && item.toppings.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Topping: {item.toppings.join(', ')}
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
        {firstOrderItems.length > 0 || addedOrderBatches.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              Món đang chế biến
            </h3>

            <div className="ml-6 space-y-4">
              {/* Mục con 1: Món gọi ban đầu */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Món gọi ban đầu
                </h4>
                {firstOrderItems.length > 0 ? (
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
                            <span className="font-semibold">
                              {item.quantity}
                            </span>
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
                ) : (
                  <p className="text-sm font-medium text-gray-600 mb-2 ml-2">
                    Các món đã được chế biến xong!
                  </p>
                )}
              </div>

              {/* Mục con 2: Món gọi thêm sau */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Món gọi thêm sau
                </h4>
                {addedOrderBatches.length > 0 &&
                  (addedOrderBatches.filter((a) => a.orderItems.length > 0)
                    .length > 0 ? (
                    addedOrderBatches.map((batch: any) => {
                      if (batch.orderItems.length > 0) {
                        return (
                          <div key={batch.batchId} className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-2 ml-2">
                              Lần gọi mới
                            </p>

                            {batch.orderItems.length > 0 &&
                              batch.orderItems.map((oi: any) => (
                                <div
                                  key={oi.menuItemId}
                                  className="flex items-start justify-between bg-gray-50 p-3 rounded"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800">
                                      {oi.name}
                                      {oi.variant && (
                                        <span className="text-sm text-gray-500">
                                          {' '}
                                          ({oi.variant.size})
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Số lượng:{' '}
                                      <span className="font-semibold">
                                        {oi.quantity}
                                      </span>
                                    </div>
                                    {oi.toppings && oi.toppings.length > 0 && (
                                      <div className="text-sm text-gray-500">
                                        Topping:{' '}
                                        {oi.toppings
                                          .map((t: any) => t.name)
                                          .join(', ')}
                                      </div>
                                    )}
                                    {oi.notes && (
                                      <div className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded mt-1">
                                        Ghi chú: {oi.notes}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4 text-right">
                                    {batch.timestamp && (
                                      <div className="flex ois-center gap-1 text-sm text-blue-600">
                                        <Clock size={14} />
                                        <span>
                                          {formatTime(
                                            new Date(batch.timestamp),
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        );
                      }
                    })
                  ) : (
                    <p className="text-sm font-medium text-gray-600 mb-2 ml-2">
                      Các món đã được chế biến xong!
                    </p>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              Món đang chế biến
            </h3>
            <div className="ml-6 space-y-4">
              <div className="space-y-2 ml-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Không còn món nào cần phải chế biến
                </h4>
              </div>
            </div>
          </div>
        )}

        {renderSection(
          'Món đã xong',
          completedOrderItems,
          'Chưa có món nào hoàn thành.',
        )}
      </div>
    </Modal>
  );
}
