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
  bceNumber: string;
  printerIp: string;
  printerPort: number;
  // Label customization
  labelWidth: number;
  labelHeight: number;
  fontSizeTitle: number;
  fontSizeBody: number;
  fontSizeLegal: number;
  textAlign: 'left' | 'center' | 'right';
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

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'sandwiches', label: 'Sandwichs', icon: '🥪' },
  { id: 'salads', label: 'Salades', icon: '🥗' },
  { id: 'drinks', label: 'Boissons', icon: '🥤' },
  { id: 'desserts', label: 'Desserts', icon: '🍰' },
  { id: 'snacks', label: 'Snacks', icon: '🍿' },
  { id: 'hot-dishes', label: 'Plats chauds', icon: '🍲' },
  { id: 'fruits', label: 'Fruits', icon: '🍎' },
  { id: 'dairy', label: 'Produits laitiers', icon: '🧀' },
  { id: 'other', label: 'Autres', icon: '📦' },
];

export type CategoryId = string;

export interface Product {
  id: string;
  name: string;
  photo: string | null;
  category: CategoryId;
  allergens: AllergenId[];
  shelfLifeDays: number;
  shelfLifeHours: number;
  dlcType: 'dlc' | 'ddm';
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
  bceNumber: '',
  printerIp: '192.168.1.100',
  printerPort: 9100,
  labelWidth: 50,
  labelHeight: 80,
  fontSizeTitle: 14,
  fontSizeBody: 10,
  fontSizeLegal: 8,
  textAlign: 'left',
};
