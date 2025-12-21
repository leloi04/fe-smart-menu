import { useState } from 'react';
import { Card, Button, Modal, Tag } from 'antd';
import { Printer, Receipt, Eye } from 'lucide-react';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import BillPreview from './bills/review.bill';

// Fake Bills With Order Items
const fakeBills = [
  {
    id: 'HD001',
    tableNumber: '1',
    total: 320000,
    createdAt: '2025-12-12 14:20',
    items: [
      { name: 'Coca Cola', qty: 2, price: 20000 },
      { name: 'Lẩu thái', qty: 1, price: 280000 },
    ],
  },
  {
    id: 'HD002',
    tableNumber: '3',
    total: 540000,
    createdAt: '2025-12-12 15:05',
    items: [
      { name: 'Trà chanh', qty: 3, price: 15000 },
      { name: 'Pizza Hải sản', qty: 1, price: 495000 },
    ],
  },
];

const COLOR_MAP = ['#FCE7F3', '#E0F2FE', '#FEF9C3', '#DCFCE7', '#F3E8FF'];

export default function BillManagementPage() {
  const [previewBill, setPreviewBill] = useState<any | null>(null);

  return (
    <StaffLayout>
      <div className="container px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Quản lý hoá đơn
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {fakeBills.map((bill, index) => (
            <Card
              key={bill.id}
              className="rounded-2xl shadow-md hover:shadow-xl transition-all p-5 border"
            >
              <div className="flex items-center gap-3 mb-4">
                <Receipt size={34} className="text-gray-700" />
                <div>
                  <h3 className="text-xl font-semibold">Hóa đơn #{bill.id}</h3>
                  <p className="text-gray-700 text-sm">{bill.createdAt}</p>
                </div>
              </div>

              <p className="text-gray-800 mb-1">
                <b>Bàn:</b> {bill.tableNumber}
              </p>
              <p className="text-gray-800 mb-1">
                <b>Tổng:</b> {bill.total.toLocaleString()}₫
              </p>

              <Tag color="gold" className="mt-2">
                Đã thanh toán
              </Tag>

              <div className="flex gap-3 mt-5">
                <Button
                  icon={<Eye size={16} />}
                  onClick={() => setPreviewBill(bill)}
                >
                  Xem chi tiết
                </Button>

                <Button
                  type="primary"
                  icon={<Printer size={18} />}
                  onClick={() =>
                    window.open(`/print/bill/${bill.id}`, '_blank')
                  }
                >
                  In bill
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal hiển thị bill tự sinh */}
        <Modal
          open={!!previewBill}
          onCancel={() => setPreviewBill(null)}
          footer={null}
          width={380}
        >
          {previewBill && <BillPreview bill={previewBill} />}
        </Modal>
      </div>
    </StaffLayout>
  );
}
