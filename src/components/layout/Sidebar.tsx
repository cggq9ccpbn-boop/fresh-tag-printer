import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, Settings, Printer } from 'lucide-react';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import logo from '@/assets/logo.png';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Produits', href: '/products', icon: Package },
  { name: 'Impression', href: '/print', icon: Printer },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { getQueueCount } = usePrintQueue();
  const queueCount = getQueueCount();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border hidden lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-border">
        <img src={logo} alt="Ital Panini" className="h-8 w-8 rounded-lg object-contain" />
        <span className="font-bold text-[15px] tracking-tight">Ital Panini</span>
      </div>
      
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === '/print' && queueCount > 0;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <span className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full text-[11px] font-bold px-1",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                )}>
                  {queueCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}