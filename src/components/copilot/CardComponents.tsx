import React from 'react';
import { Check, X, ExternalLink, Edit3, TrendingUp, ShoppingBag, Users, Eye } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  type: string;
  image_url?: string;
  is_active?: boolean;
}

export function ProductCard({ id, title, price, type, image_url, is_active }: ProductCardProps) {
  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-colors">
      <div className="flex items-start gap-3">
        {image_url ? (
          <img 
            src={image_url} 
            alt={title}
            className="w-12 h-12 rounded-lg object-cover bg-white/5"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
            <ShoppingBag size={20} className="text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate">{title}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              type === 'coaching' ? 'bg-blue-500/20 text-blue-400' :
              type === 'digital' ? 'bg-emerald-500/20 text-emerald-400' :
              type === 'subscription' ? 'bg-purple-500/20 text-purple-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {type}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-emerald-400">
              ${price.toFixed(2)}
            </span>
            
            <div className="flex items-center gap-2">
              {is_active !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  is_active 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {is_active ? 'live' : 'draft'}
                </span>
              )}
              <button className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Edit3 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AnalyticsCardProps {
  revenue: number;
  orders: number;
  views: number;
  clicks?: number;
  period: string;
}

export function AnalyticsCard({ revenue, orders, views, clicks, period }: AnalyticsCardProps) {
  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={18} className="text-emerald-400" />
        <h3 className="font-medium text-white">Performance ({period})</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">
            ${revenue.toFixed(0)}
          </div>
          <div className="text-sm text-gray-400">revenue</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {orders}
          </div>
          <div className="text-sm text-gray-400">orders</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {views}
          </div>
          <div className="text-sm text-gray-400">page views</div>
        </div>
        
        {clicks !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {clicks}
            </div>
            <div className="text-sm text-gray-400">clicks</div>
          </div>
        )}
      </div>
      
      {views > 0 && orders > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-sm text-gray-400">
            conversion rate: <span className="text-emerald-400 font-medium">
              {((orders / views) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

interface DraftCardProps {
  type: string;
  content: string;
  action: string;
  onApply: (action: string, data: any) => void;
  onDiscard: () => void;
}

export function DraftCard({ type, content, action, onApply, onDiscard }: DraftCardProps) {
  const handleApply = () => {
    let data: any = {};
    
    switch (action) {
      case 'update_profile':
        if (type === 'bio') {
          data = { bio: content };
        } else if (type === 'display_name') {
          data = { display_name: content };
        }
        break;
      default:
        data = { content };
    }
    
    onApply(action, data);
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-emerald-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-white capitalize">
          Draft {type.replace('_', ' ')}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
          >
            <Check size={14} />
            Apply
          </button>
          <button
            onClick={onDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            <X size={14} />
            Discard
          </button>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}

interface OrderCardProps {
  id: string;
  customer: string;
  amount: number;
  product: string;
  date: string;
}

export function OrderCard({ id, customer, amount, product, date }: OrderCardProps) {
  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate">{product}</h3>
            <span className="text-lg font-semibold text-emerald-400">
              ${amount.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {customer}
            </span>
            <span>{date}</span>
          </div>
        </div>
        
        <ExternalLink size={16} className="text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
      </div>
    </div>
  );
}

interface ProductListCardProps {
  products: Array<{
    id: string;
    title: string;
    price: number;
    type: string;
    is_active?: boolean;
  }>;
}

export function ProductListCard({ products }: ProductListCardProps) {
  if (products.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/10 text-center">
        <ShoppingBag size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-400">no products yet</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag size={18} className="text-emerald-400" />
        <h3 className="font-medium text-white">Your Products</h3>
        <span className="text-sm text-gray-400">({products.length})</span>
      </div>
      
      <div className="space-y-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            type={product.type}
            is_active={product.is_active}
          />
        ))}
      </div>
    </div>
  );
}

interface CardParserProps {
  content: string;
  onAction: (action: string, data: any) => void;
}

export function CardParser({ content, onAction }: CardParserProps) {
  const parseCards = (text: string) => {
    const parts: Array<{ type: 'text' | 'card', content: string, cardType?: string, cardData?: any }> = [];
    
    // Regex to match card blocks
    const cardRegex = /:::card:(\w+)\n([\s\S]*?)\n:::/g;
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(text)) !== null) {
      // Add text before this card
      if (match.index > lastIndex) {
        const textContent = text.substring(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }

      // Add the card
      try {
        const cardData = JSON.parse(match[2]);
        parts.push({
          type: 'card',
          content: match[0],
          cardType: match[1],
          cardData
        });
      } catch (error) {
        // If JSON parsing fails, treat as text
        parts.push({ type: 'text', content: match[0] });
      }

      lastIndex = cardRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex).trim();
      if (remainingText) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    return parts;
  };

  const renderCard = (cardType: string, cardData: any, index: number) => {
    switch (cardType) {
      case 'product':
        return <ProductCard key={index} {...cardData} />;
      
      case 'analytics':
        return <AnalyticsCard key={index} {...cardData} />;
      
      case 'draft':
        return (
          <DraftCard
            key={index}
            {...cardData}
            onApply={onAction}
            onDiscard={() => {}} // Could implement discard if needed
          />
        );
      
      case 'order':
        return <OrderCard key={index} {...cardData} />;
      
      case 'products':
        return <ProductListCard key={index} products={cardData} />;
      
      default:
        return (
          <div key={index} className="bg-red-900/20 rounded-xl p-3 border border-red-500/30">
            <p className="text-red-400 text-sm">Unknown card type: {cardType}</p>
          </div>
        );
    }
  };

  const parts = parseCards(content);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <div key={index} className="whitespace-pre-wrap text-sm leading-relaxed text-white">
              {part.content}
            </div>
          );
        } else {
          return renderCard(part.cardType!, part.cardData, index);
        }
      })}
    </div>
  );
}