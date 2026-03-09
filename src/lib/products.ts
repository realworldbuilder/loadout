// Removed direct Supabase client import - now using API routes

export type ProductType = 'digital' | 'coaching' | 'link' | 'subscription' | 'affiliate_link' | 'header' | 'email_collector' | 'embed' | 'coaching_form';

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
  layout?: 'classic' | 'featured';
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
  layout?: 'classic' | 'featured';
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
  layout?: 'classic' | 'featured';
}

// Fetch products for a creator, ordered by sort_order
export const getCreatorProducts = async (creatorId: string) => {
  try {
    const response = await fetch(`/api/products?creator_id=${creatorId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching creator products:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to fetch products' };
    }

    const result = await response.json();
    return { data: result.data as Product[], error: null };
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
    const response = await fetch(`/api/products?id=${productId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching product:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to fetch product' };
    }

    const result = await response.json();
    return { data: result.data as Product, error: null };
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
    // Set default values
    const newProduct = {
      ...productData,
      is_active: productData.is_active ?? true,
      sort_order: productData.sort_order ?? 0,
    };

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating product:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to create product' };
    }

    const result = await response.json();
    return { data: result.data as Product, error: null };
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
    const response = await fetch('/api/products', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId, ...updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating product:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to update product' };
    }

    const result = await response.json();
    return { data: result.data as Product, error: null };
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
    const response = await fetch('/api/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error deleting product:', errorData.error);
      return { error: errorData.error || 'Failed to delete product' };
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
    const response = await fetch('/api/products', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId, is_active: isActive }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error toggling product status:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to toggle product status' };
    }

    const result = await response.json();
    return { data: result.data as Product, error: null };
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
    const response = await fetch('/api/products', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: productId, sort_order: sortOrder }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error updating product order:', errorData.error);
      return { data: null, error: errorData.error || 'Failed to update product order' };
    }

    const result = await response.json();
    return { data: result.data as Product, error: null };
  } catch (error) {
    console.error('Error updating product order:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update product order' 
    };
  }
};