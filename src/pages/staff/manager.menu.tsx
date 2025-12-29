import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import { fetchMenuItemsAPI, updateStatusMenuAPI } from '@/services/api';
import { Table, Switch, Tag, Typography, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface MenuItem {
  _id: string;
  name: string;
  image: string;
  kitchenArea: string;
  category: string;
  isAvailable: boolean;
}

const KITCHEN_AREA_LABEL: Record<string, string> = {
  HOT: 'Khu Nóng',
  DRINK: 'Khu Đồ Uống',
  COLD: 'Khu Lạnh',
  GRILL: 'Khu Nướng',
};

export default function MenuStatusTable() {
  const [data, setData] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const res = await fetchMenuItemsAPI();
      if (res.data) {
        const dataMap = (res.data as any).map((i: any) => ({
          _id: i._id,
          name: i.name,
          image: `${import.meta.env.VITE_BACKEND_URL}/images/menu/${i.image}`,
          kitchenArea: i.kitchenArea,
          category: i.category,
          isAvailable: i.status === 'available' ? true : false,
        }));
        setData(dataMap);
      }
    };

    fetchMenuItems();
  }, []);

  // Toggle trạng thái món
  const toggleStatus = async (id: string) => {
    const dataItem = data.find((d) => id === d._id);
    const status = !dataItem?.isAvailable ? 'available' : 'out_of_stock';
    await updateStatusMenuAPI(id, status);
    setData((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item,
      ),
    );
  };

  // =======================
  // TABLE COLUMNS
  // =======================
  const columns: ColumnsType<MenuItem> = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (src) => (
        <Image
          src={src}
          width={90}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 8 }}
          preview={false}
        />
      ),
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Khu bếp',
      dataIndex: 'kitchenArea',
      render: (kitchenArea) => (
        <Text strong>{KITCHEN_AREA_LABEL[kitchenArea]}</Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag color={record.isAvailable ? 'green' : 'red'}>
            {record.isAvailable ? 'Có sẵn' : 'Hết hàng'}
          </Tag>
          <Switch
            checked={record.isAvailable}
            onChange={() => toggleStatus(record._id)}
          />
        </div>
      ),
    },
  ];

  // =======================
  // RENDER
  // =======================
  return (
    <StaffLayout>
      <div className="container px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý trạng thái món ăn
        </h2>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
          bordered
        />
      </div>
    </StaffLayout>
  );
}
