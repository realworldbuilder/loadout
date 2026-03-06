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
  return {
    backgroundColor: finalTheme.background,
    color: finalTheme.textColor,
    '--primary-color': finalTheme.primary,
    '--card-bg-color': finalTheme.cardBg,
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