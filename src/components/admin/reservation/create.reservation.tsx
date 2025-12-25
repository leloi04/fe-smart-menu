import {
  Button,
  Divider,
  Form,
  message,
  Modal,
  Row,
  Col,
  type FormProps,
  Select,
  Input,
} from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { getAllTableAPI, validateReservationAPI } from '@/services/api';
import { socket } from '@/services/socket';
// import { createReservationAPI } from '@/services/api';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  name: string;
  phone: string;
  notes?: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
};

const CreateReservation = ({
  openModal,
  setOpenModal,
  refreshTable,
}: IProps) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm<FieldType>();
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      const res = await getAllTableAPI();
      if (res?.data && Array.isArray(res.data)) {
        const dataTables = res.data.map((table: any) => ({
          value: table._id,
          label: `Bàn ${table.tableNumber}`,
        }));
        setTables(dataTables);
      }
    };
    fetchTables();
  }, [openModal]);

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setIsSubmit(true);

      const data = {
        customerName: values.name,
        customerPhone: values.phone,
        notes: values.notes,
        date: values.date,
        timeSlot: values.time,
        capacity: values.guests,
        tableId: values.tableId,
      };

      const res = await validateReservationAPI(
        values.date,
        values.time,
        values.tableId,
      );
      const tableNumber = tables.find((t) => t.value === values.tableId)?.label;
      if (res.data == 'yes') {
        message.warning(
          `${tableNumber} khung giờ đã chọn đã được đặt, vui lòng chọn bàn hoặc thời gian khác!`,
        );
        return;
      }

      message.success('Đặt bàn thành công!');

      socket.emit('createReservation', data);
      form.resetFields();
      setOpenModal(false);
      refreshTable();
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra');
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <Modal
      open={openModal}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmit}
          onClick={() => form.submit()}
        >
          Đặt bàn
        </Button>,
      ]}
    >
      <div className="heading">
        <h2 className="text text-large">Tạo đặt bàn</h2>
        <Divider />
      </div>

      <ProForm<FieldType>
        form={form}
        submitter={false}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="name"
              label="Tên khách hàng"
              placeholder="Nhập tên khách"
              rules={[{ required: true, message: 'Vui lòng nhập tên khách' }]}
            />
          </Col>

          <Col span={12}>
            <ProFormText
              name="phone"
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Ngày đặt"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <Input type="date" min={new Date().toISOString().split('T')[0]} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="time"
              label="Khung giờ"
              rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
            >
              <Select
                placeholder={'Giờ hẹn!'}
                options={[
                  { label: '10:00', value: '10:00' },
                  { label: '12:00', value: '12:00' },
                  { label: '14:00', value: '14:00' },
                  { label: '16:00', value: '16:00' },
                  { label: '18:00', value: '18:00' },
                  { label: '18:00', value: '18:00' },
                  { label: '20:00', value: '20:00' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="guests"
              label="Số khách"
              rules={[{ required: true, message: 'Vui lòng chọn số khách' }]}
            >
              <Select
                placeholder={'Số khách'}
                options={[
                  { label: '1', value: '1' },
                  { label: '2', value: '2' },
                  { label: '3', value: '3' },
                  { label: '4', value: '4' },
                  { label: '5', value: '5' },
                  { label: '6', value: '6' },
                  { label: '7', value: '7' },
                  { label: '8', value: '8' },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <ProFormSelect
              name="tableId"
              label="Bàn"
              placeholder="Chọn bàn"
              rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
              options={tables}
            />
          </Col>
        </Row>

        <ProFormTextArea
          name="notes"
          label="Ghi chú"
          placeholder="Ghi chú thêm (không bắt buộc)"
        />
      </ProForm>
    </Modal>
  );
};

export default CreateReservation;
