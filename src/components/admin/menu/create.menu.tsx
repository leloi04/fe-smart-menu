import { createMenuAPI, updateFileAPI } from '@/services/api';
import {
  Button,
  Col,
  Divider,
  Form,
  message,
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
  ProFormTextArea,
  ProFormSelect,
  ProFormList,
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
  ingredients: any[];
  category: string;
  status: string;
  variants: any[];
  toppings: any[];
  kitchenArea: string;
};

const CreateMenu = (props: IProps) => {
  const { openModal, setOpenModal, refreshTable } = props;
  const [isSubmit, setIsSubmit] = useState(false);
  const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState('');
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
    imgWindow?.document.writeln(image.outerHTML);
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
    try {
      setIsSubmit(true);

      const {
        name,
        description,
        price,
        ingredients,
        category,
        status,
        variants,
        toppings,
        kitchenArea,
      } = values;

      const payload = {
        name,
        description,
        price,
        ingredients: (ingredients || []).map((i) => i.name),
        category,
        status,
        variants: variants || [],
        toppings: toppings || [],
        kitchenArea,
        image: thumbnailImage ?? '',
      };

      const res = await createMenuAPI(payload);

      if (res?.data) {
        message.success('Thêm mới món thành công!');
        form.resetFields();
        setThumbnailImage('');
        setFileListThumbnail([]);
        setOpenModal(false);
        refreshTable();
      } else {
        message.error((res as any)?.message || 'Thêm món thất bại');
      }
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi thêm món');
    } finally {
      setIsSubmit(false); // 🔥 QUAN TRỌNG
    }
  };

  return (
    <Modal
      open={openModal}
      onCancel={handleCancel}
      confirmLoading={isSubmit}
      width={800}
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
              placeholder={'Nhập giá mặc định của món'}
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

        <Row gutter={16}>
          <Col span={12}>
            <ProForm.Item
              name="thumbnail"
              label="Hình ảnh món"
              getValueFromEvent={(e: any) =>
                Array.isArray(e) ? e : e?.fileList
              }
            >
              <div>
                {/* Image upload (keeps existing upload handling) */}
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

                {/* Hidden field to store uploaded image filename (so form will have an image value) */}
                <ProFormText
                  name="image"
                  hidden
                  initialValue={thumbnailImage}
                  fieldProps={{ value: thumbnailImage }}
                />
              </div>
            </ProForm.Item>
          </Col>
          <Col span={12}>
            {/* Ingredients - dynamic list */}
            <ProFormList
              name="ingredients"
              label="Ingredients"
              creatorButtonProps={{ creatorButtonText: 'Thêm nguyên liệu' }}
              rules={[]}
            >
              <ProFormText
                name="name"
                fieldProps={{ placeholder: 'Nhập nguyên liệu' }}
                rules={[
                  { required: true, message: 'Vui lòng nhập nguyên liệu!' },
                ]}
              />
            </ProFormList>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            {/* Category select */}
            <ProFormSelect
              name="category"
              label="Category"
              placeholder="Chọn danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              options={[
                { label: 'Món chính', value: 'Món chính' },
                { label: 'Món phụ', value: 'Món phụ' },
                { label: 'Đồ uống', value: 'Đồ uống' },
                { label: 'Tráng miệng', value: 'Tráng miệng' },
              ]}
            />
          </Col>
          <Col span={8}>
            {/* Status (enum) */}
            <ProFormSelect
              name="status"
              label="Status"
              placeholder="Chọn trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              options={[
                { label: 'Available', value: 'available' },
                { label: 'Out of stock', value: 'out_of_stock' },
              ]}
            />
          </Col>
          <Col span={8}>
            {/* Kitchen area */}
            <ProFormSelect
              name="kitchenArea"
              label="Kitchen area"
              placeholder="Nhập khu vực bếp"
              rules={[
                { required: true, message: 'Vui lòng nhập kitchen area!' },
              ]}
              options={[
                { label: 'HOT', value: 'HOT' },
                { label: 'GRILL', value: 'GRILL' },
                { label: 'COLD', value: 'COLD' },
                { label: 'DRINK', value: 'DRINK' },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            {/* Variants - optional list of {size, price} */}
            <ProFormList
              name="variants"
              label="Variants (optional)"
              creatorButtonProps={{ creatorButtonText: 'Thêm variant' }}
            >
              <ProForm.Group>
                <ProFormText name="size" width="sm" placeholder="Size" />
                <ProFormDigit
                  name="price"
                  width="sm"
                  placeholder="Giá"
                  min={0}
                />
              </ProForm.Group>
            </ProFormList>
          </Col>
          <Col span={12}>
            {/* Toppings - optional list of {name, price} */}
            <ProFormList
              name="toppings"
              label="Toppings (optional)"
              creatorButtonProps={{ creatorButtonText: 'Thêm topping' }}
            >
              <ProForm.Group>
                <ProFormText
                  name="name"
                  width="sm"
                  placeholder="Tên topping"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên topping',
                    },
                  ]}
                />
                <ProFormDigit
                  name="price"
                  width="sm"
                  placeholder="Giá"
                  min={0}
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập giá topping',
                    },
                  ]}
                />
              </ProForm.Group>
            </ProFormList>
          </Col>
        </Row>
      </ProForm>
    </Modal>
  );
};

export default CreateMenu;
