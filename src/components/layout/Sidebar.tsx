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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/60 hidden lg:flex lg:flex-col shadow-soft">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border/60">
        <img src={logo} alt="Ital Panini" className="h-9 w-9 rounded-xl object-contain" />
        <span className="font-bold text-foreground tracking-tight">Ital Panini</span>
      </div>
      
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === '/print' && queueCount > 0;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'gradient-primary text-primary-foreground shadow-card'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <span className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-bold px-1.5",
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