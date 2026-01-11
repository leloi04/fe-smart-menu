import { handleCheckValidPhoneAPI } from '@/services/api';
import { useState } from 'react';

interface PhoneRequiredModalProps {
  open: boolean;
  onSubmit: (phone: string) => Promise<void>;
}

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

export default function PhoneRequiredModal({
  open,
  onSubmit,
}: PhoneRequiredModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const validate = async () => {
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!VN_PHONE_REGEX.test(phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    try {
      const res = await handleCheckValidPhoneAPI(phone);
      const isExist = !!res?.data?.phone;
      if (isExist) {
        setError('Số điện thoại đã tồn tại');
        return false;
      }
    } catch (error) {
      setError('Không thể kiểm tra số điện thoại');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    const isValid = await validate();
    if (!isValid) return;

    try {
      setLoading(true);
      await onSubmit(phone);
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Hoàn thiện thông tin</h2>
        <p className="text-gray-600 mb-4">
          Vui lòng nhập số điện thoại để tiếp tục sử dụng hệ thống
        </p>

        <input
          type="tel"
          placeholder="VD: 0987654321"
          className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Đang lưu...' : 'Xác nhận'}
        </button>
      </div>
    </div>
  );
}
