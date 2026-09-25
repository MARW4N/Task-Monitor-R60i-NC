import React from 'react';
import { Layers, ShieldCheck, Cpu, ArrowRight, Zap, CheckCircle, XCircle } from 'lucide-react';

export const ArchitectureComparison: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
        <Layers className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-sm font-semibold text-white">
            Architecture Upgrade: Separate Overlay vs. Native TaskbarMonitor
          </h3>
          <p className="text-xs text-slate-400">
            Why inserting the Soundcore battery code directly into TaskbarMonitor solves previous taskbar issues
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Previous Solution */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-red-900/30 space-y-2.5">
          <div className="flex items-center space-x-2 text-red-400 font-semibold">
            <XCircle className="w-4 h-4" />
            <span>Previous: Standalone Rust Overlay Window</span>
          </div>
          <p className="text-slate-400 text-[11.5px] leading-relaxed">
            Used a floating transparent topmost Win32 window (`WS_EX_LAYERED` + `LWA_COLORKEY`) positioned with static coordinate offsets (`Shell_TrayWnd - 665px`).
          </p>
          <ul className="space-y-1.5 text-slate-400 text-[11px]">
            <li className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span>Coordinates desync whenever tray icons appear, disappear, or taskbar resizes</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span>Potential flickering over taskbar during window transitions or explorer redraws</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span>Requires separate process running in background alongside TaskbarMonitor</span>
            </li>
          </ul>
        </div>

        {/* New Solution */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-900/30 space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Now: Native TaskbarMonitor Integrated Counter</span>
          </div>
          <p className="text-slate-300 text-[11.5px] leading-relaxed">
            Embedded directly as a first-class `ICounter` (`CounterSoundcore`) inside `SystemWatcherControl`, docked adjacent to the Task Manager CPU/RAM/Disk performance graphs.
          </p>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Perfect automatic positioning with taskbar tray, multi-monitor support, & DPI awareness</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Zero flicker — rendered on the same GDI+ double-buffered canvas as CPU/RAM graphs</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Single unified process with full settings GUI (change MAC, polling, order)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
