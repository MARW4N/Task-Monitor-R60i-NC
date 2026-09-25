import React, { useState } from 'react';
import { AppOptions, CounterOptions, GraphTheme } from '../types/monitor';
import { DeskbandCanvas } from './DeskbandCanvas';
import { CounterData } from '../types/monitor';
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, DEFAULT_OPTIONS } from '../utils/defaults';
import { Sliders, Palette, Monitor as MonitorIcon, Cpu, RotateCcw, Download, Upload, X, Check } from 'lucide-react';

interface OptionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  options: AppOptions;
  currentTheme: GraphTheme;
  customTheme: GraphTheme;
  data: Record<string, CounterData>;
  onSave: (newOptions: AppOptions, newCustomTheme: GraphTheme) => void;
}

export const OptionFormDialog: React.FC<OptionFormDialogProps> = ({
  isOpen,
  onClose,
  options,
  currentTheme,
  customTheme,
  data,
  onSave,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'counters' | 'general' | 'theme' | 'monitors'>('counters');
  const [draftOptions, setDraftOptions] = useState<AppOptions>(JSON.parse(JSON.stringify(options)));
  const [draftTheme, setDraftTheme] = useState<GraphTheme>(JSON.parse(JSON.stringify(customTheme)));
  const [selectedCounterKey, setSelectedCounterKey] = useState<string>('CPU');

  const counterKeys = Object.keys(draftOptions.CounterOptions).sort(
    (a, b) => draftOptions.CounterOptions[a].Order - draftOptions.CounterOptions[b].Order
  );

  const selectedCounter = draftOptions.CounterOptions[selectedCounterKey];

  const updateSelectedCounter = (partial: Partial<CounterOptions>) => {
    setDraftOptions((prev) => ({
      ...prev,
      CounterOptions: {
        ...prev.CounterOptions,
        [selectedCounterKey]: {
          ...prev.CounterOptions[selectedCounterKey],
          ...partial,
        },
      },
    }));
  };

  const moveCounterOrder = (direction: 'up' | 'down') => {
    const currentIndex = counterKeys.indexOf(selectedCounterKey);
    if (direction === 'up' && currentIndex > 0) {
      const prevKey = counterKeys[currentIndex - 1];
      const curOrder = draftOptions.CounterOptions[selectedCounterKey].Order;
      const prevOrder = draftOptions.CounterOptions[prevKey].Order;

      setDraftOptions((prev) => ({
        ...prev,
        CounterOptions: {
          ...prev.CounterOptions,
          [selectedCounterKey]: { ...prev.CounterOptions[selectedCounterKey], Order: prevOrder },
          [prevKey]: { ...prev.CounterOptions[prevKey], Order: curOrder },
        },
      }));
    } else if (direction === 'down' && currentIndex < counterKeys.length - 1) {
      const nextKey = counterKeys[currentIndex + 1];
      const curOrder = draftOptions.CounterOptions[selectedCounterKey].Order;
      const nextOrder = draftOptions.CounterOptions[nextKey].Order;

      setDraftOptions((prev) => ({
        ...prev,
        CounterOptions: {
          ...prev.CounterOptions,
          [selectedCounterKey]: { ...prev.CounterOptions[selectedCounterKey], Order: nextOrder },
          [nextKey]: { ...prev.CounterOptions[nextKey], Order: curOrder },
        },
      }));
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify({ options: draftOptions, theme: draftTheme }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskbar-monitor-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.options) setDraftOptions(parsed.options);
        if (parsed.theme) setDraftTheme(parsed.theme);
      } catch (err) {
        alert('Failed to parse config file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all settings and themes to original default values?')) {
      setDraftOptions(JSON.parse(JSON.stringify(DEFAULT_OPTIONS)));
      setDraftTheme(JSON.parse(JSON.stringify(DEFAULT_DARK_THEME)));
    }
  };

  const previewTheme =
    draftOptions.ThemeType === 'LIGHT'
      ? DEFAULT_LIGHT_THEME
      : draftOptions.ThemeType === 'DARK'
      ? DEFAULT_DARK_THEME
      : draftOptions.ThemeType === 'CUSTOM'
      ? draftTheme
      : currentTheme;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#202020] text-slate-100 w-full max-w-3xl rounded-xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2b2b2b] border-b border-white/10 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              M
            </div>
            <h2 className="font-semibold text-sm tracking-wide text-white">Taskbar Monitor Settings</h2>
            <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">v5.0</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="bg-[#181818] border-b border-white/10 p-4 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider">
            Live DeskBand Preview
          </span>
          <div className="p-3 bg-[#111111] rounded-lg border border-white/10 shadow-inner flex items-center justify-center min-h-[50px] w-full overflow-x-auto">
            <DeskbandCanvas
              options={draftOptions}
              theme={previewTheme}
              data={data}
              height={32}
              previewMode={true}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#252525] px-4 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('counters')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition ${
              activeTab === 'counters'
                ? 'border-sky-500 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Cpu size={14} />
            Counters
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition ${
              activeTab === 'general'
                ? 'border-sky-500 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            General
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition ${
              activeTab === 'theme'
                ? 'border-sky-500 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette size={14} />
            Colors & Theme
          </button>
          <button
            onClick={() => setActiveTab('monitors')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition ${
              activeTab === 'monitors'
                ? 'border-sky-500 text-sky-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MonitorIcon size={14} />
            Positioning
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          {/* TAB 1: COUNTERS */}
          {activeTab === 'counters' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Counter Selector List */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-300 block mb-1">Available Counters</span>
                <div className="bg-[#181818] rounded-lg border border-white/10 overflow-hidden divide-y divide-white/5">
                  {counterKeys.map((key) => {
                    const cnt = draftOptions.CounterOptions[key];
                    const isSelected = selectedCounterKey === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedCounterKey(key)}
                        className={`flex items-center justify-between p-2.5 cursor-pointer transition ${
                          isSelected ? 'bg-sky-600/20 text-sky-400 font-semibold' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={cnt.Enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              setDraftOptions((prev) => ({
                                ...prev,
                                CounterOptions: {
                                  ...prev.CounterOptions,
                                  [key]: { ...prev.CounterOptions[key], Enabled: e.target.checked },
                                },
                              }));
                            }}
                            className="rounded bg-black/40 border-white/20 text-sky-500 focus:ring-0"
                          />
                          <span>{key}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{cnt.GraphType}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => moveCounterOrder('up')}
                    className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-center transition"
                  >
                    ▲ Move Up
                  </button>
                  <button
                    onClick={() => moveCounterOrder('down')}
                    className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-center transition"
                  >
                    ▼ Move Down
                  </button>
                </div>
              </div>

              {/* Selected Counter Config */}
              {selectedCounter && (
                <div className="md:col-span-2 space-y-4 bg-[#181818] p-4 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-semibold text-sm text-sky-400">Settings: {selectedCounterKey}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCounter.Enabled}
                        onChange={(e) => updateSelectedCounter({ Enabled: e.target.checked })}
                        className="rounded bg-black/40 border-white/20 text-sky-500"
                      />
                      <span>Enabled</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Graph Type</label>
                      <select
                        value={selectedCounter.GraphType}
                        onChange={(e) => updateSelectedCounter({ GraphType: e.target.value as any })}
                        className="w-full bg-[#252525] border border-white/10 rounded p-1.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="SINGLE">Single Bar / Graph</option>
                        <option value="STACKED">Stacked Multi-Layer</option>
                        <option value="MIRRORED">Mirrored (Dual direction)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Separate Scales</label>
                      <select
                        value={selectedCounter.SeparateScales ? 'true' : 'false'}
                        onChange={(e) => updateSelectedCounter({ SeparateScales: e.target.value === 'true' })}
                        className="w-full bg-[#252525] border border-white/10 rounded p-1.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="true">Yes (Independent Scales)</option>
                        <option value="false">No (Lock Equal Scale)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Title Display</label>
                      <select
                        value={selectedCounter.ShowTitle}
                        onChange={(e) => updateSelectedCounter({ ShowTitle: e.target.value as any })}
                        className="w-full bg-[#252525] border border-white/10 rounded p-1.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="SHOW">Always Show</option>
                        <option value="HOVER">Show on Hover</option>
                        <option value="HIDDEN">Hidden</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Title Position</label>
                      <select
                        value={selectedCounter.TitlePosition}
                        onChange={(e) => updateSelectedCounter({ TitlePosition: e.target.value as any })}
                        className="w-full bg-[#252525] border border-white/10 rounded p-1.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="TOP">Top</option>
                        <option value="MIDDLE">Middle</option>
                        <option value="BOTTOM">Bottom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Current Value Display</label>
                      <select
                        value={selectedCounter.ShowCurrentValue}
                        onChange={(e) => updateSelectedCounter({ ShowCurrentValue: e.target.value as any })}
                        className="w-full bg-[#252525] border border-white/10 rounded p-1.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="SHOW">Always Show</option>
                        <option value="HOVER">Show on Hover</option>
                        <option value="HIDDEN">Hidden</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Value Position</label>
                      <select
                        value={selectedCounter.SummaryPosition}
                        onChange={(e) => updateSelectedCounter({ SummaryPosition: e.target.value as any })}
                        className="w-full bg-[#252525] border border-white/10 rounded p-1.5 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="TOP">Top</option>
                        <option value="MIDDLE">Middle</option>
                        <option value="BOTTOM">Bottom</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-4 text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCounter.InvertOrder}
                        onChange={(e) => updateSelectedCounter({ InvertOrder: e.target.checked })}
                        className="rounded bg-black/40 border-white/20 text-sky-500"
                      />
                      <span>Invert Stack Order</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCounter.CurrentValueAsSummary}
                        onChange={(e) => updateSelectedCounter({ CurrentValueAsSummary: e.target.checked })}
                        className="rounded bg-black/40 border-white/20 text-sky-500"
                      />
                      <span>Show Summary String</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCounter.ShowTitleShadowOnHover}
                        onChange={(e) => updateSelectedCounter({ ShowTitleShadowOnHover: e.target.checked })}
                        className="rounded bg-black/40 border-white/20 text-sky-500"
                      />
                      <span>Title Text Shadow</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-2">
                <label className="block font-semibold text-slate-200">Theme Mode</label>
                <select
                  value={draftOptions.ThemeType}
                  onChange={(e) => setDraftOptions({ ...draftOptions, ThemeType: e.target.value as any })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="AUTOMATIC">Automatic (Adapts to Windows Dark/Light mode)</option>
                  <option value="DARK">Dark Theme (High-contrast cyan & neon)</option>
                  <option value="LIGHT">Light Theme (Classic magenta & azure)</option>
                  <option value="CUSTOM">Custom Theme (Configured in Colors tab)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Automatic inspects system color preferences to match your taskbar aesthetics.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-200">Update Polling Interval</label>
                  <span className="font-mono text-sky-400 font-bold">{draftOptions.PollTime} second(s)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={draftOptions.PollTime}
                  onChange={(e) => setDraftOptions({ ...draftOptions, PollTime: parseInt(e.target.value, 10) })}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1s (High fidelity)</span>
                  <span>3s (Balanced)</span>
                  <span>5s (Eco)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-200">History Buffer Width</label>
                  <span className="font-mono text-sky-400 font-bold">{draftOptions.HistorySize} samples</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={draftOptions.HistorySize}
                  onChange={(e) => setDraftOptions({ ...draftOptions, HistorySize: parseInt(e.target.value, 10) })}
                  className="w-full accent-sky-500"
                />
                <p className="text-[11px] text-slate-400">
                  Sets the horizontal width in pixels of each monitor graph slot on the taskbar.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: THEME COLORS */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Custom Theme Palette</span>
                  <p className="text-[11px] text-slate-400">
                    Customize individual bar, text, and gradient colors. Make sure Theme Mode is set to Custom.
                  </p>
                </div>
                {draftOptions.ThemeType !== 'CUSTOM' && (
                  <button
                    onClick={() => setDraftOptions({ ...draftOptions, ThemeType: 'CUSTOM' })}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium transition"
                  >
                    Switch to Custom Mode
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Bar Color */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/10 space-y-2">
                  <label className="block text-slate-300 font-medium">Instant Bar Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draftTheme.BarColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, BarColor: e.target.value })}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draftTheme.BarColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, BarColor: e.target.value })}
                      className="flex-1 bg-[#252525] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/10 space-y-2">
                  <label className="block text-slate-300 font-medium">Value Text Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draftTheme.TextColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TextColor: e.target.value })}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draftTheme.TextColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TextColor: e.target.value })}
                      className="flex-1 bg-[#252525] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Text Shadow */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/10 space-y-2">
                  <label className="block text-slate-300 font-medium">Text Shadow Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draftTheme.TextShadowColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TextShadowColor: e.target.value })}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draftTheme.TextShadowColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TextShadowColor: e.target.value })}
                      className="flex-1 bg-[#252525] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Title Color */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/10 space-y-2">
                  <label className="block text-slate-300 font-medium">Title Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draftTheme.TitleColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TitleColor: e.target.value })}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draftTheme.TitleColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TitleColor: e.target.value })}
                      className="flex-1 bg-[#252525] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Title Shadow */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/10 space-y-2">
                  <label className="block text-slate-300 font-medium">Title Shadow Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draftTheme.TitleShadowColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TitleShadowColor: e.target.value })}
                      className="w-10 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={draftTheme.TitleShadowColor}
                      onChange={(e) => setDraftTheme({ ...draftTheme, TitleShadowColor: e.target.value })}
                      className="flex-1 bg-[#252525] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Stacked Gradient Stops */}
                <div className="bg-[#181818] p-3 rounded-lg border border-white/10 space-y-2">
                  <label className="block text-slate-300 font-medium">Stacked Gradient (From / To)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftTheme.StackedColors[0] || '#25548E'}
                      onChange={(e) => {
                        const newColors = [...draftTheme.StackedColors];
                        newColors[0] = e.target.value;
                        setDraftTheme({ ...draftTheme, StackedColors: newColors });
                      }}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-slate-400">→</span>
                    <input
                      type="color"
                      value={draftTheme.StackedColors[draftTheme.StackedColors.length - 1] || '#4190F2'}
                      onChange={(e) => {
                        const newColors = [...draftTheme.StackedColors];
                        newColors[newColors.length - 1] = e.target.value;
                        setDraftTheme({ ...draftTheme, StackedColors: newColors });
                      }}
                      className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POSITIONING */}
          {activeTab === 'monitors' && (
            <div className="space-y-4 max-w-xl">
              <span className="font-semibold text-slate-200 block">Taskbar Positioning</span>
              <p className="text-[11px] text-slate-400">
                In multi-monitor setups, choose which monitors show the TaskbarMonitor Deskband and position relative to the taskbar notification area.
              </p>

              <div className="p-4 bg-[#181818] rounded-lg border border-white/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftOptions.EnableOnAllMonitors}
                    onChange={(e) => setDraftOptions({ ...draftOptions, EnableOnAllMonitors: e.target.checked })}
                    className="rounded bg-black/40 border-white/20 text-sky-500"
                  />
                  <div>
                    <span className="font-medium text-white block">Enable on all monitors</span>
                    <span className="text-[11px] text-slate-400">Automatically clones the deskband to secondary displays</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#252525] border-t border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
            >
              <RotateCcw size={14} />
              Defaults
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition"
            >
              <Download size={14} />
              Export
            </button>
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded cursor-pointer transition">
              <Upload size={14} />
              Import
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(draftOptions, draftTheme);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-600/20 transition"
            >
              <Check size={14} />
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
