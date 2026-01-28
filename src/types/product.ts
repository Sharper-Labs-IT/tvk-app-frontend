export type ProductType = 'physical' | 'digital' | 'game_item';
export type ProductStatus = 'active' | 'inactive';

export interface ProductMedia {
  id?: number;
  url: string;
  type: 'image' | 'video';
  is_primary: boolean;
  alt_text?: string;
}

export interface ProductVariant {
  id?: number;
  name: string;
  sku?: string;
  price_adjustment?: number;
  stock_quantity: number;
  attributes: Record<string, string>; // e.g. { color: "Red", size: "Large" }
  image_url?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface GameItemMetadata {
  game_item_type: string; // "coins", "power_up", "weapon"
  coins_amount?: number;
  bonus_coins?: number;
  effect_duration?: number;
  custom_data?: Record<string, any>;
}

export interface ProductDimensions {
  weight: number; // kg
  length: number; // cm
  width: number; // cm
  height: number; // cm
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  type: ProductType;
  status: ProductStatus;
  
  // Pricing
  price: number;
  discount_price?: number;
  
  // Inventory
  stock_quantity: number;
  track_inventory: boolean;
  
  // Content
  short_description?: string;
  description?: string;
  media: ProductMedia[];
  
  // Physical specific
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shipping_cost?: number;

  // Game Item specific
  game_item_metadata?: GameItemMetadata;

  // Variants
  has_variants: boolean;
  variants_count?: number;
  variants?: ProductVariant[];

  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilterParams {
  search?: string;
  category_id?: number;
  type?: ProductType[]; // Multi-select support
  status?: ProductStatus;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  products_count?: number;
}
