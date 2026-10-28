export interface Settings {
  low: number
  high: number
  direction: 'horizontal' | 'vertical'
  sortBy: 'brightness' | 'hue' | 'saturation'
  reverse: boolean
  span: number
  strength: number
  shift: number
  smooth: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  low: 0.24,
  high: 0.88,
  direction: 'horizontal',
  sortBy: 'brightness',
  reverse: false,
  span: 240,
  strength: 0.9,
  shift: 3,
  smooth: false,
}

export const PRESETS: { name: string; description: string; color: string; settings: Settings }[] = [
  {
    name: 'Drift',
    description: 'Soft, horizontal trails',
    color: 'drift',
    settings: DEFAULT_SETTINGS,
  },
  {
    name: 'Signal',
    description: 'Vertical interference',
    color: 'signal',
    settings: {
      ...DEFAULT_SETTINGS,
      low: 0.15,
      high: 0.78,
      direction: 'vertical',
      span: 176,
      shift: 7,
      strength: 1,
    },
  },
  {
    name: 'Spectral',
    description: 'Color out of order',
    color: 'spectral',
    settings: {
      ...DEFAULT_SETTINGS,
      low: 0.1,
      high: 0.95,
      sortBy: 'hue',
      span: 480,
      shift: 12,
      reverse: true,
    },
  },
  {
    name: 'Oil slick',
    description: 'Painterly pixel smears',
    color: 'oil',
    settings: {
      ...DEFAULT_SETTINGS,
      low: 0.3,
      high: 0.85,
      sortBy: 'saturation',
      smooth: true,
      span: 320,
      shift: 0,
    },
  },
]

export function remixSettings(): Settings {
  const low = Math.round(Math.random() * 40) / 100
  return {
    ...DEFAULT_SETTINGS,
    low,
    high: Math.min(1, low + 0.35 + Math.round(Math.random() * 25) / 100),
    direction: Math.random() > 0.5 ? 'horizontal' : 'vertical',
    sortBy: (['brightness', 'hue', 'saturation'] as const)[Math.floor(Math.random() * 3)],
    reverse: Math.random() > 0.5,
    span: 80 + Math.round(Math.random() * 40) * 8,
    shift: Math.round(Math.random() * 12),
  }
}
