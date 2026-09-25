import React, { useState, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  FolderOpen, 
  Play, 
  Check, 
  RotateCcw, 
  Headphones, 
  Sliders,
  Monitor as MonitorIcon,
  Info,
  Layers,
  ChevronDown
} from 'lucide-react';
import { CounterOption, SoundcoreConfig, ThemeMode, SoundcoreBatteryState } from '../types/monitor';
import { isLowBattery } from '../utils/soundcore';

interface TaskbarMonitorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  counters: Record<string, CounterOption>;
  soundcoreConfig: SoundcoreConfig;
  themeMode: ThemeMode;
  batteryState: SoundcoreBatteryState;
  onUpdateCounters: (counters: Record<string, CounterOption>) => void;
  onUpdateSoundcoreConfig: (config: SoundcoreConfig) => void;
  onUpdateThemeMode: (mode: ThemeMode) => void;
  onTestConnection?: () => void;
}

type TabType = 'GENERAL' | 'COUNTERS' | 'SOUNDCORE' | 'MONITORS' | 'ABOUT';

export const TaskbarMonitorSettings: React.FC<TaskbarMonitorSettingsProps> = ({
  isOpen,
  onClose,
  counters,
  soundcoreConfig,
  themeMode,
  batteryState,
  onUpdateCounters,
  onUpdateSoundcoreConfig,
  onUpdateThemeMode,
  onTestConnection
}) => {
  // Active Tab: default to SOUNDCORE or GENERAL
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');
  
  // Local working copies of state (applied when clicking Apply or OK)
  const [localCounters, setLocalCounters] = useState<Record<string, CounterOption>>(counters);
  const [localSoundcore, setLocalSoundcore] = useState<SoundcoreConfig>(soundcoreConfig);
  const [localTheme, setLocalTheme] = useState<ThemeMode>(themeMode);
  const [historySize, setHistorySize] = useState<number>(40);
  const [pollTime, setPollTime] = useState<number>(1);
  const [selectedCounterKey, setSelectedCounterKey] = useState<string>('SOUNDCORE');
  
  // Custom theme colors state
  const [customBarColor, setCustomBarColor] = useState<string>('#38bdf8');
  const [customTextColor, setCustomTextColor] = useState<string>('#ffffff');
  const [customTitleColor, setCustomTitleColor] = useState<string>('#94a3b8');
  const [customStacked1, setCustomStacked1] = useState<string>('#38bdf8');
  const [customStacked2, setCustomStacked2] = useState<string>('#a855f7');
  
  // Multi monitor state
  const [enableAllTaskbars, setEnableAllTaskbars] = useState<boolean>(true);
  const [monitorPosition, setMonitorPosition] = useState<'RIGHT' | 'LEFT'>('RIGHT');
  
  // Test connection feedback in Soundcore tab
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setLocalCounters(counters);
      setLocalSoundcore(soundcoreConfig);
      setLocalTheme(themeMode);
      setTestResult(null);
    }
  }, [isOpen, counters, soundcoreConfig, themeMode]);

  if (!isOpen) return null;

  // Sorted list of counter keys by order
  const sortedCounterKeys = Object.keys(localCounters).sort(
    (a, b) => localCounters[a].order - localCounters[b].order
  );

  const activeCounter = localCounters[selectedCounterKey] || localCounters['SOUNDCORE'] || localCounters['CPU'];

  // Handle reordering up / down
  const moveCounter = (direction: 'up' | 'down') => {
    const idx = sortedCounterKeys.indexOf(selectedCounterKey);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sortedCounterKeys.length) return;

    const targetKey = sortedCounterKeys[targetIdx];
    const newCounters = { ...localCounters };
    const currentOrder = newCounters[selectedCounterKey].order;
    const targetOrder = newCounters[targetKey].order;

    newCounters[selectedCounterKey] = { ...newCounters[selectedCounterKey], order: targetOrder };
    newCounters[targetKey] = { ...newCounters[targetKey], order: currentOrder };

    setLocalCounters(newCounters);
  };

  // Apply changes to parent
  const handleApply = () => {
    onUpdateCounters(localCounters);
    onUpdateSoundcoreConfig(localSoundcore);
    onUpdateThemeMode(localTheme);
  };

  const handleOK = () => {
    handleApply();
    onClose();
  };

  const handleResetDefaults = () => {
    setHistorySize(40);
    setPollTime(1);
    setLocalTheme('AUTOMATIC');
    setLocalSoundcore({
      exePath: 'F:\\R60i NC Battery\\openscq30.exe',
      macAddress: '34:09:C9:AD:A9:20',
      pollIntervalSeconds: 5,
      hideWhenDisconnected: false,
      lowBatteryThreshold: 40,
      showLeft: true,
      showRight: true,
      showCase: true,
      renderAsWidgetText: true
    });
    setLocalCounters({
      'CPU': { enabled: true, order: 0, graphType: 'STACKED', showTitle: 'HOVER', titlePosition: 'MIDDLE', showCurrentValue: 'SHOW', summaryPosition: 'TOP', currentValueAsSummary: true, separateScales: true, invertOrder: false },
      'MEM': { enabled: true, order: 1, graphType: 'SINGLE', showTitle: 'HOVER', titlePosition: 'MIDDLE', showCurrentValue: 'SHOW', summaryPosition: 'TOP', currentValueAsSummary: true, separateScales: true, invertOrder: false },
      'DISK': { enabled: true, order: 2, graphType: 'STACKED', showTitle: 'HOVER', titlePosition: 'MIDDLE', showCurrentValue: 'SHOW', summaryPosition: 'TOP', currentValueAsSummary: true, separateScales: true, invertOrder: false },
      'NET': { enabled: true, order: 3, graphType: 'STACKED', showTitle: 'HOVER', titlePosition: 'MIDDLE', showCurrentValue: 'SHOW', summaryPosition: 'TOP', currentValueAsSummary: true, separateScales: true, invertOrder: false },
      'GPU 3D': { enabled: true, order: 4, graphType: 'SINGLE', showTitle: 'HOVER', titlePosition: 'MIDDLE', showCurrentValue: 'SHOW', summaryPosition: 'TOP', currentValueAsSummary: true, separateScales: true, invertOrder: false },
      'SOUNDCORE': { enabled: true, order: 5, graphType: 'SINGLE', showTitle: 'HOVER', titlePosition: 'MIDDLE', showCurrentValue: 'SHOW', summaryPosition: 'TOP', currentValueAsSummary: true, separateScales: false, invertOrder: false }
    });
  };

  const runTestCli = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      if (batteryState.isConnected) {
        setTestResult(`Success! Command executed: openscq30.exe device --mac-address ${localSoundcore.macAddress} setting --get batteryLevelLeft --get batteryLevelRight --get caseBatteryLevel --json\n\nResult:\n{\n  "batteryLevelLeft": "${batteryState.leftRaw}",\n  "batteryLevelRight": "${batteryState.rightRaw}",\n  "caseBatteryLevel": "${batteryState.caseRaw}"\n}\n\nConverted: Left: ${batteryState.leftPercent}% | Right: ${batteryState.rightPercent}% | Case: ${batteryState.casePercent}%`);
      } else {
        setTestResult(`Failed: openscq30 returned "?" or exited with code 1. Ensure earbuds are connected via Bluetooth.`);
      }
    }, 600);
  };

  const isDark = localTheme === 'DARK' || localTheme === 'AUTOMATIC';
  const textColor = isDark ? '#ffffff' : '#1e293b';
  const lowColor = '#F23C34';
  const isLeftLow = isLowBattery(batteryState.leftPercent, localSoundcore.lowBatteryThreshold);
  const isRightLow = isLowBattery(batteryState.rightPercent, localSoundcore.lowBatteryThreshold);
  const isCaseLow = isLowBattery(batteryState.casePercent, localSoundcore.lowBatteryThreshold);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 select-none">
      {/* Authentic Windows Forms OptionForm Window Container */}
      <div 
        className="w-[780px] max-w-full h-[620px] max-h-[96vh] flex flex-col bg-[#2d2d30] text-[#e1e1e1] border border-[#555555] shadow-[0_12px_40px_rgba(0,0,0,0.85)] rounded-xs overflow-hidden font-sans text-xs"
        style={{ fontFamily: "'Segoe UI', 'Calibri', Tahoma, sans-serif" }}
      >
        {/* Title Bar (Authentic WinForms / Windows 11 style) */}
        <div className="h-8 bg-[#1f1f1f] text-white flex items-center justify-between px-3 border-b border-[#3e3e42] shrink-0">
          <div className="flex items-center space-x-2">
            {/* Taskbar Monitor Icon */}
            <div className="w-4 h-4 bg-sky-500 rounded-[2px] flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              📊
            </div>
            <span className="text-xs font-semibold text-[#cccccc] tracking-tight">taskbar-monitor</span>
          </div>

          <div className="flex items-center">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#333333] transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-slate-500 cursor-not-allowed">
              <Square className="w-3 h-3" />
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#c42b1c] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top Header / Live Preview Area (swcPreview in OptionForm.cs) */}
        <div className="bg-[#252526] px-4 py-2 border-b border-[#3e3e42] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-[#aaaaaa]">Preview:</span>
            {/* Live rendered swcPreview bar */}
            <div 
              className="h-8 px-2.5 rounded-[2px] border border-[#444444] flex items-center space-x-2 shadow-inner"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : '#ffffff' }}
            >
              {sortedCounterKeys.map((name) => {
                const opt = localCounters[name];
                if (!opt || !opt.enabled) return null;

                if (name === 'SOUNDCORE') {
                  if (localSoundcore.hideWhenDisconnected && !batteryState.isConnected) return null;
                  return (
                    <div 
                      key="SOUNDCORE_PREVIEW" 
                      className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[11px] font-bold select-none whitespace-nowrap"
                      style={{ color: textColor }}
                    >
                      {batteryState.isConnected ? (
                        <span className="space-x-1">
                          {localSoundcore.showLeft && (
                            <span>
                              <span className="opacity-75">L: </span>
                              <span style={{ color: isLeftLow ? lowColor : textColor }}>{batteryState.leftPercent}%</span>
                            </span>
                          )}
                          {localSoundcore.showLeft && localSoundcore.showRight && <span className="opacity-40">|</span>}
                          {localSoundcore.showRight && (
                            <span>
                              <span className="opacity-75">R: </span>
                              <span style={{ color: isRightLow ? lowColor : textColor }}>{batteryState.rightPercent}%</span>
                            </span>
                          )}
                          {((localSoundcore.showLeft || localSoundcore.showRight) && localSoundcore.showCase) && <span className="opacity-40">|</span>}
                          {localSoundcore.showCase && (
                            <span>
                              <span className="opacity-75">C: </span>
                              <span style={{ color: isCaseLow ? lowColor : textColor }}>{batteryState.casePercent}%</span>
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">L:? R:? C:?</span>
                      )}
                    </div>
                  );
                }

                // Standard performance graph counters preview
                const colors: Record<string, string> = {
                  'CPU': '#38bdf8',
                  'MEM': '#a855f7',
                  'DISK': '#22c55e',
                  'NET': '#f59e0b',
                  'GPU 3D': '#ec4899',
                  'GPU MEM': '#06b6d4'
                };
                const color = colors[name] || '#38bdf8';

                return (
                  <div key={name} className="flex flex-col items-center justify-center w-8 h-6 bg-black/30 rounded px-1 border border-white/5">
                    <span className="text-[7.5px] font-semibold text-slate-300 leading-none">{name}</span>
                    <div className="w-full h-2 bg-slate-800 rounded-xs mt-0.5 overflow-hidden">
                      <div className="h-full rounded-xs" style={{ width: '60%', backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-sky-400/90 font-medium">
            Taskbar Monitor v0.2.14
          </div>
        </div>

        {/* Main Content Area (Sidebar Menu + Tab Content) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Menu Sidebar (panelMenu in OptionForm.cs) */}
          <div className="w-48 bg-[#404040] flex flex-col border-r border-[#333333] shrink-0">
            <button
              onClick={() => setActiveTab('GENERAL')}
              className={`h-13 px-4 flex items-center justify-center text-center font-bold text-xs tracking-wider transition-colors border-b border-[#4d4d4d] ${
                activeTab === 'GENERAL'
                  ? 'bg-[#4682B4] text-white shadow-xs'
                  : 'bg-[#404040] text-[#f0f0f0] hover:bg-[#4a4a4a]'
              }`}
            >
              GENERAL
            </button>

            <button
              onClick={() => setActiveTab('COUNTERS')}
              className={`h-13 px-4 flex items-center justify-center text-center font-bold text-xs tracking-wider transition-colors border-b border-[#4d4d4d] ${
                activeTab === 'COUNTERS'
                  ? 'bg-[#4682B4] text-white shadow-xs'
                  : 'bg-[#404040] text-[#f0f0f0] hover:bg-[#4a4a4a]'
              }`}
            >
              GRAPHS / COUNTERS
            </button>

            {/* SOUNDCORE EARBUDS TAB (The newly added feature tab!) */}
            <button
              onClick={() => setActiveTab('SOUNDCORE')}
              className={`h-14 px-3 flex flex-col items-center justify-center text-center font-bold text-xs tracking-wider transition-colors border-b border-[#4d4d4d] relative ${
                activeTab === 'SOUNDCORE'
                  ? 'bg-[#4682B4] text-white shadow-xs'
                  : 'bg-[#404040] text-[#f0f0f0] hover:bg-[#4a4a4a]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-sky-300" />
                <span>SOUNDCORE</span>
              </div>
              <span className="text-[10px] font-normal opacity-90">EARBUDS BATTERY</span>
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-emerald-400 rounded-full" title="Integrated Feature" />
            </button>

            <button
              onClick={() => setActiveTab('MONITORS')}
              className={`h-14 px-4 flex items-center justify-center text-center font-bold text-[11px] leading-tight tracking-wider transition-colors border-b border-[#4d4d4d] ${
                activeTab === 'MONITORS'
                  ? 'bg-[#4682B4] text-white shadow-xs'
                  : 'bg-[#404040] text-[#f0f0f0] hover:bg-[#4a4a4a]'
              }`}
            >
              MULTI MONITORS<br />&amp; POSITIONING
            </button>

            <button
              onClick={() => setActiveTab('ABOUT')}
              className={`h-13 px-4 flex items-center justify-center text-center font-bold text-xs tracking-wider transition-colors border-b border-[#4d4d4d] ${
                activeTab === 'ABOUT'
                  ? 'bg-[#4682B4] text-white shadow-xs'
                  : 'bg-[#404040] text-[#f0f0f0] hover:bg-[#4a4a4a]'
              }`}
            >
              ABOUT
            </button>

            <div className="flex-1 bg-[#404040]" />
          </div>

          {/* Tab Body (tabControl1 in OptionForm.cs) */}
          <div className="flex-1 p-4 bg-[#2b2b2b] overflow-y-auto">
            {/* TAB 1: GENERAL */}
            {activeTab === 'GENERAL' && (
              <div className="space-y-4">
                {/* GroupBox General settings */}
                <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                  <legend className="px-1 text-xs font-semibold text-slate-200">General settings</legend>
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300">History Size (samples):</label>
                      <input 
                        type="number" 
                        min="10" 
                        max="200" 
                        value={historySize}
                        onChange={(e) => setHistorySize(Number(e.target.value))}
                        className="w-20 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs text-white text-right focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300">Poll time (seconds):</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="30" 
                        value={pollTime}
                        onChange={(e) => setPollTime(Number(e.target.value))}
                        className="w-20 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs text-white text-right focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* GroupBox Visual / Themes */}
                <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                  <legend className="px-1 text-xs font-semibold text-slate-200">Visual &amp; Themes</legend>
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-300">Theme:</label>
                      <select 
                        value={localTheme}
                        onChange={(e) => setLocalTheme(e.target.value as ThemeMode)}
                        className="w-36 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs text-white focus:border-sky-500 focus:outline-none"
                      >
                        <option value="AUTOMATIC">AUTOMATIC</option>
                        <option value="DARK">DARK</option>
                        <option value="LIGHT">LIGHT</option>
                        <option value="CUSTOM">CUSTOM</option>
                      </select>
                    </div>

                    {localTheme === 'CUSTOM' && (
                      <div className="mt-3 p-2 bg-[#222222] border border-[#444444] rounded-xs grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Bar color:</span>
                          <input type="color" value={customBarColor} onChange={(e) => setCustomBarColor(e.target.value)} className="w-6 h-6 border-0 p-0 bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Text color:</span>
                          <input type="color" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} className="w-6 h-6 border-0 p-0 bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Title color:</span>
                          <input type="color" value={customTitleColor} onChange={(e) => setCustomTitleColor(e.target.value)} className="w-6 h-6 border-0 p-0 bg-transparent cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Stacked 1:</span>
                          <input type="color" value={customStacked1} onChange={(e) => setCustomStacked1(e.target.value)} className="w-6 h-6 border-0 p-0 bg-transparent cursor-pointer" />
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#444444] flex items-center justify-between text-xs text-slate-300">
                      <span>Title font:</span>
                      <span className="text-sky-400 font-semibold cursor-pointer hover:underline">Segoe UI, 8.25pt Bold</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Current value font:</span>
                      <span className="text-sky-400 font-semibold cursor-pointer hover:underline">Segoe UI, 8.25pt Bold</span>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {/* TAB 2: COUNTERS / GRAPHS */}
            {activeTab === 'COUNTERS' && (
              <div className="flex gap-3 h-full">
                {/* Left List of Counters */}
                <div className="w-44 flex flex-col">
                  <label className="text-xs font-semibold text-slate-200 mb-1">Counters:</label>
                  <div className="flex-1 bg-[#1e1e1e] border border-[#555555] rounded-xs overflow-y-auto">
                    {sortedCounterKeys.map((key) => {
                      const isSelected = key === selectedCounterKey;
                      const isEnabled = localCounters[key]?.enabled;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedCounterKey(key)}
                          className={`px-2.5 py-1.5 cursor-pointer flex items-center justify-between text-xs border-b border-[#2b2b2b] ${
                            isSelected
                              ? 'bg-[#4682B4] text-white font-bold'
                              : 'text-slate-300 hover:bg-[#333333]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {key === 'SOUNDCORE' && <Headphones className="w-3 h-3 text-sky-300" />}
                            {key}
                          </span>
                          <span className={`text-[10px] ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isEnabled ? '●' : '○'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reorder Buttons Up / Down */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => moveCounter('up')}
                      disabled={sortedCounterKeys.indexOf(selectedCounterKey) === 0}
                      className="flex-1 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed border border-[#555555] rounded-xs text-center text-xs font-bold"
                    >
                      ▲ Up
                    </button>
                    <button
                      onClick={() => moveCounter('down')}
                      disabled={sortedCounterKeys.indexOf(selectedCounterKey) === sortedCounterKeys.length - 1}
                      className="flex-1 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed border border-[#555555] rounded-xs text-center text-xs font-bold"
                    >
                      ▼ Down
                    </button>
                  </div>
                </div>

                {/* Right Settings for Selected Counter */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {/* GroupBox Main Settings */}
                  <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                    <legend className="px-1 text-xs font-semibold text-slate-200">
                      Main settings ({selectedCounterKey})
                    </legend>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Enabled:</label>
                        <input
                          type="checkbox"
                          checked={activeCounter.enabled}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: {
                                ...activeCounter,
                                enabled: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Graph type:</label>
                        <select
                          value={activeCounter.graphType}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: {
                                ...activeCounter,
                                graphType: e.target.value as any
                              }
                            });
                          }}
                          className="w-32 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-0.5 text-xs text-white"
                        >
                          <option value="SINGLE">SINGLE</option>
                          <option value="STACKED">STACKED</option>
                          <option value="MIRRORED">MIRRORED</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Separate scales:</label>
                        <input
                          type="checkbox"
                          checked={activeCounter.separateScales}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: {
                                ...activeCounter,
                                separateScales: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Invert order:</label>
                        <input
                          type="checkbox"
                          checked={activeCounter.invertOrder}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: {
                                ...activeCounter,
                                invertOrder: e.target.checked
                              }
                            });
                          }}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* GroupBox Title */}
                  <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                    <legend className="px-1 text-xs font-semibold text-slate-200">Title</legend>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Show:</label>
                        <select
                          value={activeCounter.showTitle}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: { ...activeCounter, showTitle: e.target.value as any }
                            });
                          }}
                          className="w-32 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-0.5 text-xs text-white"
                        >
                          <option value="SHOW">SHOW</option>
                          <option value="HOVER">HOVER</option>
                          <option value="HIDDEN">HIDDEN</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Position:</label>
                        <select
                          value={activeCounter.titlePosition}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: { ...activeCounter, titlePosition: e.target.value as any }
                            });
                          }}
                          className="w-32 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-0.5 text-xs text-white"
                        >
                          <option value="TOP">TOP</option>
                          <option value="MIDDLE">MIDDLE</option>
                          <option value="BOTTOM">BOTTOM</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  {/* GroupBox Current Value */}
                  <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                    <legend className="px-1 text-xs font-semibold text-slate-200">Current value</legend>
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Show:</label>
                        <select
                          value={activeCounter.showCurrentValue}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: { ...activeCounter, showCurrentValue: e.target.value as any }
                            });
                          }}
                          className="w-32 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-0.5 text-xs text-white"
                        >
                          <option value="SHOW">SHOW</option>
                          <option value="HOVER">HOVER</option>
                          <option value="HIDDEN">HIDDEN</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">Position:</label>
                        <select
                          value={activeCounter.summaryPosition}
                          onChange={(e) => {
                            setLocalCounters({
                              ...localCounters,
                              [selectedCounterKey]: { ...activeCounter, summaryPosition: e.target.value as any }
                            });
                          }}
                          className="w-32 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-0.5 text-xs text-white"
                        >
                          <option value="TOP">TOP</option>
                          <option value="MIDDLE">MIDDLE</option>
                          <option value="BOTTOM">BOTTOM</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            )}

            {/* TAB 3: SOUNDCORE BATTERY (The newly added feature tab!) */}
            {activeTab === 'SOUNDCORE' && (
              <div className="space-y-4">
                {/* GroupBox Soundcore Device & OpenSCQ30 CLI */}
                <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                  <legend className="px-1 text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" />
                    Soundcore Earbuds &amp; OpenSCQ30 CLI
                  </legend>
                  
                  <div className="space-y-2.5 mt-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-semibold">Target Device:</span>
                      <span className="text-sky-300 font-semibold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                        Anker Soundcore P40i / R60i NC
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <label className="text-slate-300 shrink-0">Bluetooth MAC Address:</label>
                      <input 
                        type="text"
                        value={localSoundcore.macAddress}
                        onChange={(e) => setLocalSoundcore({ ...localSoundcore, macAddress: e.target.value })}
                        className="flex-1 max-w-[260px] bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                        placeholder="34:09:C9:AD:A9:20"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <label className="text-slate-300 shrink-0">OpenSCQ30 Executable Path:</label>
                      <div className="flex-1 flex gap-1.5 max-w-[340px]">
                        <input 
                          type="text"
                          value={localSoundcore.exePath}
                          onChange={(e) => setLocalSoundcore({ ...localSoundcore, exePath: e.target.value })}
                          className="flex-1 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                          placeholder="F:\R60i NC Battery\openscq30.exe"
                        />
                        <button 
                          onClick={() => alert("Windows OpenFileDialog: Browse for openscq30.exe on your system.")}
                          className="px-2.5 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] border border-[#555555] rounded-xs text-xs font-medium shrink-0 flex items-center gap-1"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          Browse...
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Poll interval (seconds):</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          min="1" 
                          max="60" 
                          value={localSoundcore.pollIntervalSeconds}
                          onChange={(e) => setLocalSoundcore({ ...localSoundcore, pollIntervalSeconds: Number(e.target.value) })}
                          className="w-20 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs text-white text-right focus:border-sky-500 focus:outline-none"
                        />
                        <span className="text-[11px] text-slate-400">default: 5s</span>
                      </div>
                    </div>

                    {/* Test Connection Button */}
                    <div className="pt-2 border-t border-[#444444] flex items-center justify-between">
                      <button
                        onClick={runTestCli}
                        disabled={isTesting}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xs font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        {isTesting ? 'Testing CLI...' : 'Test Connection'}
                      </button>

                      <div className="text-[11px]">
                        Status: {batteryState.isConnected ? (
                          <span className="text-emerald-400 font-bold">Connected (L: {batteryState.leftPercent}%, R: {batteryState.rightPercent}%, C: {batteryState.casePercent}%)</span>
                        ) : (
                          <span className="text-amber-400 font-bold">Disconnected / Searching</span>
                        )}
                      </div>
                    </div>

                    {testResult && (
                      <div className="mt-2 p-2 bg-[#1b1b1b] border border-[#444444] rounded-xs font-mono text-[10.5px] whitespace-pre-wrap text-emerald-300 max-h-24 overflow-y-auto">
                        {testResult}
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* GroupBox Battery Display Settings */}
                <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                  <legend className="px-1 text-xs font-semibold text-slate-200">Battery Display Settings</legend>
                  <div className="space-y-2.5 mt-1 text-xs">
                    <div className="grid grid-cols-3 gap-2 py-1">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={localSoundcore.showLeft}
                          onChange={(e) => setLocalSoundcore({ ...localSoundcore, showLeft: e.target.checked })}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                        <span>Left Earbud (L: %)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={localSoundcore.showRight}
                          onChange={(e) => setLocalSoundcore({ ...localSoundcore, showRight: e.target.checked })}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                        <span>Right Earbud (R: %)</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={localSoundcore.showCase}
                          onChange={(e) => setLocalSoundcore({ ...localSoundcore, showCase: e.target.checked })}
                          className="w-4 h-4 accent-sky-500 cursor-pointer"
                        />
                        <span>Charging Case (C: %)</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#444444]">
                      <label className="text-slate-300">Low Battery Alert Threshold (%):</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={localSoundcore.lowBatteryThreshold}
                          onChange={(e) => setLocalSoundcore({ ...localSoundcore, lowBatteryThreshold: Number(e.target.value) })}
                          className="w-20 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-1 text-xs text-white text-right focus:border-sky-500 focus:outline-none"
                        />
                        <span className="text-[11px] text-slate-400">default: 40%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#F23C34] font-medium leading-tight">
                      * Note: Battery levels at or below {localSoundcore.lowBatteryThreshold}% will be rendered in Warning Red (#F23C34).
                    </p>
                  </div>
                </fieldset>

                {/* GroupBox Taskbar Behavior */}
                <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                  <legend className="px-1 text-xs font-semibold text-slate-200">Taskbar Behavior</legend>
                  <div className="space-y-2 mt-1 text-xs">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={localSoundcore.hideWhenDisconnected}
                        onChange={(e) => setLocalSoundcore({ ...localSoundcore, hideWhenDisconnected: e.target.checked })}
                        className="w-4 h-4 accent-sky-500 cursor-pointer"
                      />
                      <span>Hide battery percentage automatically when earbuds are disconnected</span>
                    </label>

                    <label className="flex items-center space-x-2.5 cursor-pointer text-slate-400">
                      <input 
                        type="checkbox" 
                        defaultChecked={true}
                        className="w-4 h-4 accent-sky-500 cursor-pointer"
                      />
                      <span>Hide widget automatically when a fullscreen application/game is active</span>
                    </label>
                  </div>
                </fieldset>
              </div>
            )}

            {/* TAB 4: MULTI MONITORS & POSITIONING */}
            {activeTab === 'MONITORS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-[#444444]">
                  <h3 className="font-bold text-sm text-slate-200">Multi Monitors &amp; Positioning</h3>
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enableAllTaskbars}
                      onChange={(e) => setEnableAllTaskbars(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    <span>Enable on all taskbars</span>
                  </label>
                </div>

                {/* Dual screen mockup canvas */}
                <div className="h-44 bg-[#1e1e1e] border border-[#555555] rounded-xs p-4 flex items-center justify-center gap-6">
                  <div className="w-44 h-28 bg-[#333333] border-2 border-sky-500 rounded-xs p-2 flex flex-col justify-between shadow-md">
                    <div className="flex justify-between items-center text-[10px] text-sky-400 font-bold">
                      <span>Display 1 (Primary)</span>
                      <span>1920 x 1080</span>
                    </div>
                    <div className="self-end text-[10px] bg-sky-950 text-sky-300 px-1 rounded border border-sky-600/40">
                      TaskbarMonitor [Docked]
                    </div>
                  </div>

                  <div className="w-36 h-24 bg-[#2a2a2a] border border-[#444444] rounded-xs p-2 flex flex-col justify-between opacity-75">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Display 2</span>
                      <span>1920 x 1080</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Secondary</span>
                  </div>
                </div>

                <fieldset className="border border-[#555555] rounded-xs p-3 pt-1">
                  <legend className="px-1 text-xs font-semibold text-slate-200">Options for Display 1</legend>
                  <div className="space-y-2 mt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300">Monitor Position:</label>
                      <select 
                        value={monitorPosition}
                        onChange={(e) => setMonitorPosition(e.target.value as any)}
                        className="w-32 bg-[#1e1e1e] border border-[#555555] rounded-xs px-2 py-0.5 text-xs text-white"
                      >
                        <option value="RIGHT">RIGHT</option>
                        <option value="LEFT">LEFT</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              </div>
            )}

            {/* TAB 5: ABOUT */}
            {activeTab === 'ABOUT' && (
              <div className="space-y-4 text-center py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-600 rounded-xl shadow-lg text-2xl text-white">
                  📊
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">taskbar-monitor</h2>
                  <p className="text-xs text-sky-400 font-semibold mt-0.5">Version v0.2.14 (+ Soundcore Earbuds Extension)</p>
                </div>

                <div className="max-w-md mx-auto bg-[#222222] border border-[#444444] rounded-xs p-3 text-xs text-slate-300 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original Author:</span>
                    <span className="text-white font-medium">Leandro Sales</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Feature Added:</span>
                    <span className="text-sky-300 font-medium">Soundcore P40i/R60i Battery Monitor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Fetcher:</span>
                    <span className="text-white font-medium">OpenSCQ30 Background Worker</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Environment:</span>
                    <span className="text-emerald-400 font-medium">Windows 11 Taskbar Overlay / TrayWnd</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <a 
                    href="https://github.com/leandrosa81/taskbar-monitor" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-xs font-semibold rounded-xs border border-[#555555] text-white"
                  >
                    GitHub Repository
                  </a>
                  <button 
                    onClick={() => alert("Taskbar Monitor is up to date!")}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-xs font-semibold rounded-xs text-white"
                  >
                    Check for updates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons (panelFooter in OptionForm.cs) */}
        <div className="h-12 bg-[#252526] px-4 border-t border-[#3e3e42] flex items-center justify-between shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#cccccc] hover:text-white border border-[#555555] rounded-xs text-xs font-medium transition-colors"
          >
            Reset to defaults
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOK}
              className="w-20 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded-xs text-xs font-semibold transition-colors shadow-xs"
            >
              OK
            </button>
            <button
              onClick={onClose}
              className="w-20 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#cccccc] hover:text-white border border-[#555555] rounded-xs text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="w-20 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#cccccc] hover:text-white border border-[#555555] rounded-xs text-xs font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
