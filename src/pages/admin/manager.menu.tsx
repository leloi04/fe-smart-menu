import CreateMenu from '@/components/admin/menu/create.menu';
import { getMenus } from '@/services/api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { message, Button, Popconfirm, Space, Tag, Image, Select } from 'antd';
import { useRef, useState } from 'react';

const PRIMARY = '#FF6B35';

const ManageMenuPage = () => {
  const [openViewDetail, setOpenViewDetail] = useState(false);
  const [viewDataDetail, setViewDataDetail] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);

  const actionRef = useRef<ActionType | null>(null);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [dataTable, setDataTable] = useState<any[]>([]);
  const [menuData, setMenuData] = useState<any>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const confirmDelete = async () => {
    message.success('Xóa món thành công!');
    refreshTable();
  };

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'STT',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      width: 80,
      hideInSearch: true,
      render: (_, entity) => (
        <Image
          src={
            `${import.meta.env.VITE_BACKEND_URL}/images/menu/${
              entity?.image
            }` || '/default-food.png'
          }
          width={50}
          height={50}
          style={{ borderRadius: 6, objectFit: 'cover' }}
        />
      ),
    },

    {
      title: 'Tên món',
      dataIndex: 'name',
      ellipsis: true,
    },

    {
      title: 'Danh mục',
      dataIndex: 'category',
      valueType: 'select',
      valueEnum: {
        drink: { text: 'Đồ uống' },
        food: { text: 'Món ăn' },
        dessert: { text: 'Tráng miệng' },
      },
    },

    {
      title: 'Giá',
      render(_, entity) {
        return <>{entity.price.toLocaleString('vi-VN')}đ</>;
      },
    },

    {
      title: 'Khu bếp',
      dataIndex: 'kitchenArea',
      valueEnum: {
        HOT: { text: 'Khu Nóng' },
        DRINK: { text: 'Khu Đồ Uống' },
        COLD: { text: 'Khu Lạnh' },
        GRILL: { text: 'Khu Nướng' },
      },
      hideInSearch: false,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      valueEnum: {
        available: { text: 'Còn hàng' },
        out_of_stock: { text: 'Hết hàng' },
      },
      render(_, entity) {
        return entity.status === 'available' ? (
          <Tag color="green">Còn hàng</Tag>
        ) : (
          <Tag color="red">Hết hàng</Tag>
        );
      },
    },

    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      valueType: 'date',
      hideInSearch: true,
    },

    {
      title: 'Hành động',
      hideInSearch: true,
      render: (_, entity) => (
        <Space>
          <EditOutlined
            style={{ cursor: 'pointer', color: PRIMARY }}
            onClick={() => {
              setOpenModalUpdate(true);
              setMenuData(entity);
            }}
          />

          <Popconfirm
            placement="leftTop"
            title="Xóa món ăn?"
            description="Bạn có chắc chắn muốn xóa món này?"
            onConfirm={confirmDelete}
            okText="Xóa"
            cancelText="Hủy"
          >
            <DeleteOutlined
              style={{ cursor: 'pointer', color: 'red' }}
              onClick={() => setMenuId(entity._id)}
            />
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

          if (params.name) query += `&name=/${params.name}/i`;
          if (params.category) query += `&category=${params.category}`;
          if (params.status) query += `&status=${params.status}`;
          if (params.kitchenArea) query += `&kitchenArea=${params.kitchenArea}`;

          const res = await getMenus(query);
          const result = res?.data?.result || [];
          const metaApi = res?.data?.meta || {};

          setMeta({
            current: params?.current || 1,
            pageSize: params?.pageSize || 10,
            total: metaApi.total || 0,
          });

          setDataTable(result);

          return {
            data: result,
            success: true,
            total: metaApi.total || 0,
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          total: meta.total,
          showSizeChanger: true,
        }}
        headerTitle="Danh sách món ăn"
        toolBarRender={() => [
          <Button
            key="add"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: PRIMARY,
              borderColor: PRIMARY,
            }}
            onClick={() => setOpenModal(true)}
            type="primary"
          >
            Thêm món
          </Button>,
        ]}
      />

      <CreateMenu
        openModal={openModal}
        setOpenModal={setOpenModal}
        refreshTable={refreshTable}
      />
    </>
  );
};

export default ManageMenuPage;
