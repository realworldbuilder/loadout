export interface CreatorTheme {
  primary: string;      // accent/button color (default: #1a1a1a)
  background: string;   // page background (default: #ffffff)  
  cardBg: string;       // card/button background (default: #f5f5f5)
  textColor: string;    // primary text (default: #000000)
  font: 'default' | 'serif' | 'mono' | 'rounded'; // font family
}

export const DEFAULT_THEME: CreatorTheme = {
  primary: '#1a1a1a',
  background: '#ffffff',
  cardBg: '#f5f5f5',
  textColor: '#000000',
  font: 'default'
};

export const PRESET_THEMES: Record<string, CreatorTheme> = {
  clean: {
    primary: '#1a1a1a',
    background: '#ffffff',
    cardBg: '#f5f5f5',
    textColor: '#000000',
    font: 'default'
  },
  dark: {
    primary: '#ffffff',
    background: '#0d0d0d',
    cardBg: '#1a1a1a',
    textColor: '#ffffff',
    font: 'default'
  },
  warm: {
    primary: '#c4703f',
    background: '#faf5f0',
    cardBg: '#f0e6d6',
    textColor: '#3d2b1f',
    font: 'default'
  },
  ocean: {
    primary: '#2563eb',
    background: '#f0f7ff',
    cardBg: '#e0edf7',
    textColor: '#1a3a5c',
    font: 'default'
  },
  midnight: {
    primary: '#6366f1',
    background: '#0f172a',
    cardBg: '#1e293b',
    textColor: '#e2e8f0',
    font: 'default'
  },
  forest: {
    primary: '#16a34a',
    background: '#f0fdf4',
    cardBg: '#dcfce7',
    textColor: '#14532d',
    font: 'default'
  },
  // fitness-native presets
  iron: {
    primary: '#ef4444',
    background: '#0a0a0a',
    cardBg: '#171717',
    textColor: '#fafafa',
    font: 'default'
  },
  neon: {
    primary: '#22d3ee',
    background: '#020617',
    cardBg: '#0f172a',
    textColor: '#e0f2fe',
    font: 'mono'
  },
  pump: {
    primary: '#f97316',
    background: '#1c1917',
    cardBg: '#292524',
    textColor: '#fafaf9',
    font: 'default'
  },
  blush: {
    primary: '#ec4899',
    background: '#fdf2f8',
    cardBg: '#fce7f3',
    textColor: '#831843',
    font: 'rounded'
  },
  concrete: {
    primary: '#a3a3a3',
    background: '#171717',
    cardBg: '#262626',
    textColor: '#d4d4d4',
    font: 'mono'
  },
  matcha: {
    primary: '#10a37f',
    background: '#0a0a0a',
    cardBg: '#141414',
    textColor: '#f0fdf4',
    font: 'default'
  },
  peach: {
    primary: '#fb923c',
    background: '#fffbeb',
    cardBg: '#fef3c7',
    textColor: '#78350f',
    font: 'serif'
  },
  arctic: {
    primary: '#38bdf8',
    background: '#f8fafc',
    cardBg: '#e2e8f0',
    textColor: '#0f172a',
    font: 'default'
  },
  volt: {
    primary: '#a3e635',
    background: '#0a0a0a',
    cardBg: '#1a1a1a',
    textColor: '#fafafa',
    font: 'default'
  },
  rose: {
    primary: '#e11d48',
    background: '#fff1f2',
    cardBg: '#ffe4e6',
    textColor: '#4c0519',
    font: 'serif'
  },
  stealth: {
    primary: '#3b82f6',
    background: '#111827',
    cardBg: '#1f2937',
    textColor: '#f9fafb',
    font: 'default'
  },
  clay: {
    primary: '#d97706',
    background: '#fefce8',
    cardBg: '#fef9c3',
    textColor: '#713f12',
    font: 'rounded'
  }
};