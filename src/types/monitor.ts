export type CounterType = 'SINGLE' | 'STACKED' | 'MIRRORED';

export interface CounterOption {
  enabled: boolean;
  order: number;
  graphType: CounterType;
  showTitle: 'SHOW' | 'HOVER' | 'HIDDEN';
  titlePosition: 'TOP' | 'MIDDLE' | 'BOTTOM';
  showCurrentValue: 'SHOW' | 'HOVER' | 'HIDDEN';
  summaryPosition: 'TOP' | 'MIDDLE' | 'BOTTOM';
  currentValueAsSummary: boolean;
  separateScales: boolean;
  invertOrder: boolean;
}

export interface SoundcoreConfig {
  exePath: string;
  macAddress: string;
  pollIntervalSeconds: number;
  hideWhenDisconnected: boolean;
  lowBatteryThreshold: number;
  showLeft: boolean;
  showRight: boolean;
  showCase: boolean;
  renderAsWidgetText: boolean;
}

export interface SoundcoreBatteryState {
  isConnected: boolean;
  leftPercent: number; // 0-100 or -1
  rightPercent: number; // 0-100 or -1
  casePercent: number; // 0-100 or -1
  leftRaw: string; // e.g. "9/5"
  rightRaw: string; // e.g. "8/5"
  caseRaw: string; // e.g. "5/5"
  lastUpdated: Date;
}

export type ThemeMode = 'AUTOMATIC' | 'DARK' | 'LIGHT' | 'CUSTOM';

export interface MonitorTheme {
  name: string;
  background: string;
  textColor: string;
  textShadowColor: string;
  barColor: string;
  graphColor1: string;
  graphColor2: string;
  lowBatteryColor: string;
}
