# Creator Copilot

The Creator Copilot is an AI-powered assistant that helps fitness creators build and manage their Loadout.fit storefront through natural conversation.

## Features

### 1. Page Builder
- **Bio Writing**: "write my bio" → AI generates professional bio text
- **Brand Description**: "describe my brand" → Creates compelling brand descriptions
- **Profile Optimization**: Suggests improvements to creator profiles

### 2. Product Descriptions  
- **Product Copy**: "write a description for my 12-week program" → Generates compelling product descriptions
- **Feature Highlighting**: Emphasizes key benefits and transformation outcomes
- **SEO Optimization**: Includes relevant keywords for discoverability

### 3. Pricing Strategy
- **Market Analysis**: "what should I price my meal plan at?" → Analyzes similar products on platform
- **Competitive Insights**: Suggests pricing based on market research
- **Value Positioning**: Helps position products in the market

### 4. Content Ideas
- **Social Media**: "give me instagram caption ideas" → Generates platform-specific content
- **Campaign Ideas**: Creates content series and campaign concepts
- **Trending Topics**: Suggests content based on fitness industry trends

### 5. Analytics Insights
- **Performance Analysis**: "how are my sales doing?" → Plain-english analysis of metrics
- **Growth Recommendations**: Suggests improvements based on data
- **Trend Identification**: Highlights patterns in sales and engagement

## Architecture

### API Route: `/api/copilot`
- **Authentication**: Uses Supabase auth to identify the creator
- **Context Building**: Fetches creator profile, products, recent orders, and page views
- **AI Integration**: Streams responses from OpenAI GPT-4
- **Action Execution**: Can execute approved actions like updating bios or creating product drafts

### System Prompt Context
The AI receives context about:
- Creator profile (name, handle, bio, tier)
- Current products and descriptions
- Recent performance metrics (last 30 days)
- Revenue, order count, page views

### Available Actions
1. **`update_bio`**: Updates the creator's bio field
2. **`create_product_draft`**: Creates new products (always as drafts for review)
3. **`update_product_description`**: Updates existing product descriptions
4. **Safety**: Never deletes anything without explicit confirmation

## UI Components

### Chat Interface
- **ChatGPT-style conversation flow**
- **Streaming responses** for real-time interaction
- **Action confirmations** with approve/reject buttons
- **Follow-up suggestions** to continue the conversation
- **Suggested prompts** for new users

### Design System
- **Dark theme** integration (`#0a0a0a` background, `#10a37f` emerald accent)
- **Responsive layout** that works on desktop and mobile
- **Loading states** with animated typing indicators
- **Message timestamps** and user avatars

## Getting Started

### Requirements
1. **OpenAI API Key**: Set `OPENAI_API_KEY` in your environment variables
2. **Supabase Access**: Creator must be authenticated via Supabase auth
3. **Database Permissions**: Service role access to creators, products, orders, page_views tables

### Environment Setup
```bash
# Add to .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

### Navigation
The Copilot is accessible via:
- Dashboard navigation: `/dashboard/copilot`
- Direct link from any dashboard page
- Mobile-responsive sidebar navigation

## Example Interactions

### Bio Writing
```
User: "write my bio"
AI: "i'd love to help you write a compelling bio! based on your profile, here's what i've drafted..."
[Shows action confirmation to update bio]
```

### Sales Analysis  
```
User: "how are my sales doing?"
AI: "looking at your last 30 days, you've made $247 from 8 orders with 156 page views. your conversion rate is 5.1%, which is solid! your 'meal prep mastery' program is your top seller..."
```

### Product Creation
```
User: "create a 6-week strength program"  
AI: "great idea! i'll create a product draft for your strength program. here's what i'm thinking..."
[Shows action confirmation to create draft product]
```

## Technical Details

### Streaming Implementation
- Uses Server-Sent Events (SSE) for real-time streaming
- Graceful fallback to JSON responses if streaming fails
- Handles connection interruptions and errors

### Security
- **Authentication required**: All requests must include valid Supabase session
- **Creator isolation**: Only accesses data for the authenticated creator
- **Action confirmation**: No destructive actions without explicit user approval
- **Input validation**: Sanitizes all user inputs and action parameters

### Performance
- **Efficient context loading**: Only fetches necessary data for AI context
- **Response caching**: System prompts are built efficiently
- **Error handling**: Robust fallbacks for API failures

## Future Enhancements

### Planned Features
- **Video Script Generator**: Create scripts for workout videos and educational content
- **Workout Builder AI**: Generate custom workout plans based on client goals  
- **Email Sequence Creator**: Build automated email campaigns for client nurturing
- **Trend Analyzer**: Discover trending topics in the fitness space
- **Image Generation**: Create thumbnail and banner images for products
- **Advanced Analytics**: Deeper insights with predictive analytics

### Integration Opportunities
- **Calendar Integration**: Schedule content creation and product launches
- **Social Media Posting**: Direct publishing to Instagram, TikTok, etc.
- **Client Communication**: AI-assisted responses to coaching applications
- **Inventory Management**: Smart recommendations for product portfolio

## Support

The Creator Copilot is designed to be intuitive and self-explaining. For technical issues:

1. **Check OpenAI API Key**: Ensure your API key is valid and has credits
2. **Verify Authentication**: Make sure you're logged in to your creator account
3. **Clear Browser Cache**: Refresh the page if streaming gets stuck
4. **Check Console Logs**: Look for JavaScript errors in browser dev tools

The AI will provide helpful error messages and suggestions when things go wrong.