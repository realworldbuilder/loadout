import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CreatorTheme, DEFAULT_THEME } from '@/types/theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateHandle(handle: string): string | null {
  // Handle validation rules
  const minLength = 3;
  const maxLength = 30;
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  
  if (handle.length < minLength) {
    return `Handle must be at least ${minLength} characters`;
  }
  
  if (handle.length > maxLength) {
    return `Handle must be no more than ${maxLength} characters`;
  }
  
  if (!validPattern.test(handle)) {
    return 'Handle can only contain letters, numbers, underscores, and hyphens';
  }
  
  // Reserved handles
  const reserved = [
    'admin', 'api', 'www', 'app', 'dashboard', 'create', 'signup', 'login',
    'about', 'help', 'support', 'terms', 'privacy', 'blog', 'loadout'
  ];
  
  if (reserved.includes(handle.toLowerCase())) {
    return 'This handle is reserved and cannot be used';
  }
  
  return null;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return formatDate(date);
  }
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function getThemeStyles(theme?: Partial<CreatorTheme>) {
  const finalTheme = { ...DEFAULT_THEME, ...theme };
  
  let backgroundStyle = finalTheme.background;
  
  // Handle background type
  if (finalTheme.backgroundType === 'gradient' && finalTheme.backgroundGradient) {
    backgroundStyle = finalTheme.backgroundGradient;
  } else if (finalTheme.backgroundType === 'image' && finalTheme.backgroundImage) {
    backgroundStyle = `url(${finalTheme.backgroundImage})`;
  }
  
  return {
    background: finalTheme.backgroundType === 'image' ? backgroundStyle : undefined,
    backgroundColor: finalTheme.backgroundType === 'solid' ? backgroundStyle : undefined,
    backgroundImage: finalTheme.backgroundType === 'gradient' ? backgroundStyle : undefined,
    backgroundSize: finalTheme.backgroundType === 'image' ? 'cover' : undefined,
    backgroundPosition: finalTheme.backgroundType === 'image' ? 'center' : undefined,
    backgroundAttachment: finalTheme.backgroundType === 'image' ? 'fixed' : undefined,
    color: finalTheme.textColor,
    '--primary-color': finalTheme.primary,
    '--card-bg-color': finalTheme.cardBg,
    '--button-style': finalTheme.buttonStyle || 'fill',
    '--header-style': finalTheme.headerStyle || 'classic',
    '--card-style': finalTheme.cardStyle || 'solid',
    '--social-style': finalTheme.socialStyle || 'filled',
  } as React.CSSProperties;
}

export function getThemeFontClass(font: CreatorTheme['font']) {
  switch (font) {
    case 'serif': return 'font-theme-serif';
    case 'mono': return 'font-theme-mono';
    case 'rounded': return 'font-theme-rounded';
    default: return 'font-theme-default';
  }
}

export function getButtonClasses(buttonStyle: CreatorTheme['buttonStyle'], primaryColor: string, isDark: boolean = false) {
  const baseClasses = 'font-semibold px-6 py-3 transition-all duration-200';
  
  switch (buttonStyle) {
    case 'outline':
      return `${baseClasses} bg-transparent border-2 hover:bg-opacity-10 rounded-lg`;
    case 'soft':
      return `${baseClasses} border-0 rounded-lg`;
    case 'pill':
      return `${baseClasses} border-0 rounded-full`;
    case 'hard':
      return `${baseClasses} border-0 rounded-none`;
    case 'shadow':
      return `${baseClasses} border-0 rounded-lg shadow-lg hover:shadow-xl`;
    default: // 'fill'
      return `${baseClasses} border-0 rounded-lg`;
  }
}

export function getCardClasses(cardStyle: CreatorTheme['cardStyle'], isDark: boolean = false) {
  switch (cardStyle) {
    case 'glass':
      return `backdrop-blur-xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}`;
    case 'transparent':
      return `bg-transparent border-b ${isDark ? 'border-white/10' : 'border-black/10'}`;
    default: // 'solid'
      return 'border';
  }
}

export function getSocialIconClasses(socialStyle: CreatorTheme['socialStyle'], platform: string, isDark: boolean = false) {
  const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200';
  
  switch (socialStyle) {
    case 'outline':
      return `${baseClasses} border-2 ${isDark ? 'border-white/30 hover:border-white/50' : 'border-gray-300 hover:border-gray-400'}`;
    case 'minimal':
      return `${baseClasses} hover:bg-opacity-10`;
    case 'colored':
      return `${baseClasses} ${getBrandColorClasses(platform)}`;
    default: // 'filled'
      return `${baseClasses} ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`;
  }
}

function getBrandColorClasses(platform: string) {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600';
    case 'tiktok':
      return 'bg-black text-white hover:bg-gray-800';
    case 'youtube':
      return 'bg-red-600 text-white hover:bg-red-700';
    case 'twitter':
    case 'x':
      return 'bg-black text-white hover:bg-gray-800';
    default:
      return 'bg-gray-600 text-white hover:bg-gray-700';
  }
}