import { getOrdersAPI } from '@/services/api';
import {
  ProTable,
  type ProColumns,
  type ActionType,
} from '@ant-design/pro-components';
import { Tag, Space, Button, Popconfirm, message, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';

const PRIMARY = '#FF6B35';

const ManageOrderPage = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Handler xóa / cancel order
  const handleDelete = async (id: string) => {
    message.success('Hủy đơn hàng thành công!');
    actionRef.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },

    {
      title: 'Mã đơn',
      dataIndex: '_id',
      copyable: true,
      width: 220,
    },

    {
      title: 'Bàn',
      dataIndex: 'tableId',
      width: 160,
    },

    {
      title: 'Khách hàng',
      dataIndex: 'customers',
      render: (_, entity) => {
        if (!entity.customers?.length) return '—';
        return entity.customers.map((c: any) => c.name).join(', ');
      },
    },

    {
      title: 'Món ăn',
      dataIndex: 'orderItems',
      width: 160,
      render: (_, entity) => {
        const count = entity.orderItems.length;
        if (count === 0) return '—';

        return (
          <Tooltip
            title={
              <div className="space-y-1">
                {entity.orderItems.map((it: any, i: number) => (
                  <div key={i}>
                    {it.name} x {it.quantity}
                  </div>
                ))}
              </div>
            }
          >
            <span className="cursor-pointer text-blue-600">{count} món</span>
          </Tooltip>
        );
      },
    },

    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      valueType: 'money',
      width: 120,
    },

    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      filters: true,
      valueEnum: {
        paid: { text: 'Đã thanh toán', status: 'Success' },
        unpaid: { text: 'Chưa thanh toán', status: 'Warning' },
      },
      render: (_, entity) =>
        entity.paymentStatus === 'paid' ? (
          <Tag color="green">Đã thanh toán</Tag>
        ) : (
          <Tag color="red">Chưa thanh toán</Tag>
        ),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'progressStatus',
      filters: true,
      valueEnum: {
        draft: { text: 'Nháp' },
        processing: { text: 'Đang xử lý' },
        completed: { text: 'Hoàn tất' },
      },
      render: (_, entity) => {
        switch (entity.progressStatus) {
          case 'draft':
            return <Tag color="orange">Nháp</Tag>;
          case 'processing':
            return <Tag color="blue">Đang xử lý</Tag>;
          case 'completed':
            return <Tag color="green">Hoàn tất</Tag>;
        }
      },
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
    },

    {
      title: 'Hành động',
      hideInSearch: true,
      width: 120,
      render: (_, entity) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => message.info('Xem chi tiết (chưa làm modal)')}
          />
          <Popconfirm
            title="Hủy đơn?"
            description="Bạn có chắc muốn hủy đơn này?"
            okText="Hủy"
            cancelText="Không"
            onConfirm={() => handleDelete(entity._id)}
          >
            <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable
      columns={columns}
      actionRef={actionRef}
      rowKey="_id"
      headerTitle="Quản lý đơn hàng"
      cardBordered
      request={async (params) => {
        let query = `current=${params.current}&pageSize=${params.pageSize}`;

        if (params._id) query += `&_id=/${params._id}/i`;
        if (params.tableId) query += `&tableId=/${params.tableId}/i`;
        if (params.paymentStatus)
          query += `&paymentStatus=${params.paymentStatus}`;
        if (params.progressStatus)
          query += `&progressStatus=${params.progressStatus}`;

        const res = await getOrdersAPI(query);
        const result = res?.data?.result || [];
        const metaApi = res?.data?.meta || {};

        setMeta({
          current: params.current || 1,
          pageSize: params.pageSize || 10,
          total: metaApi.total || 0,
        });

        return {
          data: result,
          success: true,
          total: metaApi.total || 0,
        };
      }}
      pagination={{
        current: meta.current,
        pageSize: meta.pageSize,
        total: meta.total,
        showSizeChanger: true,
      }}
      toolBarRender={() => [
        <Button
          key="refresh"
          style={{ background: PRIMARY, borderColor: PRIMARY, color: '#fff' }}
          onClick={() => actionRef.current?.reload()}
        >
          Tạo đơn hàng mới
        </Button>,
      ]}
    />
  );
};

export default ManageOrderPage;
