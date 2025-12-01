import type { ReactNode } from 'react';
import PanelLayout from './PanelLayout';
import { adminNav } from './navConfig';

export default function AdminLayout({ children }: { children?: ReactNode }) {
  return (
    <PanelLayout title="Quản trị Hệ thống" navItems={adminNav}>
      {children}
    </PanelLayout>
  );
}
