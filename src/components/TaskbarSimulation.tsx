import React, { useState } from 'react';
import { 
  Wifi, 
  Volume2, 
  Battery, 
  ChevronUp, 
  Headphones,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Activity,
  RotateCcw,
  X,
  Minus,
  Square,
  Cpu,
  HardDrive
} from 'lucide-react';
import { SoundcoreBatteryState, SoundcoreConfig, CounterOption, ThemeMode } from '../types/monitor';
import { isLowBattery } from '../utils/soundcore';

interface TaskbarSimulationProps {
  batteryState: SoundcoreBatteryState;
  soundcoreConfig: SoundcoreConfig;
  themeMode: ThemeMode;
  counters: Record<string, CounterOption>;
  historyData: {
    cpu: number[];
    ram: number[];
    disk: number[];
    net: number[];
    gpu: number[];
  };
  onOpenSettings: () => void;
}

export const TaskbarSimulation: React.FC<TaskbarSimulationProps> = ({
  batteryState,
  soundcoreConfig,
  themeMode,
  counters,
  historyData,
  onOpenSettings
}) => {
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showTaskManager, setShowTaskManager] = useState<boolean>(false);
  const [isWidgetRunning, setIsWidgetRunning] = useState<boolean>(true);

  const isDark = themeMode === 'DARK' || themeMode === 'AUTOMATIC';
  const textColor = isDark ? '#ffffff' : '#0f172a';
  const textShadowColor = isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
  const lowColor = '#F23C34'; // exact low battery color: #F23C34

  // Check if soundcore is visible
  const isSoundcoreVisible = 
    counters['SOUNDCORE']?.enabled && 
    (!soundcoreConfig.hideWhenDisconnected || batteryState.isConnected);

  // Soundcore battery low checks
  const isLeftLow = isLowBattery(batteryState.leftPercent, soundcoreConfig.lowBatteryThreshold);
  const isRightLow = isLowBattery(batteryState.rightPercent, soundcoreConfig.lowBatteryThreshold);
  const isCaseLow = isLowBattery(batteryState.casePercent, soundcoreConfig.lowBatteryThreshold);

  // Time display
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });

  // Sorted active counters
  const activeCounters = Object.entries(counters)
    .filter(([_, opt]) => opt.enabled)
    .sort(([_, a], [__, b]) => a.order - b.order);

  // Handle right-click on the taskbar widget to show authentic context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPos({
      x: Math.max(10, rect.left - 40),
      y: rect.top - 140
    });
  };

  const closeContextMenu = () => {
    setContextMenuPos(null);
  };

  // Helper to render mini performance graph
  const renderGraph = (data: number[], label: string, currentVal: string, color: string) => {
    const width = 44;
    const height = 28;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1 || 1)) * width;
      const y = height - (val / 100) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const areaPoints = `${points} ${width},${height} 0,${height}`;

    return (
      <div 
        key={label}
        className="group relative flex flex-col justify-end items-center h-8 w-11 cursor-pointer select-none px-0.5"
        title={`${label}: ${currentVal}`}
      >
        <svg className="w-full h-7 overflow-visible">
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.75" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill={`url(#grad-${label})`} />
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" />
        </svg>

        {/* Text Overlay (TaskbarMonitor style) */}
        <div 
          className="absolute inset-0 flex flex-col justify-between items-center py-0.5 pointer-events-none text-[8.5px] font-semibold leading-none tracking-tight"
          style={{ textShadow: `1px 1px 1px ${textShadowColor}` }}
        >
          <span className="opacity-90">{label}</span>
          <span className="font-mono text-[8px]">{currentVal}</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={closeContextMenu}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900/90 flex flex-col"
    >
      {/* Windows 11 Desktop Screen Mockup */}
      <div className="relative h-64 md:h-72 w-full overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 flex flex-col justify-between p-4">
        {/* Abstract Windows 11 Flow Wallpaper */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-600/20 rounded-full blur-2xl" />
        </div>

        {/* Desktop Header / Status Banner */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-md">
            <Laptop className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-medium text-slate-200">Windows 11 Taskbar Monitor (Native C# / Win32)</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="text-xs text-slate-400">Earbuds State:</span>
            {batteryState.isConnected ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected ({batteryState.leftPercent}% / {batteryState.rightPercent}% / {batteryState.casePercent}%)
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Disconnected
              </span>
            )}
          </div>
        </div>

        {/* Center Desktop Note or Task Manager Window */}
        {!showTaskManager ? (
          <div className="relative z-10 self-center text-center bg-slate-950/70 backdrop-blur-md px-5 py-3 rounded-xl border border-slate-700/60 shadow-xl max-w-lg">
            <div className="flex items-center justify-center space-x-2 text-sky-300 font-semibold text-xs mb-1">
              <Headphones className="w-4 h-4 text-sky-400" />
              <span>Soundcore P40i / R60i Battery Monitored in Taskbar</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Right-click or click the Taskbar Monitor widget on the taskbar below to open the <strong className="text-white">OptionForm</strong> (Settings) or open <strong className="text-white">Task Manager</strong>.
            </p>
          </div>
        ) : (
          /* Simulated Windows 11 Task Manager Window */
          <div className="relative z-20 self-center w-full max-w-md bg-[#1f1f1f] text-slate-200 border border-[#3e3e42] rounded-lg shadow-2xl overflow-hidden text-xs">
            <div className="h-7 bg-[#2d2d30] px-3 flex items-center justify-between border-b border-[#3e3e42]">
              <span className="font-semibold text-[11px]">Task Manager - Performance</span>
              <button 
                onClick={() => setShowTaskManager(false)}
                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 bg-[#191919]">
              <div className="p-2 bg-[#252526] rounded border border-white/5">
                <div className="flex justify-between text-[10px] text-sky-400">
                  <span>CPU (Task Manager)</span>
                  <span>{Math.round(historyData.cpu[historyData.cpu.length - 1] || 0)}%</span>
                </div>
                <div className="h-8 flex items-end gap-0.5 mt-1">
                  {historyData.cpu.slice(-15).map((v, i) => (
                    <div key={i} className="flex-1 bg-sky-500/80 rounded-t" style={{ height: `${Math.max(10, v)}%` }} />
                  ))}
                </div>
              </div>

              <div className="p-2 bg-[#252526] rounded border border-white/5">
                <div className="flex justify-between text-[10px] text-purple-400">
                  <span>Memory</span>
                  <span>{((historyData.ram[historyData.ram.length - 1] || 0) * 0.32).toFixed(1)} / 32 GB</span>
                </div>
                <div className="h-8 flex items-end gap-0.5 mt-1">
                  {historyData.ram.slice(-15).map((v, i) => (
                    <div key={i} className="flex-1 bg-purple-500/80 rounded-t" style={{ height: `${Math.max(10, v)}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Windows 11 Taskbar Bar */}
      <div 
        className={`relative z-20 w-full h-12 px-3 flex items-center justify-between border-t transition-colors duration-300 ${
          isDark 
            ? 'bg-slate-950/95 border-slate-800 text-white backdrop-blur-xl' 
            : 'bg-slate-100/95 border-slate-300 text-slate-800 backdrop-blur-xl'
        }`}
      >
        {/* Left spacing for Windows 11 widgets button */}
        <div className="flex items-center space-x-3 w-28">
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded hover:bg-white/10 cursor-pointer text-xs">
            <span className="text-base leading-none">🌤️</span>
            <div className="flex flex-col text-[10px] leading-tight">
              <span className="font-semibold">72°F</span>
              <span className="opacity-70">Sunny</span>
            </div>
          </div>
        </div>

        {/* Center: Windows 11 App Icons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Windows Start Button */}
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-sky-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
              <path d="M0 2.25L6.5 1.3v6.2H0V2.25zm7.3-1.42L16 0v7.5H7.3V.83zm8.7 7.47V16l-8.7-.83V8.3H16zm-9.5.73v6.14L0 14.3V9.03h6.5z" />
            </svg>
          </button>
          
          {/* Search Icon */}
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-slate-300 text-xs">
            🔍
          </button>
          
          {/* Task View */}
          <button className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-slate-300">
            <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
          </button>

          {/* Pinned apps */}
          <div className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-amber-400 text-sm cursor-pointer">
            📁
          </div>
          <div className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-blue-400 text-sm cursor-pointer">
            🌐
          </div>
          <div className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-violet-400 text-sm cursor-pointer">
            💻
          </div>
          <div 
            onClick={() => setShowTaskManager(!showTaskManager)}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white/10 text-emerald-400 text-sm cursor-pointer"
            title="Task Manager"
          >
            📊
          </div>
        </div>

        {/* Right side: Taskbar Monitor + System Tray */}
        <div className="flex items-center space-x-2">
          {/* THE TASKBAR MONITOR DOCKED WIDGET */}
          {isWidgetRunning ? (
            <div 
              onClick={onOpenSettings}
              onContextMenu={handleContextMenu}
              className="group relative flex items-center px-2 py-0.5 rounded-lg border border-sky-500/50 bg-sky-950/30 hover:bg-sky-900/40 hover:border-sky-400 transition-all cursor-pointer shadow-inner"
              title="TaskbarMonitor (Click or Right-Click for Options)"
            >
              <div className="flex items-center space-x-1.5 h-8">
                {activeCounters.map(([name]) => {
                  if (name === 'CPU') {
                    const lastVal = historyData.cpu[historyData.cpu.length - 1] || 0;
                    return renderGraph(historyData.cpu, 'CPU', `${Math.round(lastVal)}%`, '#38bdf8');
                  }
                  if (name === 'MEM') {
                    const lastVal = historyData.ram[historyData.ram.length - 1] || 0;
                    const gbVal = ((lastVal / 100) * 32).toFixed(1);
                    return renderGraph(historyData.ram, 'MEM', `${gbVal}G`, '#a855f7');
                  }
                  if (name === 'DISK') {
                    const lastVal = historyData.disk[historyData.disk.length - 1] || 0;
                    return renderGraph(historyData.disk, 'DISK', `${Math.round(lastVal)}%`, '#22c55e');
                  }
                  if (name === 'NET') {
                    const lastVal = historyData.net[historyData.net.length - 1] || 0;
                    return renderGraph(historyData.net, 'NET', `${Math.round(lastVal * 2.5)}K`, '#f59e0b');
                  }
                  if (name === 'GPU 3D') {
                    const lastVal = historyData.gpu[historyData.gpu.length - 1] || 0;
                    return renderGraph(historyData.gpu, 'GPU', `${Math.round(lastVal)}%`, '#ec4899');
                  }

                  // SOUNDCORE COUNTER COMPONENT
                  if (name === 'SOUNDCORE' && isSoundcoreVisible) {
                    return (
                      <div 
                        key="SOUNDCORE"
                        className="flex items-center px-1.5 py-0.5 rounded bg-black/40 border border-white/10 select-none whitespace-nowrap text-xs font-bold tracking-wide"
                        style={{ 
                          fontFamily: "'Segoe UI', sans-serif",
                          color: textColor,
                          textShadow: `1px 1px 1px ${textShadowColor}` 
                        }}
                      >
                        {batteryState.isConnected ? (
                          <div className="flex items-center space-x-1">
                            {soundcoreConfig.showLeft && (
                              <span className="flex items-center space-x-0.5">
                                <span className="opacity-80">L:</span>
                                <span style={{ color: isLeftLow ? lowColor : textColor }}>
                                  {batteryState.leftPercent}%
                                </span>
                              </span>
                            )}

                            {soundcoreConfig.showLeft && soundcoreConfig.showRight && (
                              <span className="opacity-40">|</span>
                            )}

                            {soundcoreConfig.showRight && (
                              <span className="flex items-center space-x-0.5">
                                <span className="opacity-80">R:</span>
                                <span style={{ color: isRightLow ? lowColor : textColor }}>
                                  {batteryState.rightPercent}%
                                </span>
                              </span>
                            )}

                            {((soundcoreConfig.showLeft || soundcoreConfig.showRight) && soundcoreConfig.showCase) && (
                              <span className="opacity-40">|</span>
                            )}

                            {soundcoreConfig.showCase && (
                              <span className="flex items-center space-x-0.5">
                                <span className="opacity-80">C:</span>
                                <span style={{ color: isCaseLow ? lowColor : textColor }}>
                                  {batteryState.casePercent}%
                                </span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Soundcore: ?
                          </span>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Hover Indicator tooltip badge */}
              <div className="absolute -top-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-sky-300 text-[10px] px-2 py-0.5 rounded border border-sky-500/50 shadow whitespace-nowrap">
                Click or Right-Click for Options
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsWidgetRunning(true)}
              className="text-[11px] text-sky-400 hover:underline px-2 py-1"
            >
              Start TaskbarMonitor
            </button>
          )}

          {/* Standard Windows 11 System Tray Icons */}
          <div className="flex items-center space-x-1 pl-1">
            <button className="p-1 rounded hover:bg-white/10 text-slate-300">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center space-x-1.5 px-1.5 py-1 rounded hover:bg-white/10 cursor-pointer">
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>

            {/* Clock & Date */}
            <div className="flex flex-col items-end px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer text-right text-[11px] font-medium leading-tight">
              <span>{timeStr}</span>
              <span className="text-[10px] opacity-75">{dateStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authentic Windows 11 Context Menu */}
      {contextMenuPos && (
        <div 
          className="fixed z-50 w-48 bg-[#1f1f1f]/95 backdrop-blur-md text-slate-200 border border-[#3e3e42] rounded-md shadow-2xl py-1 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              closeContextMenu();
              onOpenSettings();
            }}
            className="w-full px-3 py-1.5 flex items-center space-x-2.5 hover:bg-[#333333] hover:text-white transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span>Options...</span>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setShowTaskManager(true);
            }}
            className="w-full px-3 py-1.5 flex items-center space-x-2.5 hover:bg-[#333333] hover:text-white transition-colors text-left"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Task Manager</span>
          </button>

          <div className="my-1 border-t border-[#3e3e42]" />

          <button
            onClick={() => {
              closeContextMenu();
              setIsWidgetRunning(false);
              setTimeout(() => setIsWidgetRunning(true), 300);
            }}
            className="w-full px-3 py-1.5 flex items-center space-x-2.5 hover:bg-[#333333] hover:text-white transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Restart Monitor</span>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setIsWidgetRunning(false);
            }}
            className="w-full px-3 py-1.5 flex items-center space-x-2.5 hover:bg-red-900/60 hover:text-white text-rose-300 transition-colors text-left"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Exit TaskbarMonitor</span>
          </button>
        </div>
      )}
    </div>
  );
};
