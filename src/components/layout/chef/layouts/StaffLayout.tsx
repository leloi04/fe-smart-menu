import type { ReactNode } from 'react';
import PanelLayout from './PanelLayout';
import { staffNav } from './navConfig';

export default function StaffLayout({
  children,
  headerActions,
}: {
  children?: ReactNode;
  headerActions?: ReactNode;
}) {
  return (
    <PanelLayout
      title="Nhân viên"
      navItems={staffNav}
      headerActions={headerActions}
    >
      {children}
    </PanelLayout>
  );
}
