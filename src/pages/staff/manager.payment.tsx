import { useEffect, useState } from 'react';
import { Table, Button, Modal, Radio, message, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import StaffLayout from '@/components/layout/chef/layouts/StaffLayout';
import { formatIdOrder } from '@/utils/helpers';
import {
  createPaymnetAPI,
  fetchOrderUnpaymentAPI,
  handleChangeStatusTableAPI,
} from '@/services/api';

interface Order {
  id: string;
  tableInfo?: {
    tableNumber: string;
  };
  customerInfo?: {
    name: string;
    phone: string;
  };
  amount: number;
  orderItems: any[];
}

export default function StaffPaymentManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderUnpayment = async () => {
      const res = await fetchOrderUnpaymentAPI();
      if (res?.data) {
        setOrders(res.data);
      }
    };
    fetchOrderUnpayment();
  }, []);

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const orderIn = selectedOrder.tableInfo ? 'table' : 'online';

      await createPaymnetAPI(
        selectedOrder.id,
        selectedOrder.amount,
        paymentMethod,
        orderIn,
      );

      message.success(
        `Đã xác nhận thanh toán đơn ${formatIdOrder(selectedOrder.id)} (${
          paymentMethod === 'cash' ? 'Tiền mặt' : 'Ngân hàng'
        })`,
      );

      await handleChangeStatusTableAPI(selectedOrder.tableInfo._id, 'cleaning');

      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));

      setSelectedOrder(null);
      setPaymentMethod('cash');
    } catch (error: any) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          'Thanh toán thất bại, vui lòng thử lại',
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      width: 120,
      render: (v: string) => (
        <span className="text-xs font-semibold text-gray-600">
          {formatIdOrder(v)}
        </span>
      ),
    },
    {
      title: 'Số bàn / Tên khách',
      render: (_, record) => {
        const isTable = !!record.tableInfo;
        const isOnline = !!record.customerInfo;

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {isTable && `Bàn ${record.tableInfo!.tableNumber}`}
              {isOnline && record.customerInfo!.name}
            </span>
            <span className="text-xs text-gray-500">
              {isTable && 'Tại bàn'}
              {isOnline && `Online • ${record.customerInfo!.phone}`}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'amount',
      render: (v: number) => (
        <span
          className={`font-semibold ${
            v === 0 ? 'text-gray-400' : 'text-[#9d5237]'
          }`}
        >
          {v.toLocaleString()} đ
        </span>
      ),
    },
    {
      title: 'Hành động',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          disabled={record.amount === 0}
          onClick={() => setSelectedOrder(record)}
        >
          Thanh toán
        </Button>
      ),
    },
  ];

  return (
    <StaffLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Quản lý thanh toán đơn hàng
        </h2>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            onChange: (page) => setCurrentPage(page),
          }}
        />

        {/* MODAL */}
        <Modal
          open={!!selectedOrder}
          onCancel={() => !loading && setSelectedOrder(null)}
          onOk={handleConfirmPayment}
          confirmLoading={loading}
          okText="Xác nhận thanh toán"
          okButtonProps={{ className: 'bg-[#9d5237]' }}
          title={
            <div className="flex flex-col">
              <span className="font-semibold text-lg">Xác nhận thanh toán</span>
              <span className="text-xs text-gray-500">
                Mã đơn: {formatIdOrder(selectedOrder?.id)}
              </span>
            </div>
          }
        >
          {selectedOrder && (
            <div className="space-y-5">
              {/* THÔNG TIN CHUNG */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Số bàn / Tên khách</p>
                  <p className="font-medium">
                    {selectedOrder.tableInfo &&
                      `Bàn ${selectedOrder.tableInfo.tableNumber}`}
                    {selectedOrder.customerInfo &&
                      selectedOrder.customerInfo.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Tổng tiền</p>
                  <p className="text-xl font-semibold text-[#9d5237]">
                    {selectedOrder.amount.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              {/* DANH SÁCH MÓN */}
              <div>
                <p className="font-medium mb-2">Danh sách món</p>

                {selectedOrder.orderItems.length === 0 ? (
                  <Empty description="Chưa có món nào" />
                ) : (
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.orderItems.map((item: any) => (
                      <div key={item._id} className="px-3 py-2 space-y-1">
                        {/* Tên món + số lượng */}
                        <div className="flex justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Size */}
                        {item.variant?.size && (
                          <p className="text-xs text-gray-500">
                            Size: {item.variant.size}
                          </p>
                        )}

                        {/* Topping */}
                        {item.toppings?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <p className="text-xs text-gray-500">Toppings:</p>
                            {item.toppings.map((tp: any) => (
                              <span
                                key={tp._id}
                                className="text-xs bg-gray-100 px-2 py-[2px] rounded"
                              >
                                {tp.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PHƯƠNG THỨC */}
              <div>
                <p className="font-medium mb-2">Phương thức thanh toán</p>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex gap-4"
                >
                  <Radio.Button value="cash">💵 Tiền mặt</Radio.Button>
                  <Radio.Button value="bank">🏦 Ngân hàng</Radio.Button>
                </Radio.Group>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </StaffLayout>
  );
}
