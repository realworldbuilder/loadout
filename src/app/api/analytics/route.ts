import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator_id = searchParams.get('creator_id');

    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalViewsRes, todayViewsRes, last7ViewsRes, last30ViewsRes] = await Promise.all([
      supabase.from('page_views').select('id', { count: 'exact' }).eq('creator_id', creator_id),
      supabase.from('page_views').select('id', { count: 'exact' }).eq('creator_id', creator_id).gte('timestamp', today.toISOString()),
      supabase.from('page_views').select('id', { count: 'exact' }).eq('creator_id', creator_id).gte('timestamp', last7days.toISOString()),
      supabase.from('page_views').select('id', { count: 'exact' }).eq('creator_id', creator_id).gte('timestamp', last30days.toISOString()),
    ]);

    const [totalClicksRes, todayClicksRes, last7ClicksRes, last30ClicksRes] = await Promise.all([
      supabase.from('link_clicks').select('id', { count: 'exact' }).eq('creator_id', creator_id),
      supabase.from('link_clicks').select('id', { count: 'exact' }).eq('creator_id', creator_id).gte('timestamp', today.toISOString()),
      supabase.from('link_clicks').select('id', { count: 'exact' }).eq('creator_id', creator_id).gte('timestamp', last7days.toISOString()),
      supabase.from('link_clicks').select('id', { count: 'exact' }).eq('creator_id', creator_id).gte('timestamp', last30days.toISOString()),
    ]);

    const { data: viewsByDayData } = await supabase
      .from('page_views')
      .select('timestamp')
      .eq('creator_id', creator_id)
      .gte('timestamp', last30days.toISOString())
      .order('timestamp', { ascending: true });

    const viewsByDay = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = viewsByDayData?.filter(v => v.timestamp.startsWith(dateStr)).length || 0;
      viewsByDay.push({ date: dateStr, count });
    }

    const { data: topProductsData } = await supabase
      .from('link_clicks')
      .select('product_id, products (id, title, product_type)')
      .eq('creator_id', creator_id)
      .gte('timestamp', last30days.toISOString());

    const productCounts: Record<string, { id: string; title: string; product_type: string; clicks: number }> = {};
    topProductsData?.forEach((click: any) => {
      if (click.products) {
        const pid = click.product_id;
        if (!productCounts[pid]) productCounts[pid] = { ...click.products, clicks: 0 };
        productCounts[pid].clicks++;
      }
    });
    const topProducts = Object.values(productCounts).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

    const { data: referrersData } = await supabase
      .from('page_views')
      .select('referrer')
      .eq('creator_id', creator_id)
      .gte('timestamp', last30days.toISOString());

    const referrerCounts: Record<string, number> = {};
    referrersData?.forEach((view: any) => {
      let referrer = 'Direct';
      if (view.referrer) {
        try { referrer = new URL(view.referrer).hostname.replace('www.', ''); } catch { referrer = 'Other'; }
      }
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });
    const referrers = Object.entries(referrerCounts).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    return NextResponse.json({
      pageViews: { total: totalViewsRes.count || 0, today: todayViewsRes.count || 0, last7days: last7ViewsRes.count || 0, last30days: last30ViewsRes.count || 0 },
      clicks: { total: totalClicksRes.count || 0, today: todayClicksRes.count || 0, last7days: last7ClicksRes.count || 0, last30days: last30ClicksRes.count || 0 },
      topProducts,
      referrers,
      viewsByDay,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
