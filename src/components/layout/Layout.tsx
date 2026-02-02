import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <Sidebar />
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
