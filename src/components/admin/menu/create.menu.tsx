import { updateFileAPI } from '@/services/api';
import {
  App,
  Col,
  Divider,
  Form,
  Modal,
  Row,
  Upload,
  type FormProps,
  type UploadFile,
  type UploadProps,
} from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormSwitch,
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
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  thumbnail: string;
};

const CreateMenu = (props: IProps) => {
  const { openModal, setOpenModal, refreshTable } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState('');
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
    setFileListThumbnail([]);
  };

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileListThumbnail(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src && file.originFileObj) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as File);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const beforeUpload = (file: UploadFile) => {
    const isPNG = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isPNG) message.error(`${file.name} is not a png/jpg file`);
    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Image must smaller than 2MB');
    return (isPNG && isLt2M) || Upload.LIST_IGNORE;
  };

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    const res = await updateFileAPI(file, 'menu'); // API upload file

    if (res && res.data) {
      const uploadedFile: any = {
        uid: file.uid,
        name: (res as any).data?.fileName,
        status: 'done',
        url: `${import.meta.env.VITE_BACKEND_URL}/images/menu/${
          (res as any).data?.fileName
        }`,
      };
      setFileListThumbnail([uploadedFile]);
      setThumbnailImage((res as any).data?.fileName);
      onSuccess?.('ok');
    } else {
      message.error((res as any).message);
    }
  };

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setIsSubmit(true);
    // const { name, description, price } = values;
    // const isActiveMenu = isActive;
    // const thumbnail = thumbnailImage ?? '';

    // console.log({ name, description, price, isActiveMenu, thumbnail });

    // // Gọi API thêm menu
    // const res = await createMenuAPI({ name, description, price, isActive: isActiveMenu, thumbnail });
    // if (res.data) {
    //   message.success('Thêm mới món thành công!');
    //   form.resetFields();
    //   setFileListThumbnail([]);
    //   setOpenModal(false);
    //   refreshTable();
    // } else {
    //   message.error((res as any).message);
    // }
    setIsSubmit(false);
  };

  return (
    <Modal
      open={openModal}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      confirmLoading={isSubmit}
      width={600}
    >
      <div className="heading">
        <h2 className="text text-large">Thêm mới món ăn</h2>
        <Divider />
      </div>

      <ProForm<FieldType>
        form={form}
        submitter={false}
        onFinish={onFinish}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText
              name="name"
              label="Tên món"
              placeholder="Nhập tên món"
              rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormDigit
              name="price"
              label="Giá"
              min={0}
              rules={[{ required: true, message: 'Vui lòng nhập giá món!' }]}
            />
          </Col>
        </Row>

        <ProFormTextArea
          name="description"
          label="Mô tả"
          placeholder="Nhập mô tả món ăn"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        />

        <ProForm.Item
          name="thumbnail"
          label="Hình ảnh món"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
        >
          <Upload
            maxCount={1}
            beforeUpload={beforeUpload}
            multiple={false}
            listType="picture-card"
            fileList={fileListThumbnail}
            onChange={onChange}
            customRequest={handleUploadFile}
            onPreview={onPreview}
          >
            {fileListThumbnail.length < 1 && '+ Upload'}
          </Upload>
        </ProForm.Item>

        <ProFormSwitch
          name="isActive"
          label="Trạng thái"
          fieldProps={{
            checkedChildren: 'Hoạt động',
            unCheckedChildren: 'Ngưng',
            checked: isActive,
            onChange: (checked) => setIsActive(checked),
          }}
        />
      </ProForm>
    </Modal>
  );
};

export default CreateMenu;
