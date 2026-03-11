import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, Settings, Printer, Menu, X } from 'lucide-react';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Produits', href: '/products', icon: Package },
  { name: 'Impression', href: '/print', icon: Printer },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const location = useLocation();
  const { getQueueCount } = usePrintQueue();
  const queueCount = getQueueCount();
  const [open, setOpen] = useState(false);

  // Fermer le drawer lors d'un changement de route
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border lg:hidden">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🏷️</span>
          </div>
          <span className="font-semibold text-foreground">Étiquettes Pro</span>
        </div>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <nav className="flex flex-col gap-2 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                const showBadge = item.href === '/print' && queueCount > 0;

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {showBadge && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-sm font-bold px-2">
                        {queueCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
