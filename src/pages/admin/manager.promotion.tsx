import { useRef, useState } from 'react';
import {
  ProTable,
  type ActionType,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, Image, Space, Tag, Popconfirm, message, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  deletePromotionAPI,
  getPromotionsAPI,
  reorderPromotionsAPI,
} from '@/services/api';
import CreatePromotion from '@/components/admin/promotion/create.promotion';
import UpdatePromotion from '@/components/admin/promotion/update.promotion';

const PRIMARY = '#FF6B35';

const ManagePromotionPage = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loadingReorder, setLoadingReorder] = useState(false);
  const [promotionData, setPromotionData] = useState<any>(null);

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newData = [...dataSource];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newData.length) return;

    [newData[index], newData[targetIndex]] = [
      newData[targetIndex],
      newData[index],
    ];

    setDataSource(newData);
  };

  const saveOrder = async () => {
    try {
      setLoadingReorder(true);
      const ids = dataSource.map((item) => item._id);
      await reorderPromotionsAPI(ids);
      message.success('Cập nhật thứ tự promotion thành công');
      refreshTable();
    } finally {
      setLoadingReorder(false);
    }
  };

  // ===================== COLUMNS =====================
  const columns: ProColumns<any>[] = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      width: 70,
      align: 'center',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      width: 90,
      hideInSearch: true,
      render: (_, entity) => (
        <Image
          width={70}
          height={45}
          style={{ objectFit: 'cover', borderRadius: 6 }}
          src={`${import.meta.env.VITE_BACKEND_URL}/images/promotion/${
            entity.imageUrl
          }`}
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      ellipsis: true,
      width: 220,
      render: (text) => (
        <Tooltip>
          <strong>{text}</strong>
        </Tooltip>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip>
          <span style={{ color: '#666' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Chế độ',
      dataIndex: 'displayMode',
      width: 110,
      valueEnum: {
        MANUAL: { text: 'Thủ công' },
        AUTO: { text: 'Tự động' },
      },
      render: (_, e) =>
        e.displayMode === 'AUTO' ? (
          <Tag color="blue">AUTO</Tag>
        ) : (
          <Tag>MANUAL</Tag>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 100,
      render: (_, e) =>
        e.status ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="red">Ẩn</Tag>
        ),
    },
    {
      title: 'Hành động',
      width: 200,
      hideInSearch: true,
      render: (_, entity, index) => (
        <Space>
          <ArrowUpOutlined
            style={{
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              color: index === 0 ? '#ccc' : undefined,
            }}
            onClick={() => moveItem(index, 'up')}
          />
          <ArrowDownOutlined
            style={{
              cursor:
                index === dataSource.length - 1 ? 'not-allowed' : 'pointer',
              color: index === dataSource.length - 1 ? '#ccc' : undefined,
            }}
            onClick={() => moveItem(index, 'down')}
          />

          <EditOutlined
            style={{ color: PRIMARY, cursor: 'pointer' }}
            onClick={() => {
              setOpenModalUpdate(true);
              setPromotionData(entity);
            }}
          />

          <Popconfirm
            title="Xóa promotion?"
            description="Bạn có chắc chắn muốn xóa promotion này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              await deletePromotionAPI(entity._id);
              message.success('Đã xóa promotion');
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
    <>
      <ProTable
        rowKey="_id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        dataSource={dataSource}
        request={async (params) => {
          const query = `current=${params.current}&pageSize=${params.pageSize}`;
          const res = await getPromotionsAPI(query);

          const result = res?.data?.result || [];
          setDataSource(result);

          return {
            data: result,
            success: true,
            total: res?.data?.meta?.total || 0,
          };
        }}
        pagination={{ showSizeChanger: true }}
        headerTitle="Quản lý Banner / Promotion"
        toolBarRender={() => [
          <Button
            key="save"
            icon={<SaveOutlined />}
            loading={loadingReorder}
            onClick={saveOrder}
          >
            Lưu thứ tự
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: PRIMARY }}
            onClick={() => {
              setOpenModal(true);
            }}
          >
            Thêm promotion
          </Button>,
        ]}
      />

      <CreatePromotion
        openModal={openModal}
        refreshTable={refreshTable}
        setOpenModal={setOpenModal}
      />

      <UpdatePromotion
        openModal={openModalUpdate}
        promotionData={promotionData}
        refreshTable={refreshTable}
        setOpenModal={setOpenModalUpdate}
      />
    </>
  );
};

export default ManagePromotionPage;
