// Page builder block types — these are NOT real products
export const PAGE_BLOCK_TYPES = [
  'header',
  'text_block',
  'countdown_block',
  'picks_block',
  'codes_block',
  'video_block',
  'image_block',
  'pinterest_block',
  'instagram_block',
  'tiktok_block',
  'spotify_block',
  'embed',
  'email_collector',
] as const;

// Real sellable product types
export const REAL_PRODUCT_TYPES = [
  'digital',
  'coaching_form',
  'link',
  'coaching',
  'subscription',
  'affiliate_link',
] as const;

export function isPageBlock(type: string): boolean {
  return PAGE_BLOCK_TYPES.includes(type as any) || type.endsWith('_block');
}

export function isRealProduct(type: string): boolean {
  return !isPageBlock(type);
}
