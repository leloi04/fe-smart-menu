// Trong file "@/components/layout/chef/chefLayout.tsx"

// Ví dụ về cách cập nhật ChefLayout:
import { Layout } from 'antd';
import type { ReactNode } from 'react';

const { Header, Content } = Layout;

interface ChefLayoutProps {
  children: ReactNode;
  navbarContent?: ReactNode; // Thêm prop này
}

export const ChefLayout = ({ children, navbarContent }: ChefLayoutProps) => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#333' }}>
      <Header style={{ background: '#222', padding: '0 24px', height: 'auto', lineHeight: 'normal', borderBottom: '1px solid #555' }}>
        <div style={{ padding: '16px 0' }}>
          {navbarContent} 
        </div>
      </Header>
      <Content style={{ padding: '24px', backgroundColor: '#333' }}>
        {children}
      </Content>
    </Layout>
  );
};