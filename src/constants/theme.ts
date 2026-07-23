export const Colors = {
  background: '#0A0A0C',
  surface: '#111318',
  border: 'rgba(255,255,255,0.08)',
  text: '#F2F2F0',
  textSecondary: '#8A8F98',
  textMuted: '#6B7280',
  accentLime: '#C6FF3D',
  accentOrange: '#FF7A00',
  accentRed: '#FF3B5C',
  accentBlue: '#3D8BFF',
} as const;

export const Fonts = {
  display: 'Rajdhani_700Bold',
  displaySemibold: 'Rajdhani_600SemiBold',
  mono: 'JetBrainsMono_600SemiBold',
  monoRegular: 'JetBrainsMono_400Regular',
  body: undefined, // system default (Inter-like on iOS, Roboto on Android)
} as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const RANK_TITLES = [
  'Novato',
  'Callejero',
  'Corredor',
  'Veterano',
  'Elite',
  'Fantasma',
  'Rival',
  'Leyenda',
  'Intocable',
  'Most Wanted',
] as const;

export function rankForPoints(points: number): string {
  const idx = Math.min(RANK_TITLES.length - 1, Math.floor(points / 150));
  return RANK_TITLES[idx];
}

export const UPGRADE_TYPES = [
  { id: 'pintura', label: 'Pintura', points: 40 },
  { id: 'motor', label: 'Motor / mecánica', points: 60 },
  { id: 'rines', label: 'Rines', points: 30 },
  { id: 'aero', label: 'Aero (spoiler, difusor)', points: 30 },
  { id: 'accesorios', label: 'Accesorios / detalles', points: 15 },
  { id: 'otro', label: 'Otra mejora', points: 20 },
] as const;

export type UpgradeTypeId = (typeof UPGRADE_TYPES)[number]['id'];

export function upgradeTypeFor(id: string) {
  return UPGRADE_TYPES.find((u) => u.id === id) ?? UPGRADE_TYPES[UPGRADE_TYPES.length - 1];
}

export const CAR_COLORS = [
  { name: 'Nitro Verde', value: '#C6FF3D' },
  { name: 'Bounty Naranja', value: '#FF7A00' },
  { name: 'Rojo Tail-light', value: '#FF3B5C' },
  { name: 'Azul Midnight', value: '#3D8BFF' },
  { name: 'Plata Chrome', value: '#C9CDD3' },
] as const;
