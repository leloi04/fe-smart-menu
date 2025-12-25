import { CHEF_ROLE } from '@/types/global.constanst';
import { useCurrentApp } from '../context/app.context';
import { Button, Result } from 'antd';

interface IProps {
  children: React.ReactNode;
}

const ProtectedChef = ({ children }: IProps) => {
  const { isAuthenticated, user } = useCurrentApp();

  if (!isAuthenticated) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <div>
            <Button type="primary">
              <a href="/">Back Home</a>
            </Button>
            <span className="mr-2 ml-2">or</span>
            <Button type="primary">
              <a href="/login">Đăng nhập</a>
            </Button>
          </div>
        }
      />
    );
  }

  if (user?.role?.name !== CHEF_ROLE) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <div>
            <Button type="primary">
              <a href="/">Back Home</a>
            </Button>
            <span className="mr-2 ml-2">or</span>
            <Button type="primary">
              <a href="/login">Đăng nhập</a>
            </Button>
          </div>
        }
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedChef;
