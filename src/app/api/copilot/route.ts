import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAuthenticatedUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // This is a read operation, we don't need to set cookies
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

async function getCreatorData(userId: string) {
  const supabase = getServiceSupabase();
  
  // Get creator profile
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (creatorError || !creator) {
    throw new Error('Creator not found');
  }

  // Get products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Get recent orders (last 30 days for analytics)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: recentOrders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('status', 'completed')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Get page views (if available)
  const { data: pageViews, error: viewsError } = await supabase
    .from('page_views')
    .select('*')
    .eq('creator_id', creator.id)
    .gte('created_at', thirtyDaysAgo.toISOString());

  return {
    creator,
    products: products || [],
    recentOrders: recentOrders || [],
    pageViews: pageViews || []
  };
}

function generateSystemPrompt(creatorData: any) {
  const { creator, products, recentOrders, pageViews } = creatorData;
  
  const productsList = products.map((p: any) => 
    `- ${p.title}: ${p.description ? p.description.substring(0, 100) : 'No description'} (${p.price_cents/100} USD)`
  ).join('\n');

  const revenue = recentOrders.reduce((sum: number, order: any) => sum + (order.amount_cents || 0), 0) / 100;
  const orderCount = recentOrders.length;
  const viewCount = pageViews.length;

  return `You are a Creator Copilot AI assistant for ${creator.display_name || creator.handle} on Loadout.fit. You help fitness creators manage their storefront and grow their business.

CREATOR CONTEXT:
- Name: ${creator.display_name || creator.handle}
- Handle: @${creator.handle}
- Bio: ${creator.bio || 'No bio set'}
- Tier: ${creator.tier}
- Current Products: ${products.length}

CURRENT PRODUCTS:
${productsList || 'No products yet'}

RECENT PERFORMANCE (last 30 days):
- Revenue: $${revenue}
- Orders: ${orderCount}
- Page Views: ${viewCount}

YOUR CAPABILITIES:
1. **Page Builder** - Help write/update bio, brand descriptions
2. **Product Descriptions** - Generate compelling product copy  
3. **Pricing Strategy** - Analyze pricing and suggest improvements
4. **Content Ideas** - Generate social media content ideas
5. **Analytics Insights** - Explain performance data in plain English

RESPONSE STYLE:
- Conversational, encouraging, fitness industry-aware
- Use lowercase style (like the Loadout brand voice)
- Be specific and actionable
- When suggesting actions, ask for confirmation before executing

AVAILABLE ACTIONS:
- update_bio: Update the creator's bio
- create_product_draft: Create a new product (always as draft)
- update_product_description: Update existing product description
- Never delete anything without explicit confirmation

Always respond in JSON format:
{
  "message": "your response text",
  "suggested_actions": [
    {
      "type": "update_bio" | "create_product_draft" | "update_product_description",
      "description": "what this action does",
      "data": { /* action-specific data */ }
    }
  ],
  "follow_up_suggestions": ["suggestion 1", "suggestion 2"]
}`;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { message, action_data } = await request.json();

    if (!message && !action_data) {
      return NextResponse.json(
        { error: 'Message or action_data required' },
        { status: 400 }
      );
    }

    // Handle action execution
    if (action_data) {
      return await handleAction(user.id, action_data);
    }

    // Get creator data for context
    const creatorData = await getCreatorData(user.id);
    const systemPrompt = generateSystemPrompt(creatorData);

    // Stream response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // Create a readable stream for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Copilot API error:', error);
    
    // Return a fallback JSON response if streaming fails
    const fallbackResponse = {
      message: "i'm here to help you grow your fitness business! try asking me to:\n\n• write your bio\n• create product descriptions\n• analyze your sales performance\n• suggest content ideas\n\nwhat would you like to work on?",
      suggested_actions: [],
      follow_up_suggestions: [
        "write my bio",
        "how are my sales doing?",
        "create instagram captions for my program"
      ]
    };
    
    return NextResponse.json(fallbackResponse);
  }
}

async function handleAction(userId: string, actionData: any) {
  const supabase = getServiceSupabase();
  const { type, data } = actionData;

  try {
    // Get creator ID first
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    switch (type) {
      case 'update_bio':
        const { error: bioError } = await supabase
          .from('creators')
          .update({ bio: data.bio })
          .eq('id', creator.id);

        if (bioError) throw bioError;

        return NextResponse.json({
          success: true,
          message: 'bio updated successfully!'
        });

      case 'create_product_draft':
        const productData = {
          creator_id: creator.id,
          title: data.title,
          description: data.description,
          price_cents: Math.round(data.price * 100),
          type: data.type || 'digital',
          is_active: false, // Always create as draft
          sort_order: 0,
          metadata: {}
        };

        const { data: product, error: productError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (productError) throw productError;

        return NextResponse.json({
          success: true,
          message: 'product draft created successfully!',
          data: product
        });

      case 'update_product_description':
        const { error: descError } = await supabase
          .from('products')
          .update({ description: data.description })
          .eq('id', data.product_id)
          .eq('creator_id', creator.id); // Ensure ownership

        if (descError) throw descError;

        return NextResponse.json({
          success: true,
          message: 'product description updated successfully!'
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return NextResponse.json(
      { error: 'Action execution failed' },
      { status: 500 }
    );
  }
}