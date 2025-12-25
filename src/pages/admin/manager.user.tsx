import { deleteUserAPI, getUserAPI } from '@/services/api';
import {
  ProTable,
  type ProColumns,
  type ActionType,
} from '@ant-design/pro-components';
import { Tag, Space, Button, Popconfirm, message } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  PhoneOutlined,
  UserOutlined,
  MailOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import CreateUser from '@/components/admin/user/create.user';

const PRIMARY = '#FF6B35';

const ManageUserPage = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  // === Xóa user ===
  const handleDelete = async (id: string) => {
    if (!id) return;
    await deleteUserAPI(id);
    message.success('Đã xoá người dùng!');
    refreshTable();
  };

  // === Tag role màu sắc ===
  const roleTag = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Tag color="red">Admin</Tag>;
      case 'CHEF':
        return <Tag color="purple">Đầu bếp</Tag>;
      case 'STAFF':
        return <Tag color="blue">Nhân viên</Tag>;
      case 'CUSTOMER':
        return <Tag color="green">Khách hàng</Tag>;
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
      title: 'Tên',
      dataIndex: 'name',
      width: 180,
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <UserOutlined /> {entity.name}
        </span>
      ),
    },

    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <MailOutlined /> {entity.email}
        </span>
      ),
    },

    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 140,
      render: (_, entity) => (
        <span className="flex items-center gap-1">
          <PhoneOutlined /> {entity.phone}
        </span>
      ),
    },

    {
      title: 'Vai trò',
      dataIndex: ['role', 'name'],
      filters: true,
      valueEnum: {
        ADMIN: { text: 'Admin' },
        STAFF: { text: 'Nhân viên' },
        CHEF: { text: 'Đầu bếp' },
        CUSTOMER: { text: 'Khách hàng' },
      },
      width: 130,
      render: (_, entity) => roleTag(entity.role?.name),
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 180,
      render: (_, entity) => dayjs(entity.createdAt).format('DD/MM/YYYY HH:mm'),
    },

    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      width: 180,
      render: (_, entity) => dayjs(entity.updatedAt).format('DD/MM/YYYY HH:mm'),
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
            onClick={() => message.info('Xem chi tiết (chưa làm modal)')}
          />

          <EditOutlined
            style={{ cursor: 'pointer', color: PRIMARY }}
            onClick={() => {
              console.log();
            }}
          />

          <Popconfirm
            title="Xóa người dùng?"
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
    <>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        rowKey="_id"
        headerTitle="Quản lý người dùng"
        cardBordered
        request={async (params) => {
          let query = `current=${params.current}&pageSize=${params.pageSize}`;

          if (params.name) query += `&name=/${params.name}/i`;
          if (params.email) query += `&email=/${params.email}/i`;
          if (params.phone) query += `&phone=/${params.phone}/i`;
          if (params.role) query += `&role=${params.role}`;

          const res = await getUserAPI(query);

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
            onClick={() => setOpenModal(true)}
          >
            Thêm tài khoản
          </Button>,
        ]}
      />

      <CreateUser
        openModal={openModal}
        setOpenModal={setOpenModal}
        refreshTable={refreshTable}
      />
    </>
  );
};

export default ManageUserPage;
