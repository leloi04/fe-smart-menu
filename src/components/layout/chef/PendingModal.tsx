import { Modal, Tabs, Button, Card, Tag, Space, message } from 'antd';
import { Clock, Users, AlertCircle, Bell } from 'lucide-react';
import { useState } from 'react';
import TableDetailModal from './TableDetailModal';
import type { Order } from '@/types';
import { formatTime } from '@/utils/helpers';

interface PendingModalProps {
  open: boolean;
  onClose: () => void;
  initialTab: 'dine-in' | 'online';
  // UI-only props: arrays can be supplied by the caller. If omitted, modal shows empty UI.
  dineInOrders?: Order[];
  onlineOrders?: Order[];
  onConfirm?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
}

export default function PendingModal({ open, onClose, initialTab, dineInOrders = [], onlineOrders = [], onConfirm, onCancelOrder }: PendingModalProps) {
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  // Get the order object for detail view
  const detailOrder = detailOrderId ? [...dineInOrders, ...onlineOrders].find((o) => o.id === detailOrderId) : null;

  const handleConfirm = (orderId: string) => {
    if (onConfirm) onConfirm(orderId);
    message.success('Đơn đã được xác nhận (UI-only)');
  };

  const handleCancel = (orderId: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy đơn',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn',
      cancelText: 'Quay lại',
      okButtonProps: { danger: true },
      onOk: () => {
        if (onCancelOrder) onCancelOrder(orderId);
        message.info('Đơn hàng đã được hủy (UI-only)');
      },
    });
  };

  console.log("Rendering PendingModal with dineInOrders:", dineInOrders, "and onlineOrders:", onlineOrders);

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="mb-4 hover:shadow-lg transition-shadow" bodyStyle={{ padding: '16px' }}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Tag color="orange" className="text-sm font-semibold">
              {order.tableNumber !== undefined ? `Bàn ${order.tableNumber}` : order.customerName}
            </Tag>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{formatTime(order.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-gray-700 font-medium">{order.items.length} món</span>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="ml-2">• {item.name} x {item.qty}</div>
            ))}
          </div>

          {order.notes && (
            <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
              <span className="text-sm text-gray-700">{order.notes}</span>
            </div>
          )}
        </div>

        <Space direction="vertical" className="ml-4">
          <Button type="link" size="small" onClick={() => setDetailOrderId(order.id)}>Xem chi tiết</Button>
          <Button type="primary" className="bg-green-500 hover:bg-green-600" onClick={() => handleConfirm(order.id)}>Xác nhận</Button>
          <Button danger onClick={() => handleCancel(order.id)}>Hủy</Button>
        </Space>
      </div>
    </Card>
  );

  const items = [
    {
      key: 'dine-in',
      label: `Đơn bàn (${dineInOrders.length})`,
      children: (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {dineInOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Không có đơn chờ xác nhận</div>
          ) : (
            dineInOrders.map(renderOrderCard)
          )}
        </div>
      ),
    },
    {
      key: 'online',
      label: `Đơn online (${onlineOrders.length})`,
      children: (
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {onlineOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Không có đơn online chờ xác nhận</div>
          ) : (
            onlineOrders.map(renderOrderCard)
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal open={open} onCancel={onClose} footer={null} width={800} title={<div className="flex items-center gap-2"><Bell size={20} className="text-orange-500" /><span className="text-lg font-semibold">Đơn chờ xác nhận</span></div>} className="top-8">
        <Tabs defaultActiveKey={initialTab} items={items} />
      </Modal>

      {detailOrderId && (
        <TableDetailModal orderId={detailOrderId} order={detailOrder} open={!!detailOrderId} onClose={() => setDetailOrderId(null)} />
      )}
    </>
  );
}
