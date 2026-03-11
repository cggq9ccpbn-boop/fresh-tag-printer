import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-60">
        <div className="min-h-screen lg:pt-0 px-4 pb-20 lg:pb-8 lg:px-8"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}