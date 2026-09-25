import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Headphones, 
  Settings as SettingsIcon, 
  Terminal, 
  Download, 
  Layers, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sliders,
  Code
} from 'lucide-react';
import { TaskbarSimulation } from './components/TaskbarSimulation';
import { SoundcoreTester } from './components/SoundcoreTester';
import { TaskbarMonitorSettings } from './components/TaskbarMonitorSettings';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { ArchitectureComparison } from './components/ArchitectureComparison';
import { InstallGuide } from './components/InstallGuide';
import { 
  SoundcoreBatteryState, 
  SoundcoreConfig, 
  CounterOption, 
  ThemeMode 
} from './types/monitor';

export const App: React.FC = () => {
  // State for Soundcore battery
  const [batteryState, setBatteryState] = useState<SoundcoreBatteryState>({
    isConnected: true,
    leftPercent: 90,
    rightPercent: 80,
    casePercent: 60,
    leftRaw: '8/5',
    rightRaw: '7/5',
    caseRaw: '5/5',
    lastUpdated: new Date()
  });

  // Soundcore configuration options
  const [soundcoreConfig, setSoundcoreConfig] = useState<SoundcoreConfig>({
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

  // Theme mode
  const [themeMode, setThemeMode] = useState<ThemeMode>('AUTOMATIC');

  // Counters configuration matching TaskbarMonitor Options.cs
  const [counters, setCounters] = useState<Record<string, CounterOption>>({
    'CPU': {
      enabled: true,
      order: 0,
      graphType: 'STACKED',
      showTitle: 'HOVER',
      titlePosition: 'MIDDLE',
      showCurrentValue: 'SHOW',
      summaryPosition: 'TOP',
      currentValueAsSummary: true,
      separateScales: true,
      invertOrder: false
    },
    'MEM': {
      enabled: true,
      order: 1,
      graphType: 'SINGLE',
      showTitle: 'HOVER',
      titlePosition: 'MIDDLE',
      showCurrentValue: 'SHOW',
      summaryPosition: 'TOP',
      currentValueAsSummary: true,
      separateScales: true,
      invertOrder: false
    },
    'DISK': {
      enabled: true,
      order: 2,
      graphType: 'STACKED',
      showTitle: 'HOVER',
      titlePosition: 'MIDDLE',
      showCurrentValue: 'SHOW',
      summaryPosition: 'TOP',
      currentValueAsSummary: true,
      separateScales: true,
      invertOrder: false
    },
    'NET': {
      enabled: true,
      order: 3,
      graphType: 'STACKED',
      showTitle: 'HOVER',
      titlePosition: 'MIDDLE',
      showCurrentValue: 'SHOW',
      summaryPosition: 'TOP',
      currentValueAsSummary: true,
      separateScales: true,
      invertOrder: false
    },
    'GPU 3D': {
      enabled: true,
      order: 4,
      graphType: 'SINGLE',
      showTitle: 'HOVER',
      titlePosition: 'MIDDLE',
      showCurrentValue: 'SHOW',
      summaryPosition: 'TOP',
      currentValueAsSummary: true,
      separateScales: true,
      invertOrder: false
    },
    'SOUNDCORE': {
      enabled: true,
      order: 5,
      graphType: 'SINGLE',
      showTitle: 'HOVER',
      titlePosition: 'MIDDLE',
      showCurrentValue: 'SHOW',
      summaryPosition: 'TOP',
      currentValueAsSummary: true,
      separateScales: true,
      invertOrder: false
    }
  });

  // Simulated live performance history for graphs
  const [historyData, setHistoryData] = useState({
    cpu: [24, 28, 35, 42, 38, 45, 52, 40, 36, 44, 50, 48, 42, 39, 45, 50, 56, 49, 43, 46],
    ram: [54, 54, 55, 55, 56, 56, 57, 57, 56, 56, 57, 58, 58, 57, 58, 58, 59, 58, 58, 59],
    disk: [5, 2, 8, 32, 12, 4, 18, 9, 3, 45, 20, 6, 2, 14, 8, 3, 11, 4, 2, 6],
    net: [12, 18, 45, 60, 32, 15, 22, 80, 95, 40, 25, 18, 30, 22, 15, 40, 65, 30, 20, 25],
    gpu: [14, 16, 20, 25, 22, 28, 34, 30, 25, 32, 38, 35, 29, 26, 31, 35, 42, 38, 30, 33]
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'preview' | 'code' | 'install' | 'architecture'>('preview');

  // Real-time graph polling simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHistoryData(prev => {
        const jitter = (base: number, range: number, min = 2, max = 98) => {
          const delta = (Math.random() - 0.5) * range;
          return Math.min(max, Math.max(min, base + delta));
        };

        const nextCpu = jitter(prev.cpu[prev.cpu.length - 1], 14);
        const nextRam = jitter(prev.ram[prev.ram.length - 1], 2, 50, 65);
        const nextDisk = Math.random() > 0.7 ? jitter(prev.disk[prev.disk.length - 1], 30) : jitter(6, 6);
        const nextNet = jitter(prev.net[prev.net.length - 1], 25);
        const nextGpu = jitter(prev.gpu[prev.gpu.length - 1], 10);

        return {
          cpu: [...prev.cpu.slice(1), nextCpu],
          ram: [...prev.ram.slice(1), nextRam],
          disk: [...prev.disk.slice(1), nextDisk],
          net: [...prev.net.slice(1), nextNet],
          gpu: [...prev.gpu.slice(1), nextGpu]
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Navbar */}
      <header className="border-b border-slate-800/90 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  TaskbarMonitor + Soundcore Battery
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  P40i / R60i NC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Integrated Windows 11 taskbar performance & earbuds battery widget
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setCurrentView('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currentView === 'preview'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Taskbar Preview</span>
              </button>

              <button
                onClick={() => setCurrentView('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currentView === 'code'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>C# Solution Code</span>
              </button>

              <button
                onClick={() => setCurrentView('install')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currentView === 'install'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install on PC</span>
              </button>

              <button
                onClick={() => setCurrentView('architecture')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currentView === 'architecture'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </button>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden items-center justify-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full">
          <button
            onClick={() => setCurrentView('preview')}
            className={`flex-1 py-1.5 rounded-lg font-medium text-center ${
              currentView === 'preview' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setCurrentView('code')}
            className={`flex-1 py-1.5 rounded-lg font-medium text-center ${
              currentView === 'code' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            C# Code
          </button>
          <button
            onClick={() => setCurrentView('architecture')}
            className={`flex-1 py-1.5 rounded-lg font-medium text-center ${
              currentView === 'architecture' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            Architecture
          </button>
        </div>

        {/* View 1: Interactive Windows 11 Taskbar Simulation */}
        {currentView === 'preview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Windows 11 Simulation Viewport */}
            <TaskbarSimulation
              batteryState={batteryState}
              soundcoreConfig={soundcoreConfig}
              themeMode={themeMode}
              counters={counters}
              historyData={historyData}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Soundcore Tester & OpenSCQ30 Simulator */}
            <SoundcoreTester
              batteryState={batteryState}
              soundcoreConfig={soundcoreConfig}
              onUpdateBattery={(partial) => setBatteryState(prev => ({ ...prev, ...partial }))}
              onUpdateConfig={(partial) => setSoundcoreConfig(prev => ({ ...prev, ...partial }))}
            />

            {/* Quick Action Info Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Native Win32 Integration</span>
                </div>
                <p className="text-[11.5px] text-slate-400">
                  Added as a native <code className="text-sky-300">CounterSoundcore</code> in C# that renders right inside <code className="text-sky-300">SystemWatcherControl</code>.
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Low Battery Alert (&le; 40%)</span>
                </div>
                <p className="text-[11.5px] text-slate-400">
                  Battery levels &le; 40% immediately turn crimson red (<code className="text-rose-300">#F23C34</code>) matching your Rust specification.
                </p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Auto-Hide on Disconnect</span>
                </div>
                <p className="text-[11.5px] text-slate-400">
                  When earbuds disconnect or CLI returns <code className="text-emerald-300">?</code>, the widget cleanly collapses without leaving blank space.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 2: C# Solution Code Inspector */}
        {currentView === 'code' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SourceCodeViewer />
          </div>
        )}

        {/* View 3: Install & Deployment Guide */}
        {currentView === 'install' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <InstallGuide />
          </div>
        )}

        {/* View 4: Architecture & Technical Guide */}
        {currentView === 'architecture' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ArchitectureComparison />
            <SourceCodeViewer />
          </div>
        )}
      </main>

      {/* Taskbar Monitor Settings Modal */}
      <TaskbarMonitorSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        counters={counters}
        soundcoreConfig={soundcoreConfig}
        themeMode={themeMode}
        batteryState={batteryState}
        onUpdateCounters={setCounters}
        onUpdateSoundcoreConfig={setSoundcoreConfig}
        onUpdateThemeMode={setThemeMode}
      />
    </div>
  );
};
