import { NextRequest, NextResponse } from 'next/server';

// Receives product data from the bookmarklet and redirects to dashboard with pre-filled data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const image = searchParams.get('image') || '';
  const url = searchParams.get('url') || '';
  const price = searchParams.get('price') || '';

  // Store in a cookie/session param and redirect to picks page
  const pickData = JSON.stringify({ title, image_url: image, product_url: url, price });
  
  // Redirect to dashboard picks with data encoded in hash
  const redirectUrl = `/dashboard/picks#add=${encodeURIComponent(pickData)}`;
  
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
