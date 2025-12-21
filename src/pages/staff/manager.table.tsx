import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import { Select } from 'antd';
import { getAllTableAPI } from '@/services/api';

const STATUS_OPTIONS = [
  { value: 'empty', label: 'Trống' },
  { value: 'occupied', label: 'Đang phục vụ' },
  { value: 'cleaning', label: 'Đang dọn' },
];

const BACKGROUND_COLORS: any = {
  empty: 'bg-green-100 text-green-600',
  occupied: 'bg-red-100 text-red-600',
  cleaning: 'bg-yellow-100 text-yellow-600',
};

const BORDER_COLORS: any = {
  empty: 'border-green-300',
  occupied: 'border-red-300',
  cleaning: 'border-yellow-300',
};

const TableStatusPage = () => {
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    const fetchTable = async () => {
      const res = await getAllTableAPI();
      if (res.data) {
        const tables = res.data.map((table) => ({
          id: table._id,
          number: table.tableNumber,
          seats: table.seats,
          status: table.status,
        }));
        setTables(tables);
      }
    };

    fetchTable();
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id ? { ...table, status: newStatus } : table,
      ),
    );
  };

  return (
    <StaffLayout>
      <div className="container px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý trạng thái bàn
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 bg-white pb-12 ${
                BORDER_COLORS[table.status]
              }`}
            >
              <div className="flex flex-col items-center">
                <Users className="w-10 h-10 text-gray-600 mb-3" />

                <h3 className="text-lg font-semibold text-gray-900">
                  Bàn {table.number}
                </h3>

                <p className="text-gray-600 text-sm mb-3">
                  {table.seats} chỗ ngồi
                </p>

                <Select
                  value={table.status}
                  onChange={(value) => updateStatus(table.id, value)}
                  options={STATUS_OPTIONS}
                  className={`rounded-full text-center font-medium px-3 py-1 w-35 ${
                    BACKGROUND_COLORS[table.status]
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
};

export default TableStatusPage;
