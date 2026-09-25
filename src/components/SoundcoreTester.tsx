import React, { useState } from 'react';
import { 
  Headphones, 
  BatteryCharging, 
  Terminal, 
  Sliders, 
  Zap, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { SoundcoreBatteryState, SoundcoreConfig } from '../types/monitor';
import { isLowBattery, generateOpenSCQ30Json } from '../utils/soundcore';

interface SoundcoreTesterProps {
  batteryState: SoundcoreBatteryState;
  soundcoreConfig: SoundcoreConfig;
  onUpdateBattery: (partial: Partial<SoundcoreBatteryState>) => void;
  onUpdateConfig: (partial: Partial<SoundcoreConfig>) => void;
}

export const SoundcoreTester: React.FC<SoundcoreTesterProps> = ({
  batteryState,
  soundcoreConfig,
  onUpdateBattery,
  onUpdateConfig
}) => {
  const [showCliLogs, setShowCliLogs] = useState(false);

  // Quick Presets
  const setPreset = (l: number, r: number, c: number, connected = true) => {
    // Map to Soundcore fraction
    const toFraction = (val: number) => {
      if (!connected) return '?';
      const step = Math.round(val / 10);
      return `${Math.min(9, Math.max(0, step - 1))}/5`;
    };

    onUpdateBattery({
      isConnected: connected,
      leftPercent: connected ? l : -1,
      rightPercent: connected ? r : -1,
      casePercent: connected ? c : -1,
      leftRaw: toFraction(l),
      rightRaw: toFraction(r),
      caseRaw: toFraction(c),
      lastUpdated: new Date()
    });
  };

  const isLeftLow = isLowBattery(batteryState.leftPercent, soundcoreConfig.lowBatteryThreshold);
  const isRightLow = isLowBattery(batteryState.rightPercent, soundcoreConfig.lowBatteryThreshold);
  const isCaseLow = isLowBattery(batteryState.casePercent, soundcoreConfig.lowBatteryThreshold);

  const simulatedJson = generateOpenSCQ30Json(
    batteryState.isConnected ? batteryState.leftRaw : '?',
    batteryState.isConnected ? batteryState.rightRaw : '?',
    batteryState.isConnected ? batteryState.caseRaw : '?',
    soundcoreConfig.macAddress
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Soundcore P40i / R60i Controller & Simulator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono">
                OpenSCQ30 API
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive test bench for earbuds battery states and taskbar rendering
            </p>
          </div>
        </div>

        {/* Connection Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateBattery({ isConnected: !batteryState.isConnected })}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              batteryState.isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{batteryState.isConnected ? 'Connected' : 'Disconnected'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="mb-6">
        <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Scenario Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreset(100, 100, 100)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            🔋 100% Full (All)
          </button>
          <button
            onClick={() => setPreset(90, 80, 60)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            ⚡ Normal Use (90% / 80% / 60%)
          </button>
          <button
            onClick={() => setPreset(30, 40, 20)}
            className="px-2.5 py-1 text-xs rounded-md bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition-colors"
          >
            ⚠️ Low Battery Warning (&le; 40% Red)
          </button>
          <button
            onClick={() => setPreset(10, 80, 50)}
            className="px-2.5 py-1 text-xs rounded-md bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition-colors"
          >
            🚨 Left Critically Low (10%)
          </button>
          <button
            onClick={() => setPreset(0, 0, 0, false)}
            className="px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
          >
            🔌 Disconnected (?)
          </button>
        </div>
      </div>

      {/* Battery Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Left Earbud */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-sky-400" />
              Left Earbud (L)
            </span>
            <span 
              className={`font-mono text-sm font-bold ${
                !batteryState.isConnected 
                  ? 'text-slate-500' 
                  : isLeftLow ? 'text-red-500 font-extrabold' : 'text-sky-400'
              }`}
            >
              {batteryState.isConnected ? `${batteryState.leftPercent}%` : '?'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="10"
            disabled={!batteryState.isConnected}
            value={batteryState.isConnected ? Math.max(0, batteryState.leftPercent) : 0}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdateBattery({
                leftPercent: val,
                leftRaw: `${Math.max(0, Math.round(val / 10) - 1)}/5`
              });
            }}
            className="w-full accent-sky-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          />

          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>0%</span>
            <span>Raw: {batteryState.leftRaw}</span>
            <span>100%</span>
          </div>

          {isLeftLow && batteryState.isConnected && (
            <div className="mt-2 text-[10px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
              Low Battery Warning (&le; 40%)
            </div>
          )}
        </div>

        {/* Right Earbud */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-sky-400" />
              Right Earbud (R)
            </span>
            <span 
              className={`font-mono text-sm font-bold ${
                !batteryState.isConnected 
                  ? 'text-slate-500' 
                  : isRightLow ? 'text-red-500 font-extrabold' : 'text-sky-400'
              }`}
            >
              {batteryState.isConnected ? `${batteryState.rightPercent}%` : '?'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="10"
            disabled={!batteryState.isConnected}
            value={batteryState.isConnected ? Math.max(0, batteryState.rightPercent) : 0}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdateBattery({
                rightPercent: val,
                rightRaw: `${Math.max(0, Math.round(val / 10) - 1)}/5`
              });
            }}
            className="w-full accent-sky-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          />

          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>0%</span>
            <span>Raw: {batteryState.rightRaw}</span>
            <span>100%</span>
          </div>

          {isRightLow && batteryState.isConnected && (
            <div className="mt-2 text-[10px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
              Low Battery Warning (&le; 40%)
            </div>
          )}
        </div>

        {/* Charging Case */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-purple-400" />
              Charging Case (C)
            </span>
            <span 
              className={`font-mono text-sm font-bold ${
                !batteryState.isConnected 
                  ? 'text-slate-500' 
                  : isCaseLow ? 'text-red-500 font-extrabold' : 'text-purple-400'
              }`}
            >
              {batteryState.isConnected ? `${batteryState.casePercent}%` : '?'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="10"
            disabled={!batteryState.isConnected}
            value={batteryState.isConnected ? Math.max(0, batteryState.casePercent) : 0}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onUpdateBattery({
                casePercent: val,
                caseRaw: `${Math.max(0, Math.round(val / 10) - 1)}/5`
              });
            }}
            className="w-full accent-purple-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          />

          <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
            <span>0%</span>
            <span>Raw: {batteryState.caseRaw}</span>
            <span>100%</span>
          </div>

          {isCaseLow && batteryState.isConnected && (
            <div className="mt-2 text-[10px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/40">
              Low Battery Warning (&le; 40%)
            </div>
          )}
        </div>
      </div>

      {/* CLI & JSON Inspector Accordion */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowCliLogs(!showCliLogs)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/50 hover:bg-slate-950 text-xs font-medium text-slate-300 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>OpenSCQ30 CLI Backend Inspection (`openscq30.exe`)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {showCliLogs ? 'Hide JSON [-]' : 'Show CLI Command & JSON [+]'}
          </span>
        </button>

        {showCliLogs && (
          <div className="p-3 bg-slate-950 border-t border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Background Command Executed Every {soundcoreConfig.pollIntervalSeconds}s (Hidden):
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-sky-300 overflow-x-auto">
                "{soundcoreConfig.exePath}" device --mac-address {soundcoreConfig.macAddress} setting --get batteryLevelLeft --get batteryLevelRight --get caseBatteryLevel --json
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Parsed JSON Payload from stdout:
              </div>
              <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 text-emerald-300 text-[10.5px] max-h-40 overflow-y-auto">
                {simulatedJson}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
