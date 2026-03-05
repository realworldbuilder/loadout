import { createSupabaseClient } from './supabase';

export async function uploadFile(
  bucket: 'avatars' | 'thumbnails' | 'products',
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload error:', err);
    return { url: null, error: 'Failed to upload file' };
  }
}

export async function uploadAvatar(file: File, userId: string): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  return uploadFile('avatars', file, path);
}

export async function uploadThumbnail(file: File, creatorId: string, productId?: string): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const id = productId || Date.now().toString();
  const path = `${creatorId}/${id}.${ext}`;
  return uploadFile('thumbnails', file, path);
}

export async function uploadProductFile(file: File, creatorId: string, productId?: string): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const id = productId || Date.now().toString();
  const path = `${creatorId}/${id}.${ext}`;
  return uploadFile('products', file, path);
}
