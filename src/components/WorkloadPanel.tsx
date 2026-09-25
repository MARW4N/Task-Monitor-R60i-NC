import React from 'react';
import { TelemetryEngine } from '../services/telemetryEngine';
import { Zap, Flame, HardDrive, DownloadCloud, Monitor, Settings, Sliders, ExternalLink, RefreshCw } from 'lucide-react';

interface WorkloadPanelProps {
  engine: TelemetryEngine;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenTaskManager: () => void;
  taskbarStyle: 'win11' | 'win10';
  onToggleTaskbarStyle: (style: 'win11' | 'win10') => void;
  isFloatingDeskband: boolean;
  onToggleFloating: () => void;
}

export const WorkloadPanel: React.FC<WorkloadPanelProps> = ({
  engine,
  onRefresh,
  onOpenSettings,
  onOpenTaskManager,
  taskbarStyle,
  onToggleTaskbarStyle,
  isFloatingDeskband,
  onToggleFloating,
}) => {
  return (
    <div className="bg-[#1e1e1e]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl text-xs space-y-4 max-w-sm">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <h3 className="font-semibold text-white tracking-wide">Telemetry & Controls</h3>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
          Live Realtime
        </span>
      </div>

      {/* Hardware Load Injections */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Simulate Workload Spikes
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              engine.isCpuStress = !engine.isCpuStress;
              onRefresh();
            }}
            className={`p-2 rounded-lg border flex items-center gap-2 font-medium transition ${
              engine.isCpuStress
                ? 'bg-rose-600/30 border-rose-500/50 text-rose-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Flame size={14} className={engine.isCpuStress ? 'animate-pulse text-rose-400' : 'text-slate-400'} />
            <span>Stress CPU</span>
          </button>

          <button
            onClick={() => {
              engine.isDiskStress = !engine.isDiskStress;
              onRefresh();
            }}
            className={`p-2 rounded-lg border flex items-center gap-2 font-medium transition ${
              engine.isDiskStress
                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <HardDrive size={14} className={engine.isDiskStress ? 'animate-bounce text-emerald-400' : 'text-slate-400'} />
            <span>Disk Transfer</span>
          </button>

          <button
            onClick={() => {
              engine.isNetStress = !engine.isNetStress;
              onRefresh();
            }}
            className={`p-2 rounded-lg border flex items-center gap-2 font-medium transition ${
              engine.isNetStress
                ? 'bg-amber-600/30 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <DownloadCloud size={14} className={engine.isNetStress ? 'animate-pulse text-amber-400' : 'text-slate-400'} />
            <span>Net Download</span>
          </button>

          <button
            onClick={() => {
              engine.isGpuStress = !engine.isGpuStress;
              onRefresh();
            }}
            className={`p-2 rounded-lg border flex items-center gap-2 font-medium transition ${
              engine.isGpuStress
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sliders size={14} className={engine.isGpuStress ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            <span>3D GPU Load</span>
          </button>
        </div>
      </div>

      {/* Taskbar & Widget Configuration */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Environment & Display
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleTaskbarStyle('win11')}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium transition ${
              taskbarStyle === 'win11'
                ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Windows 11
          </button>
          <button
            onClick={() => onToggleTaskbarStyle('win10')}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium transition ${
              taskbarStyle === 'win10'
                ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Windows 10
          </button>
        </div>

        <button
          onClick={onToggleFloating}
          className={`w-full py-1.5 px-3 rounded-lg border flex items-center justify-between font-medium transition ${
            isFloatingDeskband
              ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <span>Floating Desktop Widget</span>
          <span className="text-[10px] uppercase font-mono">{isFloatingDeskband ? 'Enabled' : 'Docked'}</span>
        </button>
      </div>

      {/* Quick Launch Buttons */}
      <div className="pt-2 border-t border-white/10 flex gap-2">
        <button
          onClick={onOpenSettings}
          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 text-slate-200 transition"
        >
          <Settings size={14} />
          <span>DeskBand Settings</span>
        </button>
        <button
          onClick={onOpenTaskManager}
          className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-1.5 text-slate-200 transition"
          title="Open Task Manager"
        >
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
};
