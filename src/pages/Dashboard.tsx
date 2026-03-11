import { Link } from 'react-router-dom';
import { Package, Settings, Printer, ArrowRight } from 'lucide-react';
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
    <div className="space-y-6 pt-2">
      {/* Alerte si non configuré */}
      {!isConfigured() && (
        <Link to="/settings">
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="flex items-center gap-3 py-3">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Settings className="h-4.5 w-4.5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-accent">Configuration requise</p>
                <p className="text-xs text-muted-foreground">Configurez votre distributeur</p>
              </div>
              <ArrowRight className="h-4 w-4 text-accent flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-4 px-3 text-center">
            <div className="text-2xl font-bold text-foreground">{products.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Produits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-3 text-center">
            <div className="text-2xl font-bold text-foreground">{getQueueCount()}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Étiquettes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-3 text-center">
            <div className="text-2xl font-bold text-foreground">{queue.length}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">En file</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-2">
          <Link to="/products">
            <Card className="active:scale-[0.98] transition-transform">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Gérer les produits</p>
                  <p className="text-xs text-muted-foreground">Ajouter, modifier, supprimer</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/print">
            <Card className="active:scale-[0.98] transition-transform">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Printer className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Imprimer des étiquettes</p>
                  <p className="text-xs text-muted-foreground">
                    {queue.length > 0 ? `${getQueueCount()} en attente` : 'Créer et imprimer'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/settings">
            <Card className="active:scale-[0.98] transition-transform">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Paramètres</p>
                  <p className="text-xs text-muted-foreground">Distributeur et imprimante</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* File d'impression */}
      {queue.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">File d'impression</h2>
            <Link to="/print">
              <Button size="sm" variant="ghost" className="text-primary text-xs h-7">
                Voir tout
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground">
                {queue.length} produit{queue.length > 1 ? 's' : ''} — {getQueueCount()} étiquette{getQueueCount() > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
