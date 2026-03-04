import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

export async function POST(request: NextRequest) {
  try {
    const { description, type, duration, difficulty, audience } = await request.json();

    if (!description || !type || !duration || !difficulty || !audience) {
      return NextResponse.json(
        { error: 'missing required fields' },
        { status: 400 }
      );
    }

    const systemPrompt = `you are an expert fitness product copywriter who specializes in creating compelling, authentic product listings for fitness creators. your writing style is:

- lowercase, conversational tone
- authentic and relatable
- focused on transformation and results
- uses fitness community language naturally
- emphasizes value and outcomes
- avoids overly salesy language

create a product listing based on the provided details. respond in JSON format with:
- title: catchy product name (avoid generic terms like "ultimate" or "complete")
- description: 3-4 paragraphs that sell the transformation, not just features
- suggestedPrice: realistic price in USD (whole number)
- keywords: array of 5-8 SEO keywords
- reasoning: brief explanation of price reasoning (1 sentence)

consider the target audience, difficulty level, and program type when crafting copy.`;

    const userPrompt = `create a product listing for:

description: ${description}
program type: ${type}
duration: ${duration} weeks
difficulty: ${difficulty}
target audience: ${audience}

focus on the transformation and results this program will deliver.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('no response from ai');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('failed to parse ai response:', response);
      throw new Error('invalid ai response format');
    }

    // Validate the response structure
    const { title, description: generatedDesc, suggestedPrice, keywords, reasoning } = parsedResponse;
    
    if (!title || !generatedDesc || !suggestedPrice || !keywords || !reasoning) {
      throw new Error('incomplete ai response');
    }

    return NextResponse.json({
      title,
      description: generatedDesc,
      suggestedPrice: typeof suggestedPrice === 'number' ? suggestedPrice : parseInt(suggestedPrice),
      keywords: Array.isArray(keywords) ? keywords : [],
      reasoning
    });

  } catch (error) {
    console.error('product generation error:', error);
    
    // Return a fallback response if AI fails
    const fallbackResponse = {
      title: `${duration}-week ${type} program`,
      description: `transform your fitness with this comprehensive ${duration}-week ${type} program designed specifically for ${difficulty} trainees.\n\nthis program includes:\n- structured workout plans\n- progressive overload protocols\n- exercise form guides\n- nutrition guidelines\n\nwhether you're targeting ${audience === 'everyone' ? 'anyone looking to improve' : audience}, this program will help you reach your goals through proven training methods.\n\nstart your transformation today and see real results in just ${duration} weeks.`,
      suggestedPrice: duration <= 8 ? 29 : duration <= 12 ? 49 : 69,
      keywords: [type, `${duration} week`, difficulty, 'workout', 'fitness', 'training', 'program'],
      reasoning: `priced based on ${duration} week duration and ${difficulty} complexity level`
    };

    return NextResponse.json(fallbackResponse);
  }
}