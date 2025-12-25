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
  ProFormSelect,
} from '@ant-design/pro-components';
import { useState } from 'react';
import {
  ADMIN_ROLE,
  ADMIN_ROLE_ID,
  CHEF_ROLE,
  CHEF_ROLE_ID,
  CUSTOMER_ROLE,
  CUSTOMER_ROLE_ID,
  STAFF_ROLE,
  STAFF_ROLE_ID,
} from '@/types/global.constanst';
import { createUserAPI } from '@/services/api';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  name: string;
  email: string;
  password: string;
  phone: number;
  gender?: string;
  role?: string;
};

const CreateUser = ({ openModal, setOpenModal, refreshTable }: IProps) => {
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
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        role: values.role,
      };

      const res = await createUserAPI(payload);

      if (res?.data) {
        message.success('Tạo người dùng thành công!');
        form.resetFields();
        setOpenModal(false);
        refreshTable();
      } else {
        message.error(res?.message || 'Tạo người dùng thất bại');
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
          Tạo
        </Button>,
      ]}
    >
      <div className="heading">
        <h2 className="text text-large">Tạo người dùng</h2>
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
              placeholder={'Nhập họ và tên'}
              label="Họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            />
          </Col>

          <Col span={12}>
            <ProFormText
              name="email"
              label="Email"
              placeholder={'Nhập email'}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <ProFormText
              name="phone"
              label="Số điện thoại"
              placeholder={'Nhập số điện thoại'}
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <ProFormSelect
              name="gender"
              label="Giới tính"
              placeholder={'Chọn giới tính'}
              options={[
                { label: 'Nam', value: 'male' },
                { label: 'Nữ', value: 'female' },
                { label: 'Khác', value: 'other' },
              ]}
            />
          </Col>

          <Col span={12}>
            <ProFormSelect
              name="role"
              label="Role"
              placeholder={`${CUSTOMER_ROLE}`}
              rules={[{ required: true, message: 'Phải chọn phần phân quyền' }]}
              options={[
                { label: ADMIN_ROLE, value: ADMIN_ROLE_ID },
                { label: CUSTOMER_ROLE, value: CUSTOMER_ROLE_ID },
                { label: CHEF_ROLE, value: CHEF_ROLE_ID },
                { label: STAFF_ROLE, value: STAFF_ROLE_ID },
              ]}
            />
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
};

export default CreateUser;
