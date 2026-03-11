import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-64">
        <div className="min-h-screen pt-18 lg:pt-0 px-4 pb-24 lg:pb-8 lg:px-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
