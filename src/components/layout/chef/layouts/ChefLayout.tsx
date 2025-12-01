import type { ReactNode } from 'react';
import PanelLayout from './PanelLayout';
import { chefNav } from './navConfig';

export default function ChefLayout({ children }: { children?: ReactNode }) {
  return (
    <PanelLayout title="Khu Bếp" navItems={chefNav}>
      {children}
    </PanelLayout>
  );
}
