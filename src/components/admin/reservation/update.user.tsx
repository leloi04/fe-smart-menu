import { updateTableAPI } from '@/services/api';
import {
  Button,
  Divider,
  Form,
  message,
  Modal,
  Row,
  Col,
  type FormProps,
  Input,
} from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormTextArea,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { useEffect, useState } from 'react';

interface IProps {
  tableData: any;
  setTableData: (v: any) => void;
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  _id: string;
  tableNumber: string;
  descriptionPosition: string;
  seats: number;
  isChangeQrCode: boolean;
};

const UpdateTable = (props: IProps) => {
  const { openModal, setOpenModal, refreshTable, tableData } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [form] = Form.useForm<FieldType>();

  useEffect(() => {
    if (!tableData || !openModal) return;

    form.setFieldsValue({
      _id: tableData._id,
      descriptionPosition: tableData.descriptionPosition,
      tableNumber: tableData.tableNumber,
      seats: tableData.seats,
    });
  }, [tableData, openModal]);

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setIsSubmit(true);
      const { _id } = values;

      const payload = {
        tableNumber: values.tableNumber,
        descriptionPosition: values.descriptionPosition,
        seats: values.seats,
        isChangeQrCode: values.isChangeQrCode,
      };
      const res = await updateTableAPI(_id, payload);

      if (res?.data) {
        message.success('Cập nhật bàn thành công!');
        form.resetFields();
        setOpenModal(false);
        refreshTable();
      } else {
        message.error(res?.message || 'Cập nhật bàn thất bại');
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
          Cập nhật
        </Button>,
      ]}
    >
      <div className="heading">
        <h2 className="text text-large">Cập nhật bàn</h2>
        <Divider />
      </div>

      <ProForm<FieldType>
        form={form}
        submitter={false}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item<FieldType> label="ID" name="_id" hidden>
          <Input disabled />
        </Form.Item>
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

        <ProFormSwitch
          name="isChangeQrCode"
          label="Bạn có muốn QR code của bàn được đổi không?"
          transform={(value) => ({ isChangeQrCode: value })}
          initialValue={false}
        />
      </ProForm>
    </Modal>
  );
};

export default UpdateTable;
