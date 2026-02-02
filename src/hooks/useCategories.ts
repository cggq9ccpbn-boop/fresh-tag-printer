import { useLocalStorage } from './useLocalStorage';
import { Category, DEFAULT_CATEGORIES } from '@/types';

const CATEGORIES_KEY = 'food-labels-categories';

export function useCategories() {
  const [categories, setCategories] = useLocalStorage<Category[]>(
    CATEGORIES_KEY,
    DEFAULT_CATEGORIES
  );

  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = `custom-${Date.now()}`;
    const newCategory: Category = { ...category, id };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const getCategory = (id: string) => {
    return categories.find((cat) => cat.id === id);
  };

  const resetToDefault = () => {
    setCategories(DEFAULT_CATEGORIES);
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    resetToDefault,
  };
}
