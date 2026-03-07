export interface CreatorTheme {
  primary: string;      // accent/button color (default: #1a1a1a)
  background: string;   // page background (default: #ffffff)  
  cardBg: string;       // card/button background (default: #f5f5f5)
  textColor: string;    // primary text (default: #000000)
  font: 'default' | 'serif' | 'mono' | 'rounded'; // font family
  
  // FEATURE 1: Button Styles
  buttonStyle?: 'fill' | 'outline' | 'soft' | 'pill' | 'hard' | 'shadow';
  
  // FEATURE 2: Background Wallpaper/Gradient
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundGradient?: string;
  backgroundImage?: string;
  
  // FEATURE 3: Avatar/Header Layout
  headerStyle?: 'classic' | 'banner' | 'minimal';
  headerImage?: string;
  
  // FEATURE 4: Card Transparency/Blur (Glassmorphism)
  cardStyle?: 'solid' | 'glass' | 'transparent';
  
  // FEATURE 5: Social Icon Style
  socialStyle?: 'filled' | 'outline' | 'minimal' | 'colored';
}

export const DEFAULT_THEME: CreatorTheme = {
  primary: '#1a1a1a',
  background: '#ffffff',
  cardBg: '#f5f5f5',
  textColor: '#000000',
  font: 'default',
  buttonStyle: 'fill',
  backgroundType: 'solid',
  backgroundGradient: '',
  backgroundImage: '',
  headerStyle: 'classic',
  cardStyle: 'solid',
  socialStyle: 'filled'
};

// Define preset gradients
const PRESET_GRADIENTS = {
  midnight: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  ember: 'linear-gradient(135deg, #0a0a0a, #1a0000, #2d0000)',
  ocean: 'linear-gradient(135deg, #0f172a, #0c2a4a, #0f172a)',
  sunset: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
  aurora: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)',
  cotton: 'linear-gradient(135deg, #fdfcfb, #e2d1c3)',
  neon: 'linear-gradient(135deg, #0a0a0a, #1b0a2e, #0a1628)',
  forest: 'linear-gradient(135deg, #0a1a0a, #1a2e1a, #0a1a0a)'
};

export const PRESET_THEMES: Record<string, CreatorTheme> = {
  clean: {
    primary: '#1a1a1a',
    background: '#ffffff',
    cardBg: '#f5f5f5',
    textColor: '#000000',
    font: 'default',
    buttonStyle: 'fill',
    backgroundType: 'solid',
    headerStyle: 'classic',
    cardStyle: 'solid',
    socialStyle: 'filled'
  },
  dark: {
    primary: '#ffffff',
    background: '#0d0d0d',
    cardBg: '#1a1a1a',
    textColor: '#ffffff',
    font: 'default',
    buttonStyle: 'shadow',
    backgroundType: 'solid',
    headerStyle: 'classic',
    cardStyle: 'solid',
    socialStyle: 'filled'
  },
  warm: {
    primary: '#c4703f',
    background: '#faf5f0',
    cardBg: '#f0e6d6',
    textColor: '#3d2b1f',
    font: 'serif',
    buttonStyle: 'soft',
    backgroundType: 'solid',
    headerStyle: 'classic',
    cardStyle: 'solid',
    socialStyle: 'filled'
  },
  ocean: {
    primary: '#2563eb',
    background: '#f0f7ff',
    cardBg: '#e0edf7',
    textColor: '#1a3a5c',
    font: 'default',
    buttonStyle: 'outline',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.ocean,
    headerStyle: 'classic',
    cardStyle: 'glass',
    socialStyle: 'outline'
  },
  midnight: {
    primary: '#6366f1',
    background: '#0f172a',
    cardBg: '#1e293b',
    textColor: '#e2e8f0',
    font: 'default',
    buttonStyle: 'soft',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.midnight,
    headerStyle: 'banner',
    cardStyle: 'glass',
    socialStyle: 'minimal'
  },
  forest: {
    primary: '#16a34a',
    background: '#f0fdf4',
    cardBg: '#dcfce7',
    textColor: '#14532d',
    font: 'default',
    buttonStyle: 'pill',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.forest,
    headerStyle: 'classic',
    cardStyle: 'solid',
    socialStyle: 'colored'
  },
  // fitness-native presets
  iron: {
    primary: '#ef4444',
    background: '#0a0a0a',
    cardBg: '#171717',
    textColor: '#fafafa',
    font: 'default',
    buttonStyle: 'hard',
    backgroundType: 'solid',
    headerStyle: 'minimal',
    cardStyle: 'solid',
    socialStyle: 'filled'
  },
  neon: {
    primary: '#22d3ee',
    background: '#020617',
    cardBg: '#0f172a',
    textColor: '#e0f2fe',
    font: 'mono',
    buttonStyle: 'shadow',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.neon,
    headerStyle: 'minimal',
    cardStyle: 'glass',
    socialStyle: 'colored'
  },
  pump: {
    primary: '#f97316',
    background: '#1c1917',
    cardBg: '#292524',
    textColor: '#fafaf9',
    font: 'default',
    buttonStyle: 'fill',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.ember,
    headerStyle: 'classic',
    cardStyle: 'solid',
    socialStyle: 'filled'
  },
  blush: {
    primary: '#ec4899',
    background: '#fdf2f8',
    cardBg: '#fce7f3',
    textColor: '#831843',
    font: 'rounded',
    buttonStyle: 'pill',
    backgroundType: 'solid',
    headerStyle: 'banner',
    cardStyle: 'transparent',
    socialStyle: 'outline'
  },
  concrete: {
    primary: '#a3a3a3',
    background: '#171717',
    cardBg: '#262626',
    textColor: '#d4d4d4',
    font: 'mono',
    buttonStyle: 'outline',
    backgroundType: 'solid',
    headerStyle: 'minimal',
    cardStyle: 'glass',
    socialStyle: 'minimal'
  },
  matcha: {
    primary: '#10a37f',
    background: '#0a0a0a',
    cardBg: '#141414',
    textColor: '#f0fdf4',
    font: 'default',
    buttonStyle: 'soft',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.aurora,
    headerStyle: 'classic',
    cardStyle: 'glass',
    socialStyle: 'colored'
  },
  peach: {
    primary: '#fb923c',
    background: '#fffbeb',
    cardBg: '#fef3c7',
    textColor: '#78350f',
    font: 'serif',
    buttonStyle: 'soft',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.sunset,
    headerStyle: 'banner',
    cardStyle: 'transparent',
    socialStyle: 'outline'
  },
  arctic: {
    primary: '#38bdf8',
    background: '#f8fafc',
    cardBg: '#e2e8f0',
    textColor: '#0f172a',
    font: 'default',
    buttonStyle: 'outline',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.cotton,
    headerStyle: 'classic',
    cardStyle: 'glass',
    socialStyle: 'outline'
  },
  volt: {
    primary: '#a3e635',
    background: '#0a0a0a',
    cardBg: '#1a1a1a',
    textColor: '#fafafa',
    font: 'default',
    buttonStyle: 'shadow',
    backgroundType: 'solid',
    headerStyle: 'minimal',
    cardStyle: 'solid',
    socialStyle: 'colored'
  },
  rose: {
    primary: '#e11d48',
    background: '#fff1f2',
    cardBg: '#ffe4e6',
    textColor: '#4c0519',
    font: 'serif',
    buttonStyle: 'pill',
    backgroundType: 'solid',
    headerStyle: 'banner',
    cardStyle: 'transparent',
    socialStyle: 'filled'
  },
  stealth: {
    primary: '#3b82f6',
    background: '#111827',
    cardBg: '#1f2937',
    textColor: '#f9fafb',
    font: 'default',
    buttonStyle: 'outline',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.midnight,
    headerStyle: 'minimal',
    cardStyle: 'glass',
    socialStyle: 'minimal'
  },
  clay: {
    primary: '#d97706',
    background: '#fefce8',
    cardBg: '#fef9c3',
    textColor: '#713f12',
    font: 'rounded',
    buttonStyle: 'soft',
    backgroundType: 'gradient',
    backgroundGradient: PRESET_GRADIENTS.sunset,
    headerStyle: 'classic',
    cardStyle: 'solid',
    socialStyle: 'outline'
  }
};

export { PRESET_GRADIENTS };