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
import {
  getAllTableAPI,
  validateReservationAPI,
  generateShiftsByDateAPI,
} from '@/services/api';
import { socket } from '@/services/socket';

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
  const [listTime, setListTime] = useState<string[]>([]);
  const selectedDate = Form.useWatch('date', form);

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

  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeByDate = async () => {
      try {
        const res = await generateShiftsByDateAPI(selectedDate);
        if (res?.data) {
          const times = res.data.map((item: any) => item.startTime);
          setListTime(times);

          form.setFieldsValue({ time: undefined });
        }
      } catch (error) {
        console.error(error);
        message.error('Không lấy được khung giờ');
      }
    };

    fetchTimeByDate();
  }, [selectedDate]);

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
                placeholder="Chọn khung giờ"
                disabled={!selectedDate}
                options={listTime.map((time) => ({
                  label: time,
                  value: time,
                }))}
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
