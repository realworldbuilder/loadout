import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type || !['caption', 'carousel', 'bio'].includes(type)) {
      return NextResponse.json(
        { error: 'invalid content type' },
        { status: 400 }
      );
    }

    let result;
    
    switch (type) {
      case 'caption':
        result = await generateCaptions(body);
        break;
      case 'carousel':
        result = await generateCarousel(body);
        break;
      case 'bio':
        result = await generateBios(body);
        break;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('content generation error:', error);
    return NextResponse.json(
      { error: 'generation failed' },
      { status: 500 }
    );
  }
}

async function generateCaptions({ productInfo, style, platform }: any) {
  const systemPrompt = `you are a fitness social media expert who creates high-converting content for fitness creators. your writing style is:

- lowercase, authentic fitness community voice
- knows what makes people stop scrolling
- balances inspiration with relatability
- uses proven engagement tactics
- understands platform-specific best practices
- avoids cringe gym bro language

create 3 different caption variations for promoting a fitness product. each should have:
- engaging hook in first line
- value-focused body text
- appropriate call to action
- relevant hashtags (8-12 tags)

respond in JSON format:
{
  "captions": [
    {
      "content": "caption text here",
      "hashtags": ["tag1", "tag2", ...]
    }
  ]
}`;

  const userPrompt = `create 3 ${style} style captions for ${platform} promoting:

product: ${productInfo.title}
description: ${productInfo.description}
type: ${productInfo.type}

style notes:
- hype: energetic, motivational, urgency
- educational: informative, value-first, teaching
- story: personal narrative, relatable struggles
- controversial: bold takes, polarizing opinions
- minimal: clean, simple, direct

platform: ${platform}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 1200,
  });

  const response = completion.choices[0]?.message?.content;
  
  try {
    return JSON.parse(response || '{}');
  } catch (parseError) {
    // Fallback response
    return {
      captions: [
        {
          content: `ready to transform your fitness? 💪\n\nthis isn't just another workout program - it's your roadmap to real results.\n\n${productInfo.title} gives you everything you need to level up your training.\n\nno fluff. just results.\n\nlink in bio 👆`,
          hashtags: ['fitness', 'workout', 'transformation', 'gym', 'training', 'results', 'fitfam', 'motivation']
        },
        {
          content: `tired of programs that don't deliver?\n\nhere's what actually works:\n\n✓ progressive training\n✓ clear structure\n✓ proven methods\n\n${productInfo.title} cuts through the noise and gives you exactly what you need.\n\nstop spinning your wheels. start seeing results.\n\nget it now ⬇️`,
          hashtags: ['fitness', 'workoutplan', 'results', 'training', 'gym', 'fitnessmotivation', 'strong', 'gains']
        },
        {
          content: `real talk: most fitness programs overcomplicate everything.\n\n${productInfo.title} keeps it simple and effective.\n\nno bs. no gimmicks. just what works.\n\nready to see what consistent training can do?\n\nstart today 💪`,
          hashtags: ['fitness', 'simple', 'effective', 'workout', 'training', 'consistency', 'results', 'motivation']
        }
      ]
    };
  }
}

async function generateCarousel({ topic, slideCount }: any) {
  const systemPrompt = `you are a fitness content creator who makes educational carousel posts that go viral. your style:

- breaks down complex topics into digestible slides
- uses clear, actionable information
- lowercase, conversational tone
- each slide is self-contained but builds on previous
- practical tips people can use immediately
- avoids overwhelming information dumps

create a ${slideCount}-slide carousel about the given topic. respond in JSON:

{
  "slides": [
    {
      "slideNumber": 1,
      "title": "slide title",
      "content": "slide content (2-3 sentences max)"
    }
  ]
}`;

  const userPrompt = `create a ${slideCount}-slide fitness carousel about: ${topic}

slide 1 should be the hook/intro
slides 2-${slideCount-1} should be main content points  
slide ${slideCount} should be conclusion/call to action

keep each slide focused and digestible.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const response = completion.choices[0]?.message?.content;
  
  try {
    return JSON.parse(response || '{}');
  } catch (parseError) {
    // Fallback response
    const fallbackSlides = [];
    for (let i = 1; i <= slideCount; i++) {
      if (i === 1) {
        fallbackSlides.push({
          slideNumber: i,
          title: "let's talk about this",
          content: `${topic} is more important than most people realize. here's what you need to know.`
        });
      } else if (i === slideCount) {
        fallbackSlides.push({
          slideNumber: i,
          title: "ready to apply this?",
          content: "start implementing these tips today and see the difference for yourself."
        });
      } else {
        fallbackSlides.push({
          slideNumber: i,
          title: `key point #${i-1}`,
          content: "this is an important aspect to consider when working on your fitness goals."
        });
      }
    }
    return { slides: fallbackSlides };
  }
}

async function generateBios({ credentials, niche, personality }: any) {
  const systemPrompt = `you are a personal branding expert for fitness professionals. you create Instagram bios that:

- immediately communicate expertise and niche
- feel authentic and approachable
- use strategic keywords for discoverability  
- include a clear value proposition
- stay under 150 characters
- use emojis strategically (not excessively)
- lowercase style unless proper nouns

create 3 bio variations that balance professionalism with personality.

respond in JSON:
{
  "bios": [
    {
      "bio": "bio text here",
      "characterCount": 123
    }
  ]
}`;

  const userPrompt = `create 3 Instagram bio variations for:

credentials: ${credentials}
niche: ${niche}
personality: ${personality || 'professional but approachable'}

each bio should be under 150 characters and feel authentic to this person.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  const response = completion.choices[0]?.message?.content;
  
  try {
    return JSON.parse(response || '{}');
  } catch (parseError) {
    // Fallback response
    const fallbackBios = [
      `${credentials} | helping you master ${niche} 💪\nproven methods, real results\nstart your journey ⬇️`,
      `${niche} coach | ${credentials}\ntransforming lives through fitness 🔥\nyour goals, my guidance`,
      `${credentials} focused on ${niche}\nsimple. effective. proven.\nlet's build something great 💪`
    ];
    
    return {
      bios: fallbackBios.map(bio => ({
        bio,
        characterCount: bio.length
      }))
    };
  }
}