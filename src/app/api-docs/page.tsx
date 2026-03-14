import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loadout.fit API Documentation',
  description: 'JSON API for creator profiles and products'
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Loadout.fit API Documentation</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              The Loadout.fit API provides JSON-based access to creator profiles and products, 
              designed for AI applications and third-party integrations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Base URL</h2>
            <div className="bg-gray-100 p-3 rounded-md mb-6">
              <code>https://loadout.fit/api/v1</code>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
            <p className="mb-6">All endpoints are public and do not require authentication.</p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rate Limiting</h2>
            <p className="mb-6">
              All responses include rate limit headers:
            </p>
            <ul className="mb-6">
              <li><code>X-RateLimit-Limit: 1000</code> - Requests per hour</li>
              <li><code>X-RateLimit-Remaining: 999</code> - Remaining requests</li>
              <li><code>X-Loadout-Version: 1.0</code> - API version</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Endpoints</h2>

            <div className="space-y-8">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-semibold mb-2">GET /api/v1/creators</h3>
                <p className="text-gray-600 mb-3">List all active creators with basic info and product counts.</p>
                
                <h4 className="font-medium mb-2">Query Parameters:</h4>
                <ul className="text-sm space-y-1 mb-4">
                  <li><code>limit</code> - Number of creators to return (max 100, default 20)</li>
                  <li><code>offset</code> - Pagination offset (default 0)</li>
                </ul>

                <h4 className="font-medium mb-2">Example Request:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto mb-4">
                  <code>{`curl https://loadout.fit/api/v1/creators?limit=5`}</code>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-semibold mb-2">GET /api/v1/creators/{'{handle}'}</h3>
                <p className="text-gray-600 mb-3">Get full creator profile with products as a component tree.</p>
                
                <h4 className="font-medium mb-2">Example Request:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto mb-4">
                  <code>{`curl https://loadout.fit/api/v1/creators/therock`}</code>
                </div>

                <h4 className="font-medium mb-2">Example Response:</h4>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                  <pre>{`{
  "component": "CreatorProfile",
  "version": "1.0",
  "data": {
    "handle": "therock",
    "displayName": "Dwayne Johnson",
    "bio": "Actor, producer, and fitness enthusiast",
    "avatarUrl": "https://...",
    "theme": {
      "primary": "#d4a853",
      "background": "#0a0a0a"
    },
    "socialLinks": {
      "instagram": "@therock"
    },
    "products": [
      {
        "component": "ProductCard",
        "data": {
          "id": "123",
          "title": "Project Rock 8 Training Shoe",
          "price": 120,
          "type": "link",
          "externalUrl": "https://...",
          "ctaText": "Shop"
        }
      }
    ],
    "sections": [
      {
        "component": "ProductSection",
        "data": {
          "title": "FEATURED",
          "products": [...]
        }
      }
    ]
  },
  "meta": {
    "totalProducts": 13,
    "createdAt": "...",
    "tier": "pro"
  }
}`}</pre>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-semibold mb-2">GET /api/v1/creators/{'{handle}'}/products</h3>
                <p className="text-gray-600 mb-3">Get just the products for a creator.</p>
                
                <h4 className="font-medium mb-2">Query Parameters:</h4>
                <ul className="text-sm space-y-1 mb-4">
                  <li><code>type</code> - Filter by product type (digital, link, coaching, etc.)</li>
                  <li><code>limit</code> - Number of products to return (max 100, default 50)</li>
                  <li><code>offset</code> - Pagination offset (default 0)</li>
                </ul>

                <h4 className="font-medium mb-2">Example Request:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto mb-4">
                  <code>{`curl https://loadout.fit/api/v1/creators/therock/products?type=digital&limit=10`}</code>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h3 className="text-xl font-semibold mb-2">GET /api/v1/creators/{'{handle}'}/forms</h3>
                <p className="text-gray-600 mb-3">Get active application forms for a creator.</p>
                
                <h4 className="font-medium mb-2">Example Request:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto mb-4">
                  <code>{`curl https://loadout.fit/api/v1/creators/therock/forms`}</code>
                </div>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-xl font-semibold mb-2">GET /api/v1/schema</h3>
                <p className="text-gray-600 mb-3">Get the full component schema definition.</p>
                
                <h4 className="font-medium mb-2">Example Request:</h4>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto mb-4">
                  <code>{`curl https://loadout.fit/api/v1/schema`}</code>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">Component Schema</h2>
            <p className="mb-4">
              All data is returned as component objects that AI applications can render. 
              The component schema defines the structure and props for each component type.
            </p>

            <h3 className="text-lg font-semibold mb-2">Core Components:</h3>
            <ul className="space-y-2 mb-6">
              <li><strong>CreatorProfile</strong> - Full creator profile with products and sections</li>
              <li><strong>ProductCard</strong> - Individual product display card</li>
              <li><strong>ProductSection</strong> - Grouped section of products</li>
              <li><strong>CoachingForm</strong> - Form for coaching applications</li>
              <li><strong>AffiliateCode</strong> - Discount code display</li>
              <li><strong>EmailCollector</strong> - Email signup component</li>
              <li><strong>Embed</strong> - Video/iframe embeds</li>
              <li><strong>Header</strong> - Text headers and dividers</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Responses</h2>
            <p className="mb-4">All errors return a consistent JSON structure:</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm">
              <pre>{`{
  "error": "Creator not found",
  "status": 404
}`}</pre>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">AI Integration Example</h2>
            <p className="mb-4">
              Here's how an AI application might use this API to create a custom storefront:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              <pre>{`// 1. Get the component schema
const schema = await fetch('/api/v1/schema').then(r => r.json());

// 2. Get creator profile  
const profile = await fetch('/api/v1/creators/therock').then(r => r.json());

// 3. Render components based on schema
function renderComponent(component) {
  switch (component.component) {
    case 'ProductCard':
      return <ProductCard {...component.data} />;
    case 'ProductSection':  
      return <ProductSection {...component.data} />;
    // ... other components
  }
}

// 4. Build the page
return (
  <div style={{color: profile.data.theme.primary}}>
    <h1>{profile.data.displayName}</h1>
    {profile.data.sections.map(renderComponent)}
  </div>
);`}</pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip for AI Applications</h3>
              <p className="text-blue-800">
                Use the component schema as your "menu" of what you can render. 
                The API returns data pre-structured as components, making it easy 
                to build dynamic, theme-aware storefronts.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Version 1.0 • Last updated: {new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}