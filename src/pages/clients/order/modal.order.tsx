import { Modal, Button } from "antd";

interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  variant?: { size: string };
  toppings?: { name: string }[];
}

interface ModalProps {
  visible: boolean;
  order: {
    orderItems: OrderItem[];
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrderDetailModal({ visible, order, onConfirm, onCancel }: ModalProps) {
  const items = order?.orderItems ?? [];

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={420}
      title={<p className="text-lg font-semibold text-orange-600">Chi tiết món gọi</p>}
    >
      <div className="mt-3">
        {items.length > 0 ? (
          items.map((oi) => (
            <div
              key={oi.menuItemId}
              className="border p-3 rounded-lg mb-2 bg-orange-50 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#7c2d12]">{oi.name}</p>

                  {oi.variant?.size && (
                    <p className="text-sm text-gray-600">
                        Size: {oi.variant.size}
                    </p>
                )}

                {Array.isArray(oi.toppings) && oi.toppings.length > 0 && (
                    <p className="text-sm text-gray-600">
                        Toppings: {oi.toppings.map((t) => t.name).join(", ")}
                    </p>
                )}

                </div>

                <div className="text-right font-semibold text-orange-700">
                  {oi.quantity}×
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Chưa gọi món.</p>
        )}
      </div>

      {/* --- Footer Buttons --- */}
      <div className="flex justify-end gap-3 pt-4">
        <Button danger onClick={onCancel}>
          Hủy đơn
        </Button>

        <Button type="primary" className="bg-orange-500" onClick={onConfirm}>
          Xác nhận
        </Button>
      </div>
    </Modal>
  );
}
