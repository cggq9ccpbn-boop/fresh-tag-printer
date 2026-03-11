import { Link } from 'react-router-dom';
import { Package, Settings, Printer, ArrowRight, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';

export default function Dashboard() {
  const { products } = useProducts();
  const { queue, getQueueCount } = usePrintQueue();
  const { isConfigured } = useSettings();

  return (
    <div className="space-y-6 pt-2 animate-fade-in">
      {/* Alerte si non configuré */}
      {!isConfigured() && (
        <Link to="/settings">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-4 transition-all hover:shadow-card active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-accent">Configuration requise</p>
                <p className="text-xs text-muted-foreground mt-0.5">Configurez votre distributeur pour commencer</p>
              </div>
              <ArrowRight className="h-4 w-4 text-accent flex-shrink-0" />
            </div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-4 shadow-card transition-all hover:shadow-elevated">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center mb-1">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">{products.length}</span>
            <span className="text-[11px] font-medium text-muted-foreground">Produits</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-4 shadow-card transition-all hover:shadow-elevated">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-xl gradient-gold flex items-center justify-center mb-1">
              <Tag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">{getQueueCount()}</span>
            <span className="text-[11px] font-medium text-muted-foreground">Étiquettes</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-4 shadow-card transition-all hover:shadow-elevated">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-secondary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">{queue.length}</span>
            <span className="text-[11px] font-medium text-muted-foreground">En file</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-2.5">
          {[
            { to: '/products', icon: Package, color: 'gradient-primary', title: 'Gérer les produits', desc: 'Ajouter, modifier, supprimer' },
            { to: '/print', icon: Printer, color: 'gradient-gold', title: 'Imprimer des étiquettes', desc: queue.length > 0 ? `${getQueueCount()} en attente` : 'Créer et imprimer' },
            { to: '/settings', icon: Settings, color: 'bg-secondary', title: 'Paramètres', desc: 'Distributeur et imprimante' },
          ].map((action) => (
            <Link key={action.to} to={action.to}>
              <div className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-soft transition-all hover:shadow-card active:scale-[0.98]">
                <div className={`h-11 w-11 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                  <action.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* File d'impression */}
      {queue.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">File d'impression</h2>
            <Link to="/print">
              <Button size="sm" variant="ghost" className="text-primary text-xs h-7 font-semibold">
                Voir tout
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Printer className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {queue.length} produit{queue.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getQueueCount()} étiquette{getQueueCount() > 1 ? 's' : ''} à imprimer
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}