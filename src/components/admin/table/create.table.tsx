import { createTableAPI } from '@/services/api';
import {
  Button,
  Divider,
  Form,
  message,
  Modal,
  Row,
  Col,
  type FormProps,
} from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useState } from 'react';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  tableNumber: string;
  descriptionPosition: string;
  seats: number;
};

const CreateTable = (props: IProps) => {
  const { openModal, setOpenModal, refreshTable } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm<FieldType>();

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setIsSubmit(true);

      const payload = {
        tableNumber: values.tableNumber,
        descriptionPosition: values.descriptionPosition,
        seats: values.seats,
      };

      const res = await createTableAPI(payload);

      if (res?.data) {
        message.success('Thêm bàn thành công!');
        form.resetFields();
        setOpenModal(false);
        refreshTable();
      } else {
        message.error(res?.message || 'Thêm bàn thất bại');
      }
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
      width={600}
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
          Thêm
        </Button>,
      ]}
    >
      <div className="heading">
        <h2 className="text text-large">Thêm mới bàn</h2>
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
              name="tableNumber"
              label="Số bàn"
              placeholder="Ví dụ: Bàn 01"
              rules={[{ required: true, message: 'Vui lòng nhập số bàn' }]}
            />
          </Col>

          <Col span={12}>
            <ProFormDigit
              name="seats"
              label="Số chỗ ngồi"
              placeholder="Nhập số chỗ"
              min={1}
              rules={[{ required: true, message: 'Vui lòng nhập số chỗ ngồi' }]}
            />
          </Col>
        </Row>

        <ProFormTextArea
          name="descriptionPosition"
          label="Vị trí bàn"
          placeholder="Ví dụ: Gần cửa sổ, tầng 1"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập mô tả vị trí',
            },
          ]}
        />
      </ProForm>
    </Modal>
  );
};

export default CreateTable;
