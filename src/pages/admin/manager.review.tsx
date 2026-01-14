import { useRef, useState } from 'react';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Space, Tag, Popconfirm, message, Rate, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteReviewAPI, getReviewsAPI } from '@/services/api';

const ManageReviewPage = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [dataSource, setDataSource] = useState<IReviewModal[]>([]);

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  // ===================== COLUMNS =====================
  const columns: ProColumns<IReviewModal>[] = [
    {
      title: 'Loại review',
      dataIndex: 'type',
      width: 120,
      valueEnum: {
        item: { text: 'Món ăn' },
        restaurant: { text: 'Nhà hàng' },
      },
      render: (_, e) =>
        e.type === 'item' ? (
          <Tag color="orange">Món ăn</Tag>
        ) : (
          <Tag color="blue">Nhà hàng</Tag>
        ),
    },
    {
      title: 'Người đánh giá',
      dataIndex: 'user',
      width: 160,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Số sao',
      dataIndex: 'rating',
      width: 120,
      render: (rating) => <Rate disabled defaultValue={rating as any} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Email',
      dataIndex: ['createdBy', 'email'],
      width: 220,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => new Date(date as any).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      width: 110,
      render: (_, e) =>
        e.isDeleted ? (
          <Tag color="red">Đã xóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },
    {
      title: 'Hành động',
      width: 120,
      hideInSearch: true,
      render: (_, entity) => (
        <Space>
          <Popconfirm
            title="Xóa review?"
            description="Bạn có chắc chắn muốn xóa review này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              await deleteReviewAPI(entity._id);
              message.success('Đã xóa review');
              refreshTable();
            }}
          >
            <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProTable
      rowKey="_id"
      actionRef={actionRef}
      columns={columns}
      search={{
        labelWidth: 'auto',
      }}
      dataSource={dataSource}
      request={async (params) => {
        const query = `current=${params.current}&pageSize=${params.pageSize}`;
        const res = await getReviewsAPI(query);

        const result = res?.data?.result || [];
        setDataSource(result);

        return {
          data: result,
          success: true,
          total: res?.data?.meta?.total || 0,
        };
      }}
      pagination={{ showSizeChanger: true }}
      headerTitle="Quản lý đánh giá khách hàng"
    />
  );
};

export default ManageReviewPage;
