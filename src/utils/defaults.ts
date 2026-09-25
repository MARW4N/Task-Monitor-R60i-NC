import { AppOptions, GraphTheme } from '../types/monitor';

export const DEFAULT_DARK_THEME: GraphTheme = {
  ThemeVersion: 1,
  BarColor: '#B0DEFF',
  TextColor: '#B9FF46',
  TextShadowColor: '#303030',
  TitleColor: '#FFFFFF',
  TitleShadowColor: '#303030',
  TitleFont: 'Segoe UI, Arial, sans-serif',
  TitleFontStyle: 'bold',
  TitleSize: 9,
  CurrentValueFont: 'Segoe UI, Arial, sans-serif',
  CurrentValueFontStyle: 'bold',
  CurrentValueSize: 9,
  StackedColors: ['#25548E', '#4190F2'],
};

export const DEFAULT_LIGHT_THEME: GraphTheme = {
  ThemeVersion: 1,
  BarColor: '#FF0080',
  TextColor: '#0080C0',
  TextShadowColor: '#E2E2E2',
  TitleColor: '#FF0080',
  TitleShadowColor: '#B4B4B4',
  TitleFont: 'Segoe UI, Arial, sans-serif',
  TitleFontStyle: 'bold',
  TitleSize: 9,
  CurrentValueFont: 'Segoe UI, Arial, sans-serif',
  CurrentValueFontStyle: 'bold',
  CurrentValueSize: 9,
  StackedColors: ['#A2A2A2', '#C8C8C8'],
};

export const DEFAULT_OPTIONS: AppOptions = {
  OptionsVersion: 5,
  HistorySize: 40,
  PollTime: 1,
  ThemeType: 'AUTOMATIC',
  EnableOnAllMonitors: true,
  MonitorOptions: {
    'Primary Monitor': { Enabled: true, Position: 'RIGHT' },
  },
  CounterOptions: {
    CPU: {
      GraphType: 'STACKED',
      SeparateScales: true,
      InvertOrder: false,
      SummaryPosition: 'TOP',
      CurrentValueAsSummary: true,
      ShowCurrentValueShadowOnHover: true,
      ShowCurrentValue: 'SHOW',
      TitlePosition: 'MIDDLE',
      ShowTitle: 'HOVER',
      Enabled: true,
      ShowTitleShadowOnHover: true,
      Order: 0,
    },
    MEM: {
      GraphType: 'SINGLE',
      SeparateScales: true,
      InvertOrder: false,
      SummaryPosition: 'TOP',
      CurrentValueAsSummary: true,
      ShowCurrentValueShadowOnHover: true,
      ShowCurrentValue: 'SHOW',
      TitlePosition: 'MIDDLE',
      ShowTitle: 'HOVER',
      Enabled: true,
      ShowTitleShadowOnHover: true,
      Order: 1,
    },
    DISK: {
      GraphType: 'STACKED',
      SeparateScales: true,
      InvertOrder: false,
      SummaryPosition: 'TOP',
      CurrentValueAsSummary: true,
      ShowCurrentValueShadowOnHover: true,
      ShowCurrentValue: 'SHOW',
      TitlePosition: 'MIDDLE',
      ShowTitle: 'HOVER',
      Enabled: true,
      ShowTitleShadowOnHover: true,
      Order: 2,
    },
    NET: {
      GraphType: 'STACKED',
      SeparateScales: true,
      InvertOrder: false,
      SummaryPosition: 'TOP',
      CurrentValueAsSummary: true,
      ShowCurrentValueShadowOnHover: true,
      ShowCurrentValue: 'SHOW',
      TitlePosition: 'MIDDLE',
      ShowTitle: 'HOVER',
      Enabled: true,
      ShowTitleShadowOnHover: true,
      Order: 3,
    },
    'GPU 3D': {
      GraphType: 'SINGLE',
      SeparateScales: true,
      InvertOrder: false,
      SummaryPosition: 'TOP',
      CurrentValueAsSummary: true,
      ShowCurrentValueShadowOnHover: true,
      ShowCurrentValue: 'SHOW',
      TitlePosition: 'MIDDLE',
      ShowTitle: 'HOVER',
      Enabled: true,
      ShowTitleShadowOnHover: true,
      Order: 4,
    },
    'GPU MEM': {
      GraphType: 'SINGLE',
      SeparateScales: true,
      InvertOrder: false,
      SummaryPosition: 'TOP',
      CurrentValueAsSummary: true,
      ShowCurrentValueShadowOnHover: true,
      ShowCurrentValue: 'SHOW',
      TitlePosition: 'MIDDLE',
      ShowTitle: 'HOVER',
      Enabled: true,
      ShowTitleShadowOnHover: true,
      Order: 5,
    },
  },
};

// Helper: Color interpolation matching C# GraphTheme.cs GetColorGradient
interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(color: string): RGBA {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 1 };
    }
    if (hex.length === 8) {
      const num = parseInt(hex, 16);
      return {
        r: (num >> 24) & 255,
        g: (num >> 16) & 255,
        b: (num >> 8) & 255,
        a: ((num & 255) / 255),
      };
    }
  }
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 100, g: 150, b: 240, a: 1 };
}

export function rgbaToString(c: RGBA): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

export function getColorGradient(fromColor: string, toColor: string, totalSteps: number): string[] {
  if (totalSteps <= 1) return [fromColor];
  const from = parseColor(fromColor);
  const to = parseColor(toColor);

  const steps = totalSteps - 1;
  const stepR = (to.r - from.r) / steps;
  const stepG = (to.g - from.g) / steps;
  const stepB = (to.b - from.b) / steps;
  const stepA = (to.a - from.a) / steps;

  const result: string[] = [];
  for (let i = 0; i < totalSteps; i++) {
    result.push(
      rgbaToString({
        r: Math.round(from.r + stepR * i),
        g: Math.round(from.g + stepG * i),
        b: Math.round(from.b + stepB * i),
        a: Math.min(1, Math.max(0, from.a + stepA * i)),
      })
    );
  }
  return result;
}

export function getNthGradientColor(colors: string[], total: number, n: number): string {
  if (!colors || colors.length === 0) return '#4190F2';
  if (colors.length === 1 || total <= 1) return colors[0];
  const gradient = getColorGradient(colors[0], colors[colors.length - 1], Math.max(2, total));
  return gradient[Math.min(n, gradient.length - 1)] || colors[0];
}
