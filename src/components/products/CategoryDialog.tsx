import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, RotateCcw, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMOJI_SUGGESTIONS = ['🍽️', '🍕', '🍔', '🌮', '🥙', '🍜', '🍣', '🥐', '🧁', '☕', '🍵', '🥤', '🍺', '🧃', '🍦', '🎂', '🥨', '🧇', '🥓', '🥩'];

export function CategoryDialog({ open, onOpenChange }: CategoryDialogProps) {
  const { categories, addCategory, deleteCategory, resetToDefault } = useCategories();
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleAddCategory = () => {
    if (!newLabel.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    addCategory({ label: newLabel.trim(), icon: newIcon });
    toast.success(`Catégorie "${newLabel}" créée`);
    setNewLabel('');
    setNewIcon('📦');
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      toast.success(`Catégorie "${categoryToDelete.label}" supprimée`);
      setCategoryToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleReset = () => {
    resetToDefault();
    toast.success('Catégories réinitialisées');
    setResetConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle>Gérer les catégories</DialogTitle>
                <DialogDescription>Créez ou supprimez des catégories de produits</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nouvelle catégorie */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border/50">
              <Label className="text-sm font-medium">Nouvelle catégorie</Label>
              <div className="flex gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Icône</Label>
                  <Input
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-16 text-center text-lg h-11"
                    maxLength={2}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Nom</Label>
                  <Input
                    placeholder="Ex: Pâtisseries"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="h-11"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddCategory} className="h-11">
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
              
              {/* Suggestions d'emoji */}
              <div className="flex flex-wrap gap-1">
                {EMOJI_SUGGESTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewIcon(emoji)}
                    className={`h-8 w-8 rounded-lg text-lg hover:bg-accent transition-colors ${
                      newIcon === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des catégories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Catégories existantes ({categories.length})</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetConfirmOpen(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Réinitialiser
                </Button>
              </div>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium">{category.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(category)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.icon} {categoryToDelete?.label}" ?
              Les produits utilisant cette catégorie ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de réinitialisation */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les catégories ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela supprimera toutes vos catégories personnalisées et restaurera les catégories par défaut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
