import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const handle = params.handle;

    // Fetch creator data
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('handle', handle)
      .eq('is_active', true)
      .single();

    if (creatorError || !creator) {
      // For testing purposes, provide a fallback response
      if (handle === 'testcreator') {
        const fallbackCreator = {
          id: '22222222-2222-2222-2222-222222222222',
          handle: 'testcreator',
          display_name: 'Test Creator',
          bio: 'I am a fitness expert helping people achieve their goals with proven training programs and nutritional guidance.',
          social_links: {
            instagram: 'https://instagram.com/testcreator',
            youtube: 'https://youtube.com/@testcreator'
          }
        };

        const fallbackProducts = [
          {
            id: '1',
            title: 'Complete Fitness Program',
            description: 'A comprehensive 12-week workout program designed for all fitness levels.',
            price: '$49.99',
            type: 'digital',
            collection: 'Training Programs',
            ctaText: 'Get Started',
            externalUrl: 'https://example.com/complete-fitness-program'
          },
          {
            id: '2',
            title: 'Nutrition Masterclass',
            description: 'Learn the fundamentals of nutrition for fitness.',
            price: '$29.99',
            type: 'digital',
            collection: 'Courses',
            ctaText: 'Learn More',
            externalUrl: 'https://example.com/nutrition-masterclass'
          },
          {
            id: '3',
            title: '1:1 Coaching Session',
            description: 'Personalized one-on-one coaching session.',
            price: '$99.99',
            type: 'coaching',
            collection: 'Coaching',
            ctaText: 'Book Now',
            externalUrl: 'https://calendly.com/testcreator/coaching'
          }
        ];

        const systemPrompt = `You are an AI assistant helping visitors on ${fallbackCreator.display_name}'s Loadout page. Your role is to help them find the right products and services.

About ${fallbackCreator.display_name}:
- Handle: @${fallbackCreator.handle}
- Bio: ${fallbackCreator.bio}
- Social Links: Instagram: ${fallbackCreator.social_links.instagram}, YouTube: ${fallbackCreator.social_links.youtube}

Available Products/Services:
${fallbackProducts.map(product => `
- ${product.title} (${product.type})
  Price: ${product.price}
  Description: ${product.description}
  Collection: ${product.collection}
  CTA: ${product.ctaText}
  Link: ${product.externalUrl}
`).join('\n')}

Guidelines:
1. Be helpful and friendly, representing ${fallbackCreator.display_name}'s brand
2. Recommend products based on the visitor's needs and questions
3. Provide direct links when suggesting specific products
4. If someone asks about pricing, be clear about costs
5. Keep responses conversational and engaging
6. Focus on helping them achieve their fitness goals
7. Use markdown formatting for links: [Product Name](url)

When recommending products, format them as:
**[Product Name](product-url)** - Price
Brief description of why it's relevant to their question.

Always end responses by asking if they have any other questions or if they'd like to learn more about any specific products.`;

        // For demo purposes, create a mock streaming response without OpenAI
        const mockResponses = {
          'what products': 'Great question! I have several products that can help you on your fitness journey:\n\n**[Complete Fitness Program](https://example.com/complete-fitness-program)** - $49.99\nThis is my flagship 12-week program that covers everything you need for a complete transformation.\n\n**[Nutrition Masterclass](https://example.com/nutrition-masterclass)** - $29.99\nPerfect for learning the fundamentals of nutrition and meal planning.\n\n**[1:1 Coaching Session](https://calendly.com/testcreator/coaching)** - $99.99\nPersonalized guidance tailored to your specific goals.\n\nWhat are your main fitness goals? I can recommend the best option for you!',
          'nutrition': 'The **[Nutrition Masterclass](https://example.com/nutrition-masterclass)** - $29.99 would be perfect for you! It covers macronutrients, meal planning, and sustainable eating habits. It\'s designed to complement any training program.\n\nAre you looking to lose weight, gain muscle, or just eat healthier overall?',
          'coaching': 'I\'d love to work with you one-on-one! My **[1:1 Coaching Session](https://calendly.com/testcreator/coaching)** - $99.99 includes:\n\n• Personalized workout plan\n• Nutrition guidance\n• Form checks and technique tips\n• Goal setting and accountability\n\nThis is perfect for getting started or breaking through plateaus. What specific areas would you like help with?',
          'beginner': 'Great to hear you\'re starting your fitness journey! For beginners, I recommend starting with the **[Complete Fitness Program](https://example.com/complete-fitness-program)** - $49.99. It\'s designed specifically for all fitness levels and includes:\n\n• Progressive workout structure\n• Detailed exercise guides\n• Nutrition basics\n• Progress tracking tools\n\nIt will take you from complete beginner to confident in just 12 weeks. Would you like to know more about what\'s included?',
          'default': 'Hey! Thanks for reaching out. I\'m here to help you find the perfect fitness solution based on your goals. I offer:\n\n**[Complete Fitness Program](https://example.com/complete-fitness-program)** - $49.99 (12-week comprehensive training)\n**[Nutrition Masterclass](https://example.com/nutrition-masterclass)** - $29.99 (Learn proper nutrition fundamentals)\n**[1:1 Coaching Session](https://calendly.com/testcreator/coaching)** - $99.99 (Personalized guidance)\n\nWhat are your main fitness goals? Are you looking to lose weight, build muscle, or just get healthier overall?'
        };

        // Simple keyword matching for demo
        let responseText = mockResponses.default;
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('product') || lowerMessage.includes('have') || lowerMessage.includes('offer')) {
          responseText = mockResponses['what products'];
        } else if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('eat')) {
          responseText = mockResponses.nutrition;
        } else if (lowerMessage.includes('coaching') || lowerMessage.includes('personal') || lowerMessage.includes('1:1')) {
          responseText = mockResponses.coaching;
        } else if (lowerMessage.includes('beginner') || lowerMessage.includes('start') || lowerMessage.includes('new')) {
          responseText = mockResponses.beginner;
        }

        // Create ReadableStream for mock streaming response
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              const encoder = new TextEncoder();
              const words = responseText.split(' ');
              
              // Stream words with small delays to simulate real streaming
              for (const word of words) {
                const content = word + ' ';
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                // Small delay between words for realistic streaming effect
                await new Promise(resolve => setTimeout(resolve, 50));
              }
              
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
            } catch (error) {
              console.error('Streaming error:', error);
              controller.error(error);
            }
          },
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Fetch creator's real products (exclude page builder blocks)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('is_active', true)
      .not('type', 'like', '%_block')
      .neq('type', 'header')
      .order('sort_order', { ascending: true });

    if (productsError) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Format products for the AI
    const formattedProducts = (products || []).map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price_cents ? `$${(product.price_cents / 100).toFixed(2)}` : 'Free',
      type: product.type,
      collection: product.collection,
      ctaText: product.cta_text,
      externalUrl: product.external_url || product.file_url
    }));

    // Create system prompt
    const systemPrompt = `You are an AI assistant helping visitors on ${creator.display_name}'s Loadout page. Your role is to help them find the right products and services.

About ${creator.display_name}:
- Handle: @${creator.handle}
- Bio: ${creator.bio || 'Fitness creator on Loadout'}
${creator.social_links ? `- Social Links: ${Object.entries(creator.social_links).map(([platform, url]) => `${platform}: ${url}`).join(', ')}` : ''}

Available Products/Services:
${formattedProducts.map(product => `
- ${product.title} (${product.type})
  Price: ${product.price}
  Description: ${product.description}
  ${product.collection ? `Collection: ${product.collection}` : ''}
  ${product.ctaText ? `CTA: ${product.ctaText}` : ''}
  ${product.externalUrl ? `Link: ${product.externalUrl}` : ''}
`).join('\n')}

Guidelines:
1. Be helpful and friendly, representing ${creator.display_name}'s brand
2. Recommend products based on the visitor's needs and questions
3. Provide direct links when suggesting specific products
4. If someone asks about pricing, be clear about costs
5. Keep responses conversational and engaging
6. If you don't know something specific about ${creator.display_name} that's not in the data above, politely say so
7. Focus on helping them achieve their fitness goals
8. Use markdown formatting for links: [Product Name](url)

When recommending products, format them as:
**[Product Name](product-url)** - $X.XX
Brief description of why it's relevant to their question.

Always end responses by asking if they have any other questions or if they'd like to learn more about any specific products.`;

    // For demo purposes, create a mock streaming response (replace with real OpenAI when key is available)
    const mockResponses = {
      'what products': `Great question! Here are the available products from ${creator.display_name}:\n\n${formattedProducts.map(p => `**[${p.title}](${p.externalUrl})** - ${p.price}\n${p.description}\n`).join('\n')}\nWhat specific goals are you working towards? I can recommend the best option for you!`,
      'default': `Hey! I'm here to help you find the perfect products from ${creator.display_name}. Available options:\n\n${formattedProducts.slice(0, 3).map(p => `**[${p.title}](${p.externalUrl})** - ${p.price}`).join('\n')}\n\nWhat are your main fitness goals?`
    };

    let responseText = mockResponses.default;
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('product') || lowerMessage.includes('have') || lowerMessage.includes('offer')) {
      responseText = mockResponses['what products'];
    }

    // Create ReadableStream for mock streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const words = responseText.split(' ');
          
          for (const word of words) {
            const content = word + ' ';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}