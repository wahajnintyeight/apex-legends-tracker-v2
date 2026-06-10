// Apex Legends inspired dark theme
export const theme = {
  colors: {
    bg: '#0B0E13',
    surface: '#141A22',
    surfaceAlt: '#1C2530',
    border: '#283344',
    primary: '#FF4655', // Apex red
    primaryDark: '#C8202E',
    accent: '#FFB000', // gold
    text: '#F5F7FA',
    textMuted: '#8A95A5',
    textDim: '#5A6675',
    success: '#3DD68C',
    live: '#FF4655',
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
  spacing: (n: number) => n * 4,
  font: {
    h1: 30,
    h2: 22,
    h3: 18,
    body: 15,
    small: 13,
    tiny: 11,
  },
};

export type Theme = typeof theme;
