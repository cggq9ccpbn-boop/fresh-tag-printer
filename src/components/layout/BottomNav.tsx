import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, Printer, Settings } from 'lucide-react';
import { usePrintQueue } from '@/hooks/usePrintQueue';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Produits', href: '/products', icon: Package },
  { name: 'Imprimer', href: '/print', icon: Printer },
  { name: 'Réglages', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const { getQueueCount } = usePrintQueue();
  const queueCount = getQueueCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === '/print' && queueCount > 0;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1 px-4 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-[22px] w-[22px]', isActive && 'stroke-[2.5px]')} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold px-1">
                    {queueCount > 99 ? '99+' : queueCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px]',
                isActive ? 'font-semibold' : 'font-medium'
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
