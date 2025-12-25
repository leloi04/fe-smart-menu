import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button, Card, Input, message } from 'antd';
import { registerAPI } from '@/services/api';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // const { register } = useAuth(); // Giả sử bạn có hook register
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !phone || !password || !confirmPassword) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      message.warning('Mật khẩu và nhập lại mật khẩu không khớp');
      return;
    }

    if (phone.length !== 10 || isNaN(Number(phone))) {
      message.warning(
        'Số điện thoại phải có 10 số và không chứa ký tự khác ngoài số',
      );
      return;
    }

    setLoading(true);
    try {
      await registerAPI(name, email, password, phone);
      message.success('Đăng ký thành công');
      navigate('/login');
    } catch (err) {
      message.error('Đăng ký thất bại, thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Tạo tài khoản
          </h1>
          <p className="text-gray-600">Điền thông tin để đăng ký</p>
        </div>

        {/* Form Register */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Email
            </label>
            <Input
              size="large"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Họ và tên
            </label>
            <Input
              size="large"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Số điện thoại
            </label>
            <Input
              size="large"
              type="text"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Mật khẩu
            </label>
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Nhập lại mật khẩu
            </label>
            <Input.Password
              size="large"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            htmlType="submit"
            type="default"
            size="large"
            loading={loading}
            className="w-full ant-btn ant-btn-primary button-ui"
          >
            Đăng ký
          </Button>
        </form>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <Button type="link" size="large" onClick={handleBackToLogin}>
            Quay lại trang đăng nhập
          </Button>
        </div>
      </Card>
    </div>
  );
};
