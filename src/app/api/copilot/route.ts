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

  // Get real products (exclude page builder blocks)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('creator_id', creator.id)
    .not('type', 'like', '%_block')
    .neq('type', 'header')
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

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: "function" as const,
    function: {
      name: "update_profile",
      description: "Update creator profile bio, display name, tagline, and social links",
      parameters: {
        type: "object",
        properties: {
          bio: { type: "string", description: "Updated bio text" },
          display_name: { type: "string", description: "Updated display name" },
          social_links: { 
            type: "object", 
            description: "Social media links",
            properties: {
              instagram: { type: "string" },
              tiktok: { type: "string" },
              youtube: { type: "string" },
              twitter: { type: "string" }
            }
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_product",
      description: "Create a new product (draft by default)",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Product title" },
          description: { type: "string", description: "Product description" },
          price: { type: "number", description: "Price in dollars" },
          type: { 
            type: "string", 
            enum: ["digital", "coaching", "link", "subscription"],
            description: "Product type" 
          }
        },
        required: ["title", "price", "type"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "update_product",
      description: "Edit title, description, price, type of existing product",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "Product ID to update" },
          title: { type: "string", description: "Updated title" },
          description: { type: "string", description: "Updated description" },
          price: { type: "number", description: "Updated price in dollars" },
          type: { 
            type: "string", 
            enum: ["digital", "coaching", "link", "subscription"],
            description: "Updated product type" 
          }
        },
        required: ["product_id"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_analytics",
      description: "Fetch page views, orders, revenue for time range",
      parameters: {
        type: "object",
        properties: {
          days: { 
            type: "number", 
            description: "Number of days to look back (default 30)",
            default: 30 
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_products",
      description: "List all creator's products with details",
      parameters: {
        type: "object",
        properties: {
          include_inactive: { 
            type: "boolean", 
            description: "Include inactive/draft products",
            default: false 
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_orders",
      description: "List recent orders",
      parameters: {
        type: "object",
        properties: {
          limit: { 
            type: "number", 
            description: "Number of orders to return (default 10)",
            default: 10 
          },
          days: { 
            type: "number", 
            description: "Number of days to look back (default 30)",
            default: 30 
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_discount_code",
      description: "Create a promo code",
      parameters: {
        type: "object",
        properties: {
          brand_name: { type: "string", description: "Brand name for the code" },
          code_text: { type: "string", description: "The actual discount code" },
          discount_description: { type: "string", description: "Description of the discount" },
          store_url: { type: "string", description: "URL to the store" },
          category: { type: "string", description: "Category (e.g. supplements, apparel)" },
          expires_at: { type: "string", description: "Expiration date (ISO string)" }
        },
        required: ["brand_name", "code_text", "discount_description"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_content",
      description: "Generate social media captions, email copy, etc (returns text, doesn't save)",
      parameters: {
        type: "object",
        properties: {
          content_type: { 
            type: "string", 
            enum: ["instagram_caption", "tiktok_caption", "email_copy", "product_description", "bio"],
            description: "Type of content to generate" 
          },
          prompt: { type: "string", description: "Specific prompt or topic" },
          tone: { 
            type: "string", 
            enum: ["motivational", "casual", "professional", "funny"],
            description: "Tone of the content",
            default: "motivational"
          }
        },
        required: ["content_type", "prompt"]
      }
    }
  }
];

// Tool execution functions
async function executeTool(toolName: string, args: any, creatorId: string) {
  const supabase = getServiceSupabase();

  switch (toolName) {
    case 'update_profile':
      const updates: any = {};
      if (args.bio) updates.bio = args.bio;
      if (args.display_name) updates.display_name = args.display_name;
      if (args.social_links) updates.social_links = args.social_links;
      
      const { error: profileError } = await supabase
        .from('creators')
        .update(updates)
        .eq('id', creatorId);
      
      if (profileError) throw profileError;
      return { success: true, message: 'Profile updated successfully' };

    case 'create_product':
      const productData = {
        creator_id: creatorId,
        title: args.title,
        description: args.description || '',
        price_cents: Math.round(args.price * 100),
        type: args.type,
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
      return { success: true, data: product };

    case 'update_product':
      const productUpdates: any = {};
      if (args.title) productUpdates.title = args.title;
      if (args.description) productUpdates.description = args.description;
      if (args.price) productUpdates.price_cents = Math.round(args.price * 100);
      if (args.type) productUpdates.type = args.type;

      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update(productUpdates)
        .eq('id', args.product_id)
        .eq('creator_id', creatorId)
        .select()
        .single();

      if (updateError) throw updateError;
      return { success: true, data: updatedProduct };

    case 'get_analytics':
      const days = args.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get analytics data
      const [
        { data: views },
        { data: analyticsOrders },
        { data: clicks }
      ] = await Promise.all([
        supabase.from('page_views')
          .select('*')
          .eq('creator_id', creatorId)
          .gte('timestamp', startDate.toISOString()),
        supabase.from('orders')
          .select('*')
          .eq('creator_id', creatorId)
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString()),
        supabase.from('link_clicks')
          .select('*')
          .eq('creator_id', creatorId)
          .gte('timestamp', startDate.toISOString())
      ]);

      const revenue = analyticsOrders?.reduce((sum, order) => sum + (order.amount_cents - order.platform_fee_cents), 0) || 0;
      
      return {
        success: true,
        data: {
          revenue: revenue / 100,
          orders: analyticsOrders?.length || 0,
          views: views?.length || 0,
          clicks: clicks?.length || 0,
          period: `${days}d`
        }
      };

    case 'get_products':
      const productQuery = supabase
        .from('products')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (!args.include_inactive) {
        productQuery.eq('is_active', true);
      }

      const { data: products } = await productQuery;
      return { success: true, data: products || [] };

    case 'get_orders':
      const limit = args.limit || 10;
      const orderDays = args.days || 30;
      const orderStartDate = new Date();
      orderStartDate.setDate(orderStartDate.getDate() - orderDays);

      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*, products(title)')
        .eq('creator_id', creatorId)
        .gte('created_at', orderStartDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      return { success: true, data: recentOrdersData || [] };

    case 'create_discount_code':
      const codeData = {
        creator_id: creatorId,
        brand_name: args.brand_name,
        code_text: args.code_text,
        discount_description: args.discount_description,
        store_url: args.store_url || null,
        category: args.category || 'other',
        expires_at: args.expires_at ? new Date(args.expires_at).toISOString() : null
      };

      const { data: code, error: codeError } = await supabase
        .from('creator_codes')
        .insert([codeData])
        .select()
        .single();

      if (codeError) throw codeError;
      return { success: true, data: code };

    case 'generate_content':
      const contentPrompt = `Generate ${args.content_type.replace('_', ' ')} with a ${args.tone} tone for: ${args.prompt}`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a fitness content creator assistant. Generate high-quality ${args.content_type} content that's engaging, authentic, and fits the fitness/wellness space. Be concise and actionable.` 
          },
          { role: 'user', content: contentPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const generatedContent = completion.choices[0]?.message?.content || 'Could not generate content';
      return { success: true, data: { content: generatedContent, type: args.content_type } };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

function generateSystemPrompt(creatorData: any) {
  const { creator, products, recentOrders, pageViews } = creatorData;
  
  const productsList = products.map((p: any) => 
    `- ${p.title}: ${p.description ? p.description.substring(0, 100) : 'No description'} ($${p.price_cents/100}) [${p.type}]`
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

TOOLS AVAILABLE:
You have access to these tools - use them proactively to help the creator:
1. update_profile - update bio, display name, social links
2. create_product - create new products (drafts)
3. update_product - edit existing products
4. get_analytics - fetch detailed analytics
5. get_products - list all products
6. get_orders - view recent orders
7. create_discount_code - create promo codes
8. generate_content - generate social content, descriptions, etc.

RICH CARDS:
When showing data or drafts, use card markers in your response:

:::card:product
{"id":"uuid","title":"Product Name","price":29.99,"type":"digital","image_url":"..."}
:::

:::card:analytics
{"revenue":150,"orders":12,"views":340,"period":"30d"}
:::

:::card:draft
{"type":"bio","content":"your new bio text here...","action":"update_profile"}
:::

:::card:order
{"id":"uuid","customer":"john@email.com","amount":29.99,"product":"12 Week Program","date":"2024-03-14"}
:::

:::card:products
[{"id":"uuid","title":"...","price":29.99,"type":"digital"},{"id":"uuid2","title":"...","price":49.99,"type":"coaching"}]
:::

RESPONSE STYLE:
- Conversational, encouraging, fitness industry-aware
- Use lowercase style (like the Loadout brand voice)
- Be specific and actionable
- When showing analytics, include the analytics card
- When drafting content (bio, descriptions), include draft cards
- When showing products, include product cards
- When showing orders, include order cards
- Be proactive — if someone asks about sales, get and show the analytics
- Don't ask unnecessary questions — if the user says "write my bio", generate it and show a draft card
- Keep responses concise and useful — no fluff`;
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

    const { message, action } = await request.json();

    if (!message && !action) {
      return NextResponse.json(
        { error: 'Message or action required' },
        { status: 400 }
      );
    }

    // Get creator data for context
    const creatorData = await getCreatorData(user.id);
    const systemPrompt = generateSystemPrompt(creatorData);

    // Handle card actions (from DraftCard etc)
    if (action) {
      try {
        const result = await executeTool(action.action, action.data, creatorData.creator.id);
        return NextResponse.json({ success: true, message: 'action completed successfully!' });
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Stream response from OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // Create a readable stream for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let functionCalls: any[] = [];
          let currentFunction: any = null;

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            
            if (choice?.delta?.tool_calls) {
              for (const toolCall of choice.delta.tool_calls) {
                if (toolCall.index !== undefined) {
                  if (!functionCalls[toolCall.index]) {
                    functionCalls[toolCall.index] = {
                      id: toolCall.id || '',
                      function: { name: '', arguments: '' }
                    };
                  }
                  currentFunction = functionCalls[toolCall.index];
                }

                if (toolCall.function?.name) {
                  currentFunction.function.name += toolCall.function.name;
                }
                if (toolCall.function?.arguments) {
                  currentFunction.function.arguments += toolCall.function.arguments;
                }
              }
            }

            const content = choice?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }

            // If function call is complete, execute it
            if (choice?.finish_reason === 'tool_calls' && functionCalls.length > 0) {
              for (const toolCall of functionCalls) {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const result = await executeTool(toolCall.function.name, args, creatorData.creator.id);
                  
                  // Stream the result as content
                  let responseText = '';
                  
                  // Generate appropriate response with cards based on the tool
                  switch (toolCall.function.name) {
                    case 'get_analytics':
                      responseText = `here's your performance over the last ${result.data.period}:\n\n:::card:analytics\n${JSON.stringify(result.data)}\n:::`;
                      break;
                    case 'get_products':
                      responseText = `here are your products:\n\n:::card:products\n${JSON.stringify(result.data.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        price: p.price_cents / 100,
                        type: p.type,
                        is_active: p.is_active
                      })))}\n:::`;
                      break;
                    case 'get_orders':
                      if (result.data.length > 0) {
                        responseText = `your recent orders:\n\n${result.data.map((order: any) => 
                          `:::card:order\n${JSON.stringify({
                            id: order.id,
                            customer: order.buyer_email,
                            amount: order.amount_cents / 100,
                            product: order.products?.title || 'Unknown Product',
                            date: order.created_at.split('T')[0]
                          })}\n:::`
                        ).join('\n\n')}`;
                      } else {
                        responseText = 'no recent orders found. keep promoting your products!';
                      }
                      break;
                    case 'create_product':
                      responseText = `created new product draft:\n\n:::card:product\n${JSON.stringify({
                        id: result.data.id,
                        title: result.data.title,
                        price: result.data.price_cents / 100,
                        type: result.data.type,
                        image_url: result.data.thumbnail_url
                      })}\n:::\n\nremember to activate it when you're ready to sell!`;
                      break;
                    case 'generate_content':
                      responseText = `here's your ${result.data.type.replace('_', ' ')}:\n\n:::card:draft\n${JSON.stringify({
                        type: result.data.type,
                        content: result.data.content,
                        action: 'save_content'
                      })}\n:::`;
                      break;
                    default:
                      responseText = result.success ? 'done!' : `error: ${result.message || 'something went wrong'}`;
                  }
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: responseText })}\n\n`));
                } catch (toolError: any) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: `error executing ${toolCall.function.name}: ${toolError.message}` })}\n\n`));
                }
              }
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
    
    return NextResponse.json({
      message: "something went wrong — try again in a sec."
    });
  }
}