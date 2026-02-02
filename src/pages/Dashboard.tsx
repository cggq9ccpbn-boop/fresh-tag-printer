import { Link } from 'react-router-dom';
import { Package, Settings, Printer, ArrowRight, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { usePrintQueue } from '@/hooks/usePrintQueue';
import { useSettings } from '@/hooks/useSettings';

export default function Dashboard() {
  const { products } = useProducts();
  const { queue, getQueueCount } = usePrintQueue();
  const { isConfigured } = useSettings();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Gérez vos étiquettes alimentaires en un clic
        </p>
      </div>

      {/* Alerte si non configuré */}
      {!isConfigured() && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">Configuration requise</p>
              <p className="text-sm text-amber-700">
                Configurez les informations de votre distributeur pour commencer
              </p>
            </div>
            <Link to="/settings" className="w-full sm:w-auto">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 w-full sm:w-auto">
                Configurer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produits
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              dans le catalogue
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              File d'impression
            </CardTitle>
            <Printer className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{getQueueCount()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              étiquettes en attente
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tâches
            </CardTitle>
            <Tag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{queue.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              impressions différentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link to="/products">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group h-full">
              <CardContent className="flex items-center gap-4 py-4 sm:py-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Gérer les produits</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Ajouter, modifier ou supprimer</CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/print">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group h-full">
              <CardContent className="flex items-center gap-4 py-4 sm:py-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Imprimer des étiquettes</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Créer et lancer une impression</CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/settings" className="sm:col-span-2 lg:col-span-1">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group h-full">
              <CardContent className="flex items-center gap-4 py-4 sm:py-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base">Paramètres</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configurer le distributeur</CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* File d'impression si elle existe */}
      {queue.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">File d'impression</h2>
            <Link to="/print">
              <Button className="w-full sm:w-auto">
                Voir la file
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground text-sm sm:text-base">
                {queue.length} produit{queue.length > 1 ? 's' : ''} en attente
                ({getQueueCount()} étiquette{getQueueCount() > 1 ? 's' : ''} au total)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
