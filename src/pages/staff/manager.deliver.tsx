import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import { Button, Table, Space, Typography, Modal, message } from 'antd';
import { CarOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { socket } from '@/services/socket';

const { Title, Text } = Typography;

const DeliverOrderManagement: React.FC = () => {
  const [dataDelivery, setDataDelivery] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // 🚚 Vận chuyển → remove khỏi list
  const handleShipping = (orderId: string, customerName: string) => {
    const dataUpdate = dataDelivery.filter((o) => o.id !== orderId);
    socket.emit('updatePreOrderDelivery', { orderId, dataUpdate });
    setDataDelivery((prev) => prev.filter((o) => o.id !== orderId));
    message.success(
      `Cập nhật trạng thái vận chuyển thành công cho đơn hàng "${orderId}" của khách hàng ${customerName}!`,
    );
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Khách hàng',
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.customerName}</Text>
          <br />
          <Text type="secondary">{record.phone}</Text>
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'deliveryAddress',
    },
    {
      title: 'Ghi chú',
      render: (_: any, record: any) => <Text>{record.note}</Text>,
    },
    {
      title: 'Hành động',
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setSelectedOrder(record)}
          >
            Xem món
          </Button>

          <Button
            type="primary"
            icon={<CarOutlined />}
            onClick={() => handleShipping(record.id, record.customerName)}
          >
            Vận chuyển
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    socket.emit('getDataPreOrderDelivery');

    socket.on('dataPreOrderDelivery', (data) => {
      setDataDelivery(data);
    });

    return () => {
      socket.off('dataPreOrderDelivery');
    };
  }, []);

  return (
    <StaffLayout>
      <div style={{ padding: 24 }}>
        <Title level={3}>📦 Đơn chờ vận chuyển</Title>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataDelivery}
          bordered
          pagination={false}
        />

        {/* MODAL CHI TIẾT MÓN */}
        <Modal
          open={!!selectedOrder}
          onCancel={() => setSelectedOrder(null)}
          footer={null}
          title={`Chi tiết đơn của khách hàng: ${selectedOrder?.customerName}`}
        >
          {selectedOrder?.orderItems.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text>
                {item.name} × {item.quantity}
              </Text>
            </div>
          ))}

          <hr />

          <Text strong>
            Tổng cộng: {selectedOrder?.totalPayment.toLocaleString()} ₫
          </Text>
        </Modal>
      </div>
    </StaffLayout>
  );
};

export default DeliverOrderManagement;
