import { getTableAllAPI } from '@/services/api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { message, Button, Popconfirm, Space, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import QRCell from './qrcode';

const PRIMARY = '#FF6B35';

const ManageTablePage = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const confirmDelete = async () => {
    message.success('Xóa bàn thành công!');
    refreshTable();
  };

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 40,
    },
    {
      title: 'Số bàn',
      dataIndex: 'tableNumber',
      width: 80,
    },
    {
      title: 'Vị trí',
      dataIndex: 'descriptionPosition',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Ghế',
      dataIndex: 'seats',
      width: 80,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, entity) =>
        entity.status === 'occupied' ? (
          <Tag color="red">Đang có khách</Tag>
        ) : (
          <Tag color="green">Trống</Tag>
        ),
    },
    {
      title: 'Phục vụ đơn',
      dataIndex: 'currentOrder',
      hideInSearch: true,
      render: (_, entity) =>
        entity.currentOrder ? (
          <Tag color="processing">{entity.currentOrder}</Tag>
        ) : (
          <Tag color="default">Không có</Tag>
        ),
    },
    {
      title: 'Tạo bởi',
      dataIndex: ['createdBy', 'email'],
      hideInSearch: true,
      width: 160,
    },
    {
      title: 'QR Code',
      hideInSearch: true,
      width: 150,
      render: (_, entity) => (
        <QRCell tableNumber={entity.tableNumber} token={entity.token} />
      ),
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      hideInSearch: true,
      width: 160,
    },
    {
      title: 'Hành động',
      hideInSearch: true,
      width: 120,
      render: (_, entity) => (
        <Space>
          <EditOutlined
            style={{ cursor: 'pointer' }}
            onClick={() => {
              message.info('Chức năng sửa bàn đang được xử lý...');
            }}
          />

          <Popconfirm
            placement="leftTop"
            title="Xóa bàn?"
            description="Bạn có chắc muốn xóa bàn này?"
            onConfirm={confirmDelete}
            okText="Xóa"
            cancelText="Hủy"
          >
            <DeleteOutlined style={{ cursor: 'pointer' }} onClick={() => {}} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<any>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          let query = `current=${params.current}&pageSize=${params.pageSize}`;

          if (params.tableNumber)
            query += `&tableNumber=/${params.tableNumber}/i`;

          const res = await getTableAllAPI(query);

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
            total: metaApi.total,
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          total: meta.total,
          showSizeChanger: true,
        }}
        headerTitle="Danh sách bàn"
        toolBarRender={() => [
          <Button
            key="add"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: PRIMARY,
              borderColor: PRIMARY,
            }}
            onClick={() => message.info('Chức năng thêm bàn đang xử lý...')}
            type="primary"
          >
            Thêm bàn mới
          </Button>,
        ]}
      />
    </>
  );
};

export default ManageTablePage;
