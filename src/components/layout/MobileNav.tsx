import { useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png';

const pageTitles: Record<string, string> = {
  '/': 'Ital Panini',
  '/products': 'Produits',
  '/print': 'Impression',
  '/settings': 'Réglages',
};

export function MobileNav() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Ital Panini';
  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/70 glass border-b border-border/40 lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex h-14 items-center px-4 gap-3">
        <img src={logo} alt="Ital Panini" className="h-8 w-8 rounded-lg object-contain" />
        <span className={cn('font-bold text-foreground', isHome ? 'text-[17px]' : 'text-[17px]')}>{title}</span>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}