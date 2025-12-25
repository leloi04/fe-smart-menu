import { updateUserPasswordAPI } from '@/services/api';
import { Button, Divider, Form, message, Modal } from 'antd';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { useCurrentApp } from '@/components/context/app.context';
import { useNavigate } from 'react-router-dom';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  email: string | undefined;
}

type FieldType = {
  email: string;
  oldPassword: string;
  newPassword: string;
};

const UpdatePasswordModal = ({ openModal, setOpenModal, email }: IProps) => {
  const { logout } = useCurrentApp();
  const [form] = Form.useForm<FieldType>();
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (openModal) {
      form.setFieldsValue({ email });
    }
  }, [openModal, email]);

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const onFinish = async (values: FieldType) => {
    try {
      setIsSubmit(true);

      const payload = {
        email: values.email,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      const res = await updateUserPasswordAPI(payload);
      console.log('res', res);
      if (res?.data) {
        message.success('Đổi mật khẩu thành công, vui lòng đăng nhập lại');
        setOpenModal(false);
        logout();
        navigate('/login');
      } else {
        message.error(res.message);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <Modal
      open={openModal}
      onCancel={handleCancel}
      width={500}
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
          Đổi mật khẩu
        </Button>,
      ]}
    >
      <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
      <Divider />

      <ProForm<FieldType>
        form={form}
        submitter={false}
        layout="vertical"
        onFinish={onFinish}
      >
        <ProFormText name="email" label="Email" disabled />

        <ProFormText.Password
          name="oldPassword"
          label="Mật khẩu cũ"
          placeholder="Nhập mật khẩu cũ"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
        />

        <ProFormText.Password
          name="newPassword"
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
          ]}
        />
      </ProForm>
    </Modal>
  );
};

export default UpdatePasswordModal;
