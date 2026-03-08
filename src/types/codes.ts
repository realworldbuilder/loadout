export interface CodePick {
  id: string;
  code_id: string;
  title: string;
  image_url?: string;
  product_url: string;
  sort_order: number;
  click_count: number;
  created_at: string;
}

export interface CreatorCode {
  id: string;
  creator_id: string;
  brand_name: string;
  brand_logo_url?: string;
  code_text: string;
  discount_description?: string;
  store_url?: string;
  category: string;
  is_featured: boolean;
  expires_at?: string;
  click_count: number;
  copy_count: number;
  created_at: string;
  updated_at: string;
  picks?: CodePick[];
}