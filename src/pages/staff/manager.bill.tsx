import { useMemo, useState } from 'react';
import { Card, Button, Modal, Tag, Empty } from 'antd';
import { Printer, Receipt, Eye } from 'lucide-react';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import BillPreview from './bills/review.bill';

type Bill = {
  id: string;
  type: 'table' | 'online';
  tableNumber?: string;
  customerName?: string;
  total: number;
  createdAt: string;
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
};

const fakeBills: Bill[] = [
  {
    id: 'HD001',
    type: 'table',
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
    type: 'online',
    customerName: 'Nguyễn Văn A',
    total: 540000,
    createdAt: '2025-12-12 15:05',
    items: [
      { name: 'Trà chanh', qty: 3, price: 15000 },
      { name: 'Pizza Hải sản', qty: 1, price: 495000 },
    ],
  },
];

export default function BillManagementPage() {
  const [activeTab, setActiveTab] = useState<'table' | 'online'>('table');
  const [previewBill, setPreviewBill] = useState<any | null>(null);

  const tableBills = useMemo(
    () => fakeBills.filter((b) => b.type === 'table'),
    [],
  );

  const onlineBills = useMemo(
    () => fakeBills.filter((b) => b.type === 'online'),
    [],
  );

  const renderBills = (bills: any[]) => {
    if (bills.length === 0) {
      return <Empty description="Không có hóa đơn" className="mt-12" />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {bills.map((bill) => (
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

            {bill.type === 'table' ? (
              <p>
                <b>Bàn:</b> {bill.tableNumber}
              </p>
            ) : (
              <p>
                <b>Khách:</b> {bill.customerName}
              </p>
            )}

            <p className="mt-1">
              <b>Tổng:</b> {bill.total.toLocaleString()}₫
            </p>

            <Tag color="green" className="mt-2">
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
                onClick={() => window.open(`/print/bill/${bill.id}`, '_blank')}
              >
                In bill
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <StaffLayout>
      <div className="container px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Quản lý hóa đơn</h2>

          <div className="flex gap-2">
            <Button
              type={activeTab === 'table' ? 'primary' : 'default'}
              onClick={() => setActiveTab('table')}
            >
              Theo bàn
            </Button>
            <Button
              type={activeTab === 'online' ? 'primary' : 'default'}
              onClick={() => setActiveTab('online')}
            >
              Online
            </Button>
          </div>
        </div>

        {activeTab === 'table'
          ? renderBills(tableBills)
          : renderBills(onlineBills)}

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
