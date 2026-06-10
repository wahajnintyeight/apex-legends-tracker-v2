import {theme} from './theme';

// Compact number formatting: 1234 -> "1,234", 12345 -> "12.3K", 1234567 -> "1.2M"
export function formatNumber(n: number): string {
  if (n === undefined || n === null || isNaN(n)) {
    return '—';
  }
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (abs >= 10_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return n.toLocaleString('en-US');
}

// Map an Apex rank name to a representative colour for badges/accents.
const RANK_COLORS: Record<string, string> = {
  unranked: '#8A95A5',
  rookie: '#A87E5A',
  bronze: '#A87E5A',
  silver: '#B9C4D0',
  gold: '#F2C14E',
  platinum: '#3FC1C9',
  diamond: '#4FA9FF',
  master: '#B14CFF',
  apex: '#FF4655',
  predator: '#FF4655',
};

export function rankColor(rankName?: string): string {
  if (!rankName) {
    return theme.colors.textMuted;
  }
  const key = rankName.toLowerCase().split(' ')[0];
  return RANK_COLORS[key] || theme.colors.textMuted;
}

// "Platinum" + div 2 -> "Platinum II"
const ROMAN = ['', 'I', 'II', 'III', 'IV'];
export function rankLabel(name?: string, div?: number): string {
  if (!name) {
    return 'Unranked';
  }
  if (name.toLowerCase() === 'unranked' || !div) {
    return name;
  }
  return `${name} ${ROMAN[div] || div}`;
}
