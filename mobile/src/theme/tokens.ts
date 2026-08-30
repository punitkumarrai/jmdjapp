export const colors = {
  bgWarm: '#FAF9F6',
  surface: '#FFFFFF',
  primary: '#5C061C',
  secondary: '#E6C787',
  accent: '#C89D9C',
  textDark: '#2C1E21',
  textLight: '#FAF9F6',
  border: 'rgba(230, 199, 135, 0.3)',
  
  // Semantic/state
  primaryDark: '#4A0516',
  textSecondary: '#6B5E52',
  success: '#1E7A4A',
  danger: '#B3261E',
};

export const typography = {
  family: {
    serif: 'PlayfairDisplay_700Bold',
    sans: 'Manrope_400Regular',
    sansMedium: 'Manrope_500Medium',
    sansBold: 'Manrope_700Bold', // tabular figures should be used if possible
  },
  sizes: {
    display: 32,
    h1: 24,
    h2: 20,
    body: 16,
    label: 14,
    caption: 12,
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  card: 8,
  button: 8,
  pill: 999,
};

export const theme = {
  colors,
  typography,
  spacing,
  radius,
};
