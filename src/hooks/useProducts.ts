import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Product } from '@/types';

const PRODUCTS_KEY = 'food-labels-products';

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>(PRODUCTS_KEY, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }, [setProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, [setProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, [setProducts]);

  const getProduct = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  return {
    products,
    loading: false,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    refetch: () => {},
  };
}
