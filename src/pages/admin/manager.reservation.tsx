import { getReservationsTableAPI } from '@/services/api';
import {
  ProTable,
  type ProColumns,
  type ActionType,
} from '@ant-design/pro-components';
import { Tag, Space, Button, Popconfirm, message, Tooltip } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';

const PRIMARY = '#FF6B35';

const ManageReservationTablePage = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // === Xóa đặt bàn ===
  const handleDelete = async (id: string) => {
    message.success('Đã xóa phiếu đặt bàn!');
    actionRef.current?.reload();
  };

  // === Tag trạng thái ===
  const statusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Tag color="orange">Đang chờ</Tag>;
      case 'checked_in':
        return <Tag color="blue">Đã xác nhận</Tag>;
      case 'expired':
        return <Tag color="red">Hết hạn</Tag>;
      case 'cancelled':
        return <Tag color="gray">Đã hủy</Tag>;
      default:
        return <Tag>Không rõ</Tag>;
    }
  };

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },

    {
      title: 'Tên khách',
      dataIndex: 'customerName',
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <UserOutlined /> {entity.customerName}
        </span>
      ),
    },

    {
      title: 'Số điện thoại',
      dataIndex: 'customerPhone',
      copyable: true,
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <PhoneOutlined /> {entity.customerPhone}
        </span>
      ),
    },

    {
      title: 'Bàn',
      dataIndex: 'tableId',
      width: 120,
      render: (val) => <b>{val}</b>,
    },

    {
      title: 'Ngày',
      dataIndex: 'date',
      width: 130,
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <CalendarOutlined /> {entity.date}
        </span>
      ),
    },

    {
      title: 'Khung giờ',
      dataIndex: 'timeSlot',
      width: 100,
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <ClockCircleOutlined /> {entity.timeSlot}
        </span>
      ),
    },

    {
      title: 'Số người',
      dataIndex: 'capacity',
      width: 100,
      render: (cap) => (
        <span className="flex items-center gap-1">
          <TeamOutlined /> {cap}
        </span>
      ),
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      filters: true,
      valueEnum: {
        upcoming: { text: 'Đang chờ' },
        checked_in: { text: 'Đã xác nhận' },
        expired: { text: 'Hết hạn' },
        cancelled: { text: 'Đã hủy' },
      },
      width: 130,
      render: (_, entity) => statusColor(entity.status),
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      render: (_, entity) => dayjs(entity.createdAt).format('DD/MM/YYYY HH:mm'),
    },

    {
      title: 'Hành động',
      width: 120,
      hideInSearch: true,
      render: (_, entity) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => message.info('Chức năng xem chi tiết chưa làm')}
          />

          <Popconfirm
            title="Xóa đặt bàn?"
            description="Bạn chắc chắn muốn xóa lịch đặt bàn này?"
            okText="Xóa"
            cancelText="Hủy"
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
      headerTitle="Quản lý đặt bàn"
      cardBordered
      request={async (params) => {
        let query = `current=${params.current}&pageSize=${params.pageSize}`;

        if (params.customerName)
          query += `&customerName=/${params.customerName}/i`;
        if (params.customerPhone)
          query += `&customerPhone=/${params.customerPhone}/i`;
        if (params.status) query += `&status=${params.status}`;
        if (params.date) query += `&date=${params.date}`;

        const res = await getReservationsTableAPI(query);

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
          style={{
            background: PRIMARY,
            borderColor: PRIMARY,
            color: '#fff',
          }}
          onClick={() => actionRef.current?.reload()}
        >
          Thêm lịch mới
        </Button>,
      ]}
    />
  );
};

export default ManageReservationTablePage;
