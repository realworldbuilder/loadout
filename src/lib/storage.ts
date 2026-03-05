export async function uploadFile(
  bucket: 'avatars' | 'thumbnails' | 'products',
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('path', path);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return { url: null, error: data.error || 'Upload failed' };
    }

    return { url: data.url, error: null };
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
