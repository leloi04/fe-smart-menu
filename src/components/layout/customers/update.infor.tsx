import { updateFileAPI, updateUserAPI } from '@/services/api';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Upload,
  type UploadFile,
} from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/es/interface';
import { useCurrentApp } from '@/components/context/app.context';
import { useNavigate } from 'react-router-dom';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  userData: any;
}

type FieldType = {
  email: string;
  _id: string;
  name: string;
  phone: string;
  gender: string;
  avatar: string;
};

const UpdateUserProfile = (props: IProps) => {
  const { setUser, logout } = useCurrentApp();
  const { openModal, setOpenModal, userData } = props;
  const navigate = useNavigate();
  const [form] = Form.useForm<FieldType>();
  const [isSubmit, setIsSubmit] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [avatar, setAvatar] = useState('');

  /* ====================== SET DATA ====================== */
  useEffect(() => {
    if (!openModal || !userData) return;

    form.setFieldsValue({
      _id: userData._id,
      name: userData.name,
      phone: userData.phone,
      gender: userData.gender,
      email: userData.email,
    });

    if (userData.avatar) {
      const isGoogleAvatar = userData.avatar.startsWith('http');

      const file: UploadFile = {
        uid: '-1',
        name: isGoogleAvatar ? 'google-avatar' : userData.avatar,
        status: 'done',
        url: isGoogleAvatar
          ? userData.avatar
          : `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
              userData.avatar
            }`,
      };

      setFileList([file]);
      setAvatar(userData.avatar);
    }
  }, [openModal, userData]);

  /* ====================== UPLOAD ====================== */
  const beforeUpload = (file: UploadFile) => {
    const isImg = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isImg) message.error('Chỉ chấp nhận ảnh PNG / JPG');
    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB');
    return (isImg && isLt2M) || Upload.LIST_IGNORE;
  };

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { file, onSuccess } = options;
    const res = await updateFileAPI(file as any, 'avatar');

    if (res?.data) {
      const fileName = (res.data as any).fileName;
      setAvatar(fileName);
      setFileList([
        {
          uid: (file as any).uid,
          name: fileName,
          status: 'done',
          url: `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${fileName}`,
        },
      ]);
      onSuccess?.('ok');
    } else {
      message.error('Upload thất bại');
    }
  };

  /* ====================== SUBMIT ====================== */
  const onFinish = async (values: FieldType) => {
    try {
      setIsSubmit(true);

      const payload = {
        email: values.email,
        name: values.name,
        phone: values.phone,
        gender: values.gender,
        avatar,
      };

      const dataUser = {
        _id: values._id,
        email: values.email,
        name: values.name,
        phone: values.phone,
        gender: values.gender,
        role: userData.role,
        avatar,
      };

      const res = await updateUserAPI(values._id, payload);

      if (res?.data) {
        message.success('Cập nhật thông tin thành công');
        setUser(dataUser);
        setOpenModal(false);
        logout();
        navigate('/login');
      } else {
        message.error('Cập nhật thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setIsSubmit(false);
    }
  };

  /* ====================== RENDER ====================== */
  return (
    <Modal
      open={openModal}
      width={600}
      onCancel={() => setOpenModal(false)}
      footer={[
        <Button key="cancel" onClick={() => setOpenModal(false)}>
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
      <h2 className="text-lg font-semibold">Cập nhật thông tin cá nhân</h2>
      <Divider />

      <ProForm<FieldType>
        form={form}
        submitter={false}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="_id" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="email" hidden>
          <Input disabled />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="name"
              label="Họ và tên"
              placeholder="Nhập họ tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            />
          </Col>

          <Col span={12}>
            <ProFormText
              name="phone"
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{9,11}$/, message: 'SĐT không hợp lệ' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <ProFormSelect
              name="gender"
              label="Giới tính"
              placeholder="Chọn giới tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              options={[
                { label: 'Nam', value: 'male' },
                { label: 'Nữ', value: 'female' },
                { label: 'Khác', value: 'other' },
              ]}
            />
          </Col>

          <Col span={12}>
            <Form.Item label="Avatar">
              <Upload
                listType="picture-card"
                maxCount={1}
                fileList={fileList}
                beforeUpload={beforeUpload}
                customRequest={handleUploadFile}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                {fileList.length < 1 && '+ Upload'}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
};

export default UpdateUserProfile;
