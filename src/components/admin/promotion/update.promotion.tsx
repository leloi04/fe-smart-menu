import { updateFileAPI, updatePromotionAPI } from '@/services/api';
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Upload,
  type UploadFile,
} from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDigit,
  ProFormDatePicker,
} from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/es/interface';
import dayjs from 'dayjs';

interface IProps {
  promotionData: any;
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  refreshTable: () => void;
}

type FieldType = {
  _id: string;
  title: string;
  description: string;
  displayMode: 'AUTO' | 'MANUAL';
  status: boolean;
  startAt: string;
  endAt: string;
  order: number;
};

const UpdatePromotion = ({
  promotionData,
  openModal,
  setOpenModal,
  refreshTable,
}: IProps) => {
  const [form] = Form.useForm<FieldType>();
  const [isSubmit, setIsSubmit] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  /* ================= FILL DATA ================= */
  useEffect(() => {
    if (!promotionData || !openModal) return;

    form.setFieldsValue({
      _id: promotionData._id,
      title: promotionData.title,
      description: promotionData.description,
      displayMode: promotionData.displayMode,
      status: promotionData.status,
      order: promotionData.order,
      startAt: (promotionData.startAt
        ? dayjs(promotionData.startAt)
        : undefined) as any,
      endAt: (promotionData.endAt
        ? dayjs(promotionData.endAt)
        : undefined) as any,
    });

    if (promotionData.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: promotionData.imageUrl,
          status: 'done',
          url: `${import.meta.env.VITE_BACKEND_URL}/images/promotion/${
            promotionData.imageUrl
          }`,
        },
      ]);
      setImageUrl(promotionData.imageUrl);
    }
  }, [promotionData, openModal, form]);

  /* ================= CLOSE ================= */
  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
    setFileList([]);
    setImageUrl('');
  };

  /* ================= UPLOAD ================= */
  const beforeUpload = (file: UploadFile) => {
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isImage) message.error('Chỉ hỗ trợ PNG/JPG');
    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Ảnh phải < 2MB');
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

  /* ================= SUBMIT ================= */
  const onFinish = async (values: any) => {
    try {
      setIsSubmit(true);

      const payload = {
        title: values.title,
        description: values.description,
        displayMode: values.displayMode,
        status: values.status,
        order: values.order,
        imageUrl,
        startAt: values.startAt
          ? dayjs(values.startAt).format('YYYY-MM-DD')
          : null,
        endAt: values.endAt ? dayjs(values.endAt).format('YYYY-MM-DD') : null,
      };

      const res = await updatePromotionAPI(values._id, payload);

      if (res?.data) {
        message.success('Cập nhật promotion thành công');
        handleCancel();
        refreshTable();
      } else {
        message.error('Cập nhật thất bại');
      }
    } catch (err) {
      message.error('Có lỗi xảy ra');
    } finally {
      setIsSubmit(false);
    }
  };

  /* ================= UI ================= */
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
          Cập nhật
        </Button>,
      ]}
    >
      <h2>Cập nhật Promotion</h2>
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

        <ProFormText
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        />

        <ProFormTextArea
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        />

        <ProFormSelect
          name="displayMode"
          label="Chế độ hiển thị"
          options={[
            { label: 'Tự động', value: 'AUTO' },
            { label: 'Thủ công', value: 'MANUAL' },
          ]}
          rules={[{ required: true }]}
        />

        <ProFormSelect
          name="status"
          label="Trạng thái"
          options={[
            { label: 'Hiển thị', value: true },
            { label: 'Ẩn', value: false },
          ]}
          rules={[{ required: true }]}
        />

        <ProFormDigit
          name="order"
          label="Thứ tự hiển thị"
          min={0}
          rules={[{ required: true }]}
        />

        <ProFormDatePicker name="startAt" label="Ngày bắt đầu" />
        <ProFormDatePicker name="endAt" label="Ngày kết thúc" />

        <Form.Item label="Hình ảnh banner" required>
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={beforeUpload}
            customRequest={handleUpload}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            {fileList.length < 1 && '+ Upload'}
          </Upload>
        </Form.Item>
      </ProForm>
    </Modal>
  );
};

export default UpdatePromotion;
