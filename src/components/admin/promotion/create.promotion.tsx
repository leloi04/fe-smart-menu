import { createPromotionAPI, updateFileAPI } from '@/services/api';
import {
  Button,
  Divider,
  Form,
  message,
  Modal,
  Upload,
  DatePicker,
  type UploadFile,
} from 'antd';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useState } from 'react';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/es/interface';

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  title: string;
  description: string;
  displayMode?: 'AUTO' | 'MANUAL';
  status?: boolean;
  linkType: string;
  linkValue?: string;
  startAt: string;
  endAt: string;
};

const CreatePromotion = ({ openModal, setOpenModal, refreshTable }: IProps) => {
  const [form] = Form.useForm<FieldType>();
  const [isSubmit, setIsSubmit] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  // ===================== UPLOAD =====================
  const beforeUpload = (file: UploadFile) => {
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isImage) message.error('Chỉ hỗ trợ PNG/JPG');
    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB');
    return (isImage && isLt2M) || Upload.LIST_IGNORE;
  };

  const handleUpload = async (options: RcCustomRequestOptions) => {
    const { file, onSuccess } = options;
    const res = await updateFileAPI(file as any, 'promotion');

    if (res?.data) {
      const fileName = (res.data as any).fileName;

      setFileList([
        {
          uid: Date.now().toString(),
          name: fileName,
          status: 'done',
          url: `${
            import.meta.env.VITE_BACKEND_URL
          }/images/promotion/${fileName}`,
        },
      ]);

      setImageUrl(fileName);
      onSuccess?.('ok');
    } else {
      message.error('Upload ảnh thất bại');
    }
  };

  // ===================== SUBMIT =====================
  const onFinish = async (values: FieldType) => {
    if (!imageUrl) {
      message.error('Vui lòng upload hình ảnh');
      return;
    }

    try {
      setIsSubmit(true);

      const payload = {
        ...values,
        startAt: values.startAt.split(' ')[0],
        endAt: values.endAt.split(' ')[0],
        imageUrl,
      };

      const res = await createPromotionAPI(payload);

      if (res?.data) {
        message.success('Thêm banner thành công');
        form.resetFields();
        setFileList([]);
        setImageUrl('');
        setOpenModal(false);
        refreshTable();
      }
    } catch {
      message.error('Có lỗi xảy ra');
    } finally {
      setIsSubmit(false);
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
    setFileList([]);
    setImageUrl('');
  };

  // ===================== UI =====================
  return (
    <Modal
      open={openModal}
      onCancel={handleCancel}
      width={750}
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
      <h2>Thêm Banner / Promotion</h2>
      <Divider />

      <ProForm<FieldType>
        form={form}
        submitter={false}
        layout="vertical"
        onFinish={onFinish}
      >
        <ProFormText
          name="title"
          label="Tiêu đề"
          rules={[{ required: true }]}
        />

        <ProFormTextArea
          name="description"
          label="Mô tả"
          rules={[{ required: true }]}
        />

        <ProFormSelect
          name="linkType"
          label="Loại liên kết"
          rules={[{ required: true }]}
          options={[
            { label: 'Không liên kết', value: 'NONE' },
            { label: 'Link ngoài', value: 'EXTERNAL' },
            { label: 'Màn hình nội bộ', value: 'INTERNAL' },
          ]}
        />

        <ProFormText
          name="linkValue"
          label="Giá trị liên kết"
          placeholder="VD: https://..., productId, categoryId"
        />

        <ProFormSelect
          name="displayMode"
          label="Chế độ hiển thị"
          options={[
            { label: 'Tự động', value: 'AUTO' },
            { label: 'Thủ công', value: 'MANUAL' },
          ]}
        />

        <ProFormSelect
          name="status"
          label="Trạng thái"
          initialValue={true}
          options={[
            { label: 'Hiển thị', value: true },
            { label: 'Ẩn', value: false },
          ]}
        />

        <Form.Item
          label="Thời gian bắt đầu"
          name="startAt"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Thời gian kết thúc"
          name="endAt"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Hình ảnh banner" required>
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={beforeUpload}
            customRequest={handleUpload}
            fileList={fileList}
          >
            {fileList.length < 1 && '+ Upload'}
          </Upload>
        </Form.Item>
      </ProForm>
    </Modal>
  );
};

export default CreatePromotion;
