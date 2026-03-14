/**
 * Component Schema Definition for Loadout.fit API
 * 
 * This defines all renderable component types and their prop structures.
 * Used by /api/v1/schema endpoint to provide AI applications with
 * a "menu" of what components they can render.
 */

export interface BaseComponent {
  component: string;
  version: string;
  data: Record<string, any>;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  pinterest?: string;
  snapchat?: string;
  facebook?: string;
  spotify?: string;
  twitch?: string;
}

export interface Theme {
  primary: string;
  background?: string;
  accent?: string;
  text?: string;
  textMuted?: string;
}

export interface ProductCardComponent {
  component: 'ProductCard';
  data: {
    id: string;
    title: string;
    description?: string;
    price: number;
    type: 'digital' | 'coaching' | 'link' | 'subscription' | 'affiliate_link' | 'header' | 'email_collector' | 'embed' | 'coaching_form';
    thumbnailUrl?: string;
    externalUrl?: string;
    ctaText?: string;
    fileUrl?: string;
    layout?: 'classic' | 'compact' | 'featured';
    collection?: string;
    metadata?: Record<string, any>;
  };
}

export interface ProductSectionComponent {
  component: 'ProductSection';
  data: {
    title: string;
    description?: string;
    products: ProductCardComponent[];
    layout?: 'grid' | 'list' | 'carousel';
    theme?: Partial<Theme>;
  };
}

export interface CreatorProfileComponent {
  component: 'CreatorProfile';
  version: '1.0';
  data: {
    handle: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    theme: Theme;
    socialLinks: SocialLinks;
    products: ProductCardComponent[];
    sections: ProductSectionComponent[];
    tier: 'free' | 'pro' | 'studio';
    applicationSettings?: {
      welcomeMessage?: string;
      showPricing?: boolean;
      pricingText?: string;
      responseTime?: string;
    };
  };
}

export interface CoachingFormComponent {
  component: 'CoachingForm';
  data: {
    id: string;
    name: string;
    fields: FormField[];
    submitEndpoint: string;
    submitText?: string;
  };
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface AffiliateCodeComponent {
  component: 'AffiliateCode';
  data: {
    code: string;
    discount?: string;
    expiresAt?: string;
    description?: string;
    ctaText?: string;
    theme?: Partial<Theme>;
  };
}

export interface EmailCollectorComponent {
  component: 'EmailCollector';
  data: {
    title: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
    successMessage?: string;
    theme?: Partial<Theme>;
  };
}

export interface EmbedComponent {
  component: 'Embed';
  data: {
    type: 'video' | 'iframe' | 'image';
    url: string;
    title?: string;
    aspectRatio?: string;
    autoplay?: boolean;
    controls?: boolean;
  };
}

export interface HeaderComponent {
  component: 'Header';
  data: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
    align?: 'left' | 'center' | 'right';
    theme?: Partial<Theme>;
  };
}

export type LoadoutComponent = 
  | CreatorProfileComponent
  | ProductCardComponent
  | ProductSectionComponent
  | CoachingFormComponent
  | AffiliateCodeComponent
  | EmailCollectorComponent
  | EmbedComponent
  | HeaderComponent;

export interface ComponentSchema {
  components: {
    [K in LoadoutComponent['component']]: {
      name: K;
      description: string;
      props: Record<string, {
        type: string;
        required: boolean;
        description: string;
        enum?: string[];
        default?: any;
      }>;
      examples: any[];
    };
  };
  version: string;
  lastUpdated: string;
}

export const COMPONENT_SCHEMA: ComponentSchema = {
  version: '1.0',
  lastUpdated: new Date().toISOString(),
  components: {
    CreatorProfile: {
      name: 'CreatorProfile',
      description: 'Full creator profile with products and sections',
      props: {
        handle: { type: 'string', required: true, description: 'Unique handle/username' },
        displayName: { type: 'string', required: true, description: 'Display name' },
        bio: { type: 'string', required: false, description: 'Creator bio/description' },
        avatarUrl: { type: 'string', required: false, description: 'Profile image URL' },
        bannerUrl: { type: 'string', required: false, description: 'Banner image URL' },
        theme: { type: 'object', required: true, description: 'Color theme configuration' },
        socialLinks: { type: 'object', required: true, description: 'Social media links' },
        products: { type: 'array', required: true, description: 'Array of ProductCard components' },
        sections: { type: 'array', required: true, description: 'Array of ProductSection components' },
        tier: { type: 'string', required: true, description: 'Subscription tier', enum: ['free', 'pro', 'studio'] }
      },
      examples: [{
        component: 'CreatorProfile',
        version: '1.0',
        data: {
          handle: 'therock',
          displayName: 'Dwayne Johnson',
          bio: 'Actor, producer, and fitness enthusiast',
          theme: { primary: '#d4a853', background: '#0a0a0a' },
          socialLinks: { instagram: '@therock' },
          products: [],
          sections: [],
          tier: 'pro'
        }
      }]
    },
    ProductCard: {
      name: 'ProductCard',
      description: 'Individual product display card',
      props: {
        id: { type: 'string', required: true, description: 'Unique product ID' },
        title: { type: 'string', required: true, description: 'Product title' },
        description: { type: 'string', required: false, description: 'Product description' },
        price: { type: 'number', required: true, description: 'Price in dollars (0 for free)' },
        type: { type: 'string', required: true, description: 'Product type', enum: ['digital', 'coaching', 'link', 'subscription', 'affiliate_link', 'header', 'email_collector', 'embed', 'coaching_form'] },
        thumbnailUrl: { type: 'string', required: false, description: 'Product thumbnail image' },
        externalUrl: { type: 'string', required: false, description: 'External link URL' },
        ctaText: { type: 'string', required: false, description: 'Call-to-action button text', default: 'Get Now' }
      },
      examples: [{
        component: 'ProductCard',
        data: {
          id: '123',
          title: 'Project Rock 8 Training Shoe',
          price: 120,
          type: 'link',
          externalUrl: 'https://under-armour.com/...',
          ctaText: 'Shop'
        }
      }]
    },
    ProductSection: {
      name: 'ProductSection',
      description: 'Grouped section of products',
      props: {
        title: { type: 'string', required: true, description: 'Section title' },
        description: { type: 'string', required: false, description: 'Section description' },
        products: { type: 'array', required: true, description: 'Array of ProductCard components' },
        layout: { type: 'string', required: false, description: 'Layout style', enum: ['grid', 'list', 'carousel'], default: 'grid' }
      },
      examples: [{
        component: 'ProductSection',
        data: {
          title: 'SHOP FAVORITES',
          products: [],
          layout: 'grid'
        }
      }]
    },
    CoachingForm: {
      name: 'CoachingForm',
      description: 'Form for coaching applications or inquiries',
      props: {
        id: { type: 'string', required: true, description: 'Form ID' },
        name: { type: 'string', required: true, description: 'Form name' },
        fields: { type: 'array', required: true, description: 'Form field definitions' },
        submitEndpoint: { type: 'string', required: true, description: 'Form submission endpoint' }
      },
      examples: [{
        component: 'CoachingForm',
        data: {
          id: '456',
          name: 'Coaching Application',
          fields: [
            { name: 'name', type: 'text', label: 'Full Name', required: true },
            { name: 'email', type: 'email', label: 'Email', required: true }
          ],
          submitEndpoint: '/api/coaching-apply'
        }
      }]
    },
    AffiliateCode: {
      name: 'AffiliateCode',
      description: 'Discount code or affiliate link display',
      props: {
        code: { type: 'string', required: true, description: 'Discount code' },
        discount: { type: 'string', required: false, description: 'Discount description' },
        description: { type: 'string', required: false, description: 'Code description' },
        ctaText: { type: 'string', required: false, description: 'Copy button text', default: 'Copy Code' }
      },
      examples: [{
        component: 'AffiliateCode',
        data: {
          code: 'ROCK20',
          discount: '20% off',
          description: 'Use this code at checkout'
        }
      }]
    },
    EmailCollector: {
      name: 'EmailCollector',
      description: 'Email signup component',
      props: {
        title: { type: 'string', required: true, description: 'Signup title' },
        description: { type: 'string', required: false, description: 'Signup description' },
        buttonText: { type: 'string', required: false, description: 'Submit button text', default: 'Subscribe' }
      },
      examples: [{
        component: 'EmailCollector',
        data: {
          title: 'Stay Updated',
          description: 'Get the latest workout tips',
          buttonText: 'Join Now'
        }
      }]
    },
    Embed: {
      name: 'Embed',
      description: 'Embedded content (video, iframe, etc.)',
      props: {
        type: { type: 'string', required: true, description: 'Embed type', enum: ['video', 'iframe', 'image'] },
        url: { type: 'string', required: true, description: 'Content URL' },
        title: { type: 'string', required: false, description: 'Content title' }
      },
      examples: [{
        component: 'Embed',
        data: {
          type: 'video',
          url: 'https://youtube.com/embed/abc123',
          title: 'Workout Tutorial'
        }
      }]
    },
    Header: {
      name: 'Header',
      description: 'Text header/section divider',
      props: {
        text: { type: 'string', required: true, description: 'Header text' },
        level: { type: 'number', required: false, description: 'Header level (1-6)', default: 2 },
        align: { type: 'string', required: false, description: 'Text alignment', enum: ['left', 'center', 'right'], default: 'left' }
      },
      examples: [{
        component: 'Header',
        data: {
          text: 'Featured Products',
          level: 2,
          align: 'center'
        }
      }]
    }
  }
};