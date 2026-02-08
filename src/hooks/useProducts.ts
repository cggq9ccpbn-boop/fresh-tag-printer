import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, AllergenId } from '@/types';

interface SupabaseProduct {
  id: string;
  name: string;
  photo: string | null;
  category_id: string | null;
  allergens: string[];
  shelf_life_days: number;
  shelf_life_hours: number;
  dlc_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

function mapSupabaseToProduct(sp: SupabaseProduct): Product {
  return {
    id: sp.id,
    name: sp.name,
    photo: sp.photo,
    category: sp.category_id || 'other',
    allergens: sp.allergens as AllergenId[],
    shelfLifeDays: sp.shelf_life_days,
    shelfLifeHours: sp.shelf_life_hours,
    dlcType: sp.dlc_type as 'dlc' | 'ddm',
    createdAt: sp.created_at,
    updatedAt: sp.updated_at,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts((data || []).map(mapSupabaseToProduct));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        photo: product.photo,
        category_id: product.category === 'other' ? null : product.category,
        allergens: product.allergens,
        shelf_life_days: product.shelfLifeDays,
        shelf_life_hours: product.shelfLifeHours,
        dlc_type: product.dlcType,
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    const newProduct = mapSupabaseToProduct(data);
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.photo !== undefined) updateData.photo = updates.photo;
    if (updates.category !== undefined) updateData.category_id = updates.category === 'other' ? null : updates.category;
    if (updates.allergens !== undefined) updateData.allergens = updates.allergens;
    if (updates.shelfLifeDays !== undefined) updateData.shelf_life_days = updates.shelfLifeDays;
    if (updates.shelfLifeHours !== undefined) updateData.shelf_life_hours = updates.shelfLifeHours;
    if (updates.dlcType !== undefined) updateData.dlc_type = updates.dlcType;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating product:', error);
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProduct = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refetch: fetchProducts,
  };
}
