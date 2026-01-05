import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  TimePicker,
  Switch,
  InputNumber,
  Button,
  Form,
  message,
  Upload,
  type GetProp,
  Image,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { getSettingAPI, updateFileAPI, updateSettingAPI } from '@/services/api';
import type { UploadFile } from 'antd/lib';
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/es/interface';
import type { UploadProps } from 'rc-upload';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const RestaurantSettings: React.FC = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [logoImage, setLogoImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
  });

  const [openingHours, setOpeningHours] = useState<{
    weekday: {
      enabled: boolean;
      open: Dayjs | null;
      close: Dayjs | null;
    };
    weekend: {
      enabled: boolean;
      open: Dayjs | null;
      close: Dayjs | null;
    };
  }>({
    weekday: {
      enabled: true,
      open: dayjs('08:00', 'HH:mm'),
      close: dayjs('22:00', 'HH:mm'),
    },
    weekend: {
      enabled: true,
      open: dayjs('09:00', 'HH:mm'),
      close: dayjs('23:00', 'HH:mm'),
    },
  });

  const [shiftSetting, setShiftSetting] = useState({
    slotDurationMinutes: 120,
    startOffsetMinutes: 0,
  });

  const [operationSetting, setOperationSetting] = useState({
    endOfDayTime: dayjs('23:00', 'HH:mm'),
    lockOrderAfterClose: true,
    allowCrossShiftOrder: false,
  });

  /* ================== FETCH SETTING ================== */

  useEffect(() => {
    const getSetting = async () => {
      try {
        const res = await getSettingAPI();
        const data = res?.data;
        if (!data) return;

        /* ==== INFO ==== */
        setRestaurantInfo((prev) => ({
          ...prev,
          name: data.name ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          description: data.description ?? '',
        }));

        /* ==== SHIFT ==== */
        setShiftSetting((prev) => ({
          ...prev,
          slotDurationMinutes:
            data.slotDurationMinutes ?? prev.slotDurationMinutes,
          startOffsetMinutes:
            data.startOffsetMinutes ?? prev.startOffsetMinutes,
        }));

        /* ==== OPERATION ==== */
        setOperationSetting((prev) => ({
          ...prev,
          endOfDayTime: data.endOfDayTime
            ? dayjs(data.endOfDayTime, 'HH:mm')
            : prev.endOfDayTime,
          lockOrderAfterClose:
            data.lockOrderAfterClose ?? prev.lockOrderAfterClose,
          allowCrossShiftOrder:
            data.allowCrossShiftOrder ?? prev.allowCrossShiftOrder,
        }));

        /* ==== OPENING HOURS ==== */
        if (data.weekday) {
          setOpeningHours((prev) => ({
            ...prev,
            weekday: {
              enabled: data.weekday.enabled ?? prev.weekday.enabled,
              open: data.weekday.open
                ? dayjs(data.weekday.open, 'HH:mm')
                : prev.weekday.open,
              close: data.weekday.close
                ? dayjs(data.weekday.close, 'HH:mm')
                : prev.weekday.close,
            },
          }));
        }

        if (data.weekend) {
          setOpeningHours((prev) => ({
            ...prev,
            weekend: {
              enabled: data.weekend.enabled ?? prev.weekend.enabled,
              open: data.weekend.open
                ? dayjs(data.weekend.open, 'HH:mm')
                : prev.weekend.open,
              close: data.weekend.close
                ? dayjs(data.weekend.close, 'HH:mm')
                : prev.weekend.close,
            },
          }));
        }

        if (data.logo) {
          setLogoImage(data.logo);
          setLogoFileList([
            {
              uid: '-1',
              name: data.logo,
              status: 'done',
              url: `${import.meta.env.VITE_BACKEND_URL}/images/logo/${
                data.logo
              }`,
            },
          ]);
        }
      } catch {
        message.error('Không thể tải setting');
      }
    };

    getSetting();
  }, []);

  /* ================== HANDLER ================== */

  const updateOpening = (
    type: 'weekday' | 'weekend',
    key: 'enabled' | 'open' | 'close',
    value: any,
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }));
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const beforeUpload = (file: UploadFile) => {
    const isPNG = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isPNG) message.error('Chỉ chấp nhận PNG/JPG');

    const isLt2M = file.size! / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB');

    return (isPNG && isLt2M) || Upload.LIST_IGNORE;
  };

  const handleUploadLogo = async (options: RcCustomRequestOptions) => {
    const { onSuccess, onError } = options;
    const file = options.file as UploadFile;

    try {
      const res = await updateFileAPI(file, 'logo');

      if (res?.data) {
        const fileName = (res.data as any).fileName;

        const uploadedFile: UploadFile = {
          uid: file.uid,
          name: fileName,
          status: 'done',
          url: `${import.meta.env.VITE_BACKEND_URL}/images/logo/${fileName}`,
        };

        setLogoFileList([uploadedFile]);
        setLogoImage(fileName);
        onSuccess?.('ok');
      } else {
        onError?.(new Error('Upload thất bại'));
      }
    } catch (err) {
      onError?.(err as any);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmit(true);

      const payload = {
        ...restaurantInfo,
        logo: logoImage,
        weekday: {
          enabled: openingHours.weekday.enabled,
          open: openingHours.weekday.open?.format('HH:mm') ?? null,
          close: openingHours.weekday.close?.format('HH:mm') ?? null,
        },
        weekend: {
          enabled: openingHours.weekend.enabled,
          open: openingHours.weekend.open?.format('HH:mm') ?? null,
          close: openingHours.weekend.close?.format('HH:mm') ?? null,
        },
        slotDurationMinutes: shiftSetting.slotDurationMinutes,
        startOffsetMinutes: shiftSetting.startOffsetMinutes,
        endOfDayTime: operationSetting.endOfDayTime.format('HH:mm'),
        lockOrderAfterClose: operationSetting.lockOrderAfterClose,
        allowCrossShiftOrder: operationSetting.allowCrossShiftOrder,
      };

      console.log(payload);
      const res = await updateSettingAPI(payload);
      if (res?.data) {
        message.success('Lưu cấu hình thành công');
      }
    } catch {
      message.error('Có lỗi xảy ra');
    } finally {
      setIsSubmit(false);
    }
  };

  /* ================== RENDER ================== */

  return (
    <div className="p-6 space-y-6">
      {/* 1. INFO */}
      <Card title="Thông tin quán">
        <Form layout="vertical" className="grid md:grid-cols-2 gap-4">
          <Form.Item label="Tên quán">
            <Input
              value={restaurantInfo.name}
              onChange={(e) =>
                setRestaurantInfo({ ...restaurantInfo, name: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="Hotline">
            <Input
              value={restaurantInfo.phone}
              onChange={(e) =>
                setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="Email">
            <Input
              value={restaurantInfo.email}
              onChange={(e) =>
                setRestaurantInfo({ ...restaurantInfo, email: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item label="Địa chỉ">
            <Input
              value={restaurantInfo.address}
              onChange={(e) =>
                setRestaurantInfo({
                  ...restaurantInfo,
                  address: e.target.value,
                })
              }
            />
          </Form.Item>

          <Form.Item label="Logo nhà hàng">
            <Upload
              maxCount={1}
              listType="picture-card"
              fileList={logoFileList}
              beforeUpload={beforeUpload}
              customRequest={handleUploadLogo}
              onChange={({ fileList }) => setLogoFileList(fileList)}
              onPreview={handlePreview}
            >
              {logoFileList.length < 1 && '+ Upload'}
            </Upload>
          </Form.Item>

          <Form.Item label="Mô tả">
            <Input.TextArea
              rows={3}
              value={restaurantInfo.description}
              onChange={(e) =>
                setRestaurantInfo({
                  ...restaurantInfo,
                  description: e.target.value,
                })
              }
            />
          </Form.Item>
        </Form>
      </Card>

      {/* 2. OPENING */}
      <Card title="Thời gian hoạt động">
        {(['weekday', 'weekend'] as const).map((type) => (
          <div key={type} className="border p-4 rounded-lg mb-4 space-y-3">
            <div className="flex justify-between">
              <strong>
                {type === 'weekday' ? 'Thứ 2 – Thứ 6' : 'Thứ 7 – Chủ nhật'}
              </strong>
              <Switch
                checked={openingHours[type].enabled}
                onChange={(v) => updateOpening(type, 'enabled', v)}
              />
            </div>

            <div className="flex gap-4">
              <TimePicker
                format="HH:mm"
                value={openingHours[type].open}
                disabled={!openingHours[type].enabled}
                onChange={(v) => updateOpening(type, 'open', v)}
              />
              <TimePicker
                format="HH:mm"
                value={openingHours[type].close}
                disabled={!openingHours[type].enabled}
                onChange={(v) => updateOpening(type, 'close', v)}
              />
            </div>
          </div>
        ))}
      </Card>

      {/* 3. SHIFT */}
      <Card title="Thiết lập ca">
        <Form layout="vertical" className="max-w-md">
          <Form.Item label="Thời lượng ca (phút)">
            <InputNumber
              className="w-full"
              min={15}
              step={15}
              value={shiftSetting.slotDurationMinutes}
              onChange={(v) =>
                setShiftSetting({
                  ...shiftSetting,
                  slotDurationMinutes: v || 0,
                })
              }
            />
          </Form.Item>

          <Form.Item label="Delay bắt đầu (phút)">
            <InputNumber
              className="w-full"
              min={0}
              step={15}
              value={shiftSetting.startOffsetMinutes}
              onChange={(v) =>
                setShiftSetting({
                  ...shiftSetting,
                  startOffsetMinutes: v || 0,
                })
              }
            />
          </Form.Item>
        </Form>
      </Card>

      {/* 4. OPERATION */}
      <Card title="Vận hành">
        <div className="flex gap-6 items-center">
          <TimePicker
            format="HH:mm"
            value={operationSetting.endOfDayTime}
            onChange={(v) =>
              setOperationSetting({
                ...operationSetting,
                endOfDayTime: v!,
              })
            }
          />

          <Switch
            checked={operationSetting.lockOrderAfterClose}
            onChange={(v) =>
              setOperationSetting({
                ...operationSetting,
                lockOrderAfterClose: v,
              })
            }
          />
          <span>Khoá order sau giờ đóng</span>
        </div>
      </Card>

      {/* SAVE */}
      <div className="flex justify-end mt-6">
        <Button type="primary" loading={isSubmit} onClick={handleSubmit}>
          Lưu cấu hình
        </Button>
      </div>

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
};

export default RestaurantSettings;
