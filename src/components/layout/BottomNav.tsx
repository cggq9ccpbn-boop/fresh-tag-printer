import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, Settings, Printer } from 'lucide-react';
import { usePrintQueue } from '@/hooks/usePrintQueue';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Produits', href: '/products', icon: Package },
  { name: 'Impression', href: '/print', icon: Printer },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const { getQueueCount } = usePrintQueue();
  const queueCount = getQueueCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === '/print' && queueCount > 0;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[4rem]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <div className={cn(
                  'p-1.5 rounded-xl transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}>
                  <Icon className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive && 'scale-110'
                  )} />
                </div>
                {showBadge && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                    {queueCount > 99 ? '99+' : queueCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all duration-200',
                isActive && 'font-semibold'
              )}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
