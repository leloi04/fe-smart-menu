import { Outlet } from 'react-router-dom';
import PanelLayout from './PanelLayout';
import { adminNav } from './navConfig';

export default function AdminLayout() {
  return (
    <PanelLayout title="Quản trị Hệ thống" navItems={adminNav}>
      <Outlet />
    </PanelLayout>
  );
}
