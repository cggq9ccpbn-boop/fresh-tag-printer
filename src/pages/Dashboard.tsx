import { Link } from 'react-router-dom';
import { Package, Settings, Printer, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';

export default function Dashboard() {
  const { products } = useProducts();
  const { queue, getQueueCount } = usePrintQueue();
  const { isConfigured } = useSettings();

  return (
    <div className="space-y-8 pt-4 animate-fade-up">
      {/* Alert */}
      {!isConfigured() && (
        <Link to="/settings" className="block">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/8 border border-accent/15">
            <div className="h-10 w-10 rounded-full bg-accent/12 flex items-center justify-center">
              <Settings className="h-4.5 w-4.5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-accent">Configuration requise</p>
              <p className="text-[12px] text-muted-foreground">Configurez votre distributeur</p>
            </div>
            <ChevronRight className="h-4 w-4 text-accent/40" />
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: products.length, label: 'Produits', emoji: '📦' },
          { value: getQueueCount(), label: 'Étiquettes', emoji: '🏷️' },
          { value: queue.length, label: 'En file', emoji: '🖨️' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-card p-4 text-center">
            <span className="text-xl mb-1 block">{stat.emoji}</span>
            <span className="text-xl font-bold tracking-tight block">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-card overflow-hidden divide-y divide-border">
        {[
          { to: '/products', icon: Package, title: 'Produits', desc: 'Ajouter et gérer', color: 'text-primary bg-primary/10' },
          { to: '/print', icon: Printer, title: 'Impression', desc: queue.length > 0 ? `${getQueueCount()} en attente` : 'Créer des étiquettes', color: 'text-gold bg-gold-muted' },
          { to: '/settings', icon: Settings, title: 'Paramètres', desc: 'Distributeur et imprimante', color: 'text-muted-foreground bg-muted' },
        ].map((action) => (
          <Link key={action.to} to={action.to}>
            <div className="flex items-center gap-4 px-4 py-3.5 active:bg-muted/50 transition-colors">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold">{action.title}</p>
                <p className="text-[12px] text-muted-foreground">{action.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </div>
          </Link>
        ))}
      </div>

      {/* Queue summary */}
      {queue.length > 0 && (
        <Link to="/print" className="block">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/8 border border-primary/12">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
              <Printer className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">{getQueueCount()} étiquette{getQueueCount() > 1 ? 's' : ''}</p>
              <p className="text-[12px] text-muted-foreground">Prêt à imprimer</p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary/40" />
          </div>
        </Link>
      )}
    </div>
  );
}