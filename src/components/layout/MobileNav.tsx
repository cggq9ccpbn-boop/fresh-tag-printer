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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex h-14 items-center px-4 gap-3">
        <img src={logo} alt="Ital Panini" className="h-8 w-8 rounded-lg object-contain" />
        <span className="font-semibold text-foreground text-[17px]">{title}</span>
      </div>
    </header>
  );
}
