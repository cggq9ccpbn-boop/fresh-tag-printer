// Types pour l'application d'étiquettes alimentaires

export interface DistributorSettings {
  companyName: string;
  logo: string | null;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  vatNumber: string;
  siret: string;
  printerIp: string;
  printerPort: number;
}

export const ALLERGENS = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'crustaceans', label: 'Crustacés', icon: '🦐' },
  { id: 'eggs', label: 'Œufs', icon: '🥚' },
  { id: 'fish', label: 'Poisson', icon: '🐟' },
  { id: 'peanuts', label: 'Arachides', icon: '🥜' },
  { id: 'soy', label: 'Soja', icon: '🫘' },
  { id: 'milk', label: 'Lait', icon: '🥛' },
  { id: 'nuts', label: 'Fruits à coque', icon: '🌰' },
  { id: 'celery', label: 'Céleri', icon: '🥬' },
  { id: 'mustard', label: 'Moutarde', icon: '🟡' },
  { id: 'sesame', label: 'Sésame', icon: '🔘' },
  { id: 'sulfites', label: 'Sulfites', icon: '🍷' },
  { id: 'lupin', label: 'Lupin', icon: '🌸' },
  { id: 'mollusks', label: 'Mollusques', icon: '🦪' },
] as const;

export type AllergenId = typeof ALLERGENS[number]['id'];

export const CATEGORIES = [
  { id: 'sandwiches', label: 'Sandwichs', icon: '🥪' },
  { id: 'salads', label: 'Salades', icon: '🥗' },
  { id: 'drinks', label: 'Boissons', icon: '🥤' },
  { id: 'desserts', label: 'Desserts', icon: '🍰' },
  { id: 'snacks', label: 'Snacks', icon: '🍿' },
  { id: 'hot-dishes', label: 'Plats chauds', icon: '🍲' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'dairy', label: 'Produits laitiers', icon: '🧀' },
  { id: 'other', label: 'Autres', icon: '📦' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export interface Product {
  id: string;
  name: string;
  photo: string | null;
  price: number;
  category: CategoryId;
  allergens: AllergenId[];
  shelfLifeDays: number; // Durée de conservation en jours
  shelfLifeHours: number; // Durée de conservation en heures
  dlcType: 'dlc' | 'ddm'; // DLC ou DDM (Date Durabilité Minimale)
  createdAt: string;
  updatedAt: string;
}

export interface PrintQueueItem {
  id: string;
  productId: string;
  productionDate: string;
  dlcDate: string;
  quantity: number;
  createdAt: string;
}

export interface LabelData {
  product: Product;
  settings: DistributorSettings;
  productionDate: Date;
  dlcDate: Date;
  quantity: number;
}

export const DEFAULT_SETTINGS: DistributorSettings = {
  companyName: '',
  logo: null,
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  vatNumber: '',
  siret: '',
  printerIp: '192.168.1.100',
  printerPort: 9100,
};
