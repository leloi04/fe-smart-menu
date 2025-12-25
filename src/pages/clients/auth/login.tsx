import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button, Card, Input, message } from 'antd';
import { loginAPI } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';
import {
  ADMIN_ROLE_ID,
  CHEF_ROLE_ID,
  STAFF_ROLE_ID,
} from '@/types/global.constanst';

export const LoginPage = () => {
  const { setIsAuthenticated, setUser } = useCurrentApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      message.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAPI(email, password);

      if (!res?.data) {
        throw new Error(res?.message || 'Sai thông tin đăng nhập');
      }

      const role = res.data.user.role;
      const userInfo = {
        userId: res.data.user._id,
        name: res.data.user.name,
        isGuest: false,
      };
      setIsAuthenticated(true);
      setUser(res.data.user as any);
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      message.success(res.message);

      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl), { replace: true });
        return;
      }

      switch (role._id) {
        case ADMIN_ROLE_ID:
          navigate('/admin');
          break;
        case CHEF_ROLE_ID:
          navigate('/chef');
          break;
        case STAFF_ROLE_ID:
          navigate('/staff');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err: any) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Thêm logic OAuth Google ở đây
    message.info('Đăng nhập với Google chưa được triển khai');
  };

  const handleRegister = () => {
    navigate('/register');
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
            Restaurant Management
          </h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              Mật khẩu
            </label>
            <Input.Password
              size="large"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            htmlType="submit"
            type="default"
            size="large"
            loading={loading}
            className="w-full ant-btn ant-btn-primary button-ui"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Google Login & Register */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-3">
          <Button
            type="default"
            size="large"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
          >
            <div className="text-[#FF6B35]">Đăng nhập với Google</div>
          </Button>

          <Button
            type="link"
            size="large"
            className="w-full text-center"
            onClick={handleRegister}
          >
            Chưa có tài khoản? Đăng ký
          </Button>
        </div>
      </Card>
    </div>
  );
};
