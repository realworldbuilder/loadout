import { createSupabaseClient } from './supabase';

export type ProductType = 'digital' | 'coaching' | 'link' | 'subscription' | 'affiliate_link' | 'header' | 'email_collector' | 'embed';

export interface Product {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  price: number; // Regular number, not cents
  product_type: ProductType;
  external_url?: string; // For affiliate links
  file_url?: string;
  thumbnail_url?: string;
  cta_text?: string; // Call to action text
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  creator_id: string;
  title: string;
  description?: string;
  price: number;
  product_type: ProductType;
  external_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  cta_text?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  product_type?: ProductType;
  external_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  cta_text?: string;
  is_active?: boolean;
  sort_order?: number;
}

// Fetch products for a creator, ordered by sort_order
export const getCreatorProducts = async (creatorId: string) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creatorId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching creator products:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Product[], error: null };
  } catch (error) {
    console.error('Error fetching creator products:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch products' 
    };
  }
};

// Fetch single product by ID
export const getProduct = async (productId: string) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch product' 
    };
  }
};

// Create a new product
export const createProduct = async (productData: CreateProductData) => {
  try {
    const supabase = createSupabaseClient();
    
    // Set default values
    const newProduct = {
      ...productData,
      is_active: productData.is_active ?? true,
      sort_order: productData.sort_order ?? 0,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error('Error creating product:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    };
  }
};

// Update a product
export const updateProduct = async (productId: string, updates: UpdateProductData) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error('Error updating product:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update product' 
    };
  }
};

// Delete a product
export const deleteProduct = async (productId: string) => {
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
};

// Toggle product active status
export const toggleProductActive = async (productId: string, isActive: boolean) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling product status:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error('Error toggling product status:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to toggle product status' 
    };
  }
};

// Update product sort order
export const updateProductOrder = async (productId: string, sortOrder: number) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .update({ sort_order: sortOrder })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product order:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error('Error updating product order:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update product order' 
    };
  }
};