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

export interface CounterOptions {
  Enabled: boolean;
  Order: number;
  GraphType: CounterType;
  ShowTitle: 'SHOW' | 'HOVER' | 'HIDDEN';
  TitlePosition: 'TOP' | 'MIDDLE' | 'BOTTOM';
  ShowCurrentValue: 'SHOW' | 'HOVER' | 'HIDDEN';
  SummaryPosition: 'TOP' | 'MIDDLE' | 'BOTTOM';
  CurrentValueAsSummary: boolean;
  SeparateScales: boolean;
  InvertOrder: boolean;
  ShowCurrentValueShadowOnHover?: boolean;
  ShowTitleShadowOnHover?: boolean;
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

export interface GraphTheme {
  ThemeVersion: number;
  BarColor: string;
  TextColor: string;
  TextShadowColor: string;
  TitleColor: string;
  TitleShadowColor: string;
  TitleFont: string;
  TitleFontStyle: string;
  TitleSize: number;
  CurrentValueFont: string;
  CurrentValueFontStyle: string;
  CurrentValueSize: number;
  StackedColors: string[];
}

export interface AppOptions {
  OptionsVersion: number;
  HistorySize: number;
  PollTime: number;
  ThemeType: ThemeMode;
  EnableOnAllMonitors: boolean;
  MonitorOptions: Record<string, { Enabled: boolean; Position: 'LEFT' | 'RIGHT' }>;
  CounterOptions: Record<string, CounterOptions>;
  Soundcore?: SoundcoreConfig;
}

export interface CounterSubItem {
  name: string;
  currentValue: number;
  currentStringValue: string;
  maximumValue: number;
  history: number[];
}

export interface CounterData {
  id: string;
  name: string;
  label: string;
  summary: CounterSubItem;
  subItems: CounterSubItem[];
}

export interface SystemProcess {
  id: number;
  name: string;
  icon: string;
  cpu: number;
  memoryMB: number;
  diskMBs: number;
  networkKbps: number;
  status: string;
}
