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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 glass border-t border-border/50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-[50px]">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const showBadge = item.href === '/print' && queueCount > 0;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex flex-col items-center justify-center gap-[2px] py-1 px-5"
            >
              <div className="relative">
                <Icon className={cn(
                  'h-[21px] w-[21px] transition-colors',
                  isActive ? 'text-primary stroke-[2.5px]' : 'text-muted-foreground stroke-[1.8px]'
                )} />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-accent text-accent-foreground text-[8px] font-bold px-0.5">
                    {queueCount > 9 ? '9+' : queueCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px]',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground font-medium'
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