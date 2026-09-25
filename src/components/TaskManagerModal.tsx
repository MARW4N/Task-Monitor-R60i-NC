import React, { useState } from 'react';
import { CounterData, SystemProcess } from '../types/monitor';
import { X, Minus, Square, Activity, Cpu, HardDrive, Wifi, Layers } from 'lucide-react';

interface TaskManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, CounterData>;
  processes: SystemProcess[];
  specs: {
    coreCount: number;
    totalMemoryGB: number;
    totalVramGB: number;
    osName: string;
    processorName: string;
    gpuName: string;
  };
  onEndProcess: (id: number) => void;
}

export const TaskManagerModal: React.FC<TaskManagerModalProps> = ({
  isOpen,
  onClose,
  data,
  processes,
  specs,
  onEndProcess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'processes' | 'performance'>('processes');
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'cpu' | 'memoryMB' | 'diskMBs' | 'networkKbps'>('cpu');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [perfSubTab, setPerfSubTab] = useState<'cpu' | 'memory' | 'disk' | 'network' | 'gpu'>('cpu');

  const sortedProcesses = [...processes].sort((a, b) => {
    const diff = (a[sortField] as number) - (b[sortField] as number);
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (field: 'cpu' | 'memoryMB' | 'diskMBs' | 'networkKbps') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const cpuData = data['CPU'];
  const memData = data['MEM'];
  const diskData = data['DISK'];
  const netData = data['NET'];
  const gpuData = data['GPU 3D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#202020] text-slate-200 w-full max-w-4xl h-[650px] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Windows Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2b2b2b] border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <span className="font-semibold text-xs tracking-wide text-white">Task Manager</span>
          </div>
          <div className="flex items-center">
            <button className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded">
              <Minus size={14} />
            </button>
            <button className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded">
              <Square size={12} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-red-600 text-slate-400 hover:text-white rounded transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-white/10 bg-[#252525] px-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-4 py-2.5 border-b-2 font-medium transition ${
              activeTab === 'processes'
                ? 'border-emerald-500 text-emerald-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Processes
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2.5 border-b-2 font-medium transition ${
              activeTab === 'performance'
                ? 'border-emerald-500 text-emerald-400 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Performance
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#191919]">
          {activeTab === 'processes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Process Table Header */}
              <div className="grid grid-cols-12 px-4 py-2 bg-[#232323] border-b border-white/10 text-[11px] font-semibold text-slate-400 select-none">
                <div className="col-span-5">Name</div>
                <div
                  className="col-span-2 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('cpu')}
                >
                  CPU {sortField === 'cpu' ? (sortAsc ? '▲' : '▼') : ''}
                </div>
                <div
                  className="col-span-2 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('memoryMB')}
                >
                  Memory {sortField === 'memoryMB' ? (sortAsc ? '▲' : '▼') : ''}
                </div>
                <div
                  className="col-span-2 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('diskMBs')}
                >
                  Disk {sortField === 'diskMBs' ? (sortAsc ? '▲' : '▼') : ''}
                </div>
                <div
                  className="col-span-1 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('networkKbps')}
                >
                  Network {sortField === 'networkKbps' ? (sortAsc ? '▲' : '▼') : ''}
                </div>
              </div>

              {/* Process Table Body */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 text-xs">
                {sortedProcesses.map((proc) => {
                  const isSelected = selectedProcessId === proc.id;
                  return (
                    <div
                      key={proc.id}
                      onClick={() => setSelectedProcessId(proc.id)}
                      className={`grid grid-cols-12 px-4 py-2.5 items-center cursor-pointer transition ${
                        isSelected ? 'bg-sky-600/25 text-white' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="col-span-5 flex items-center gap-2.5 font-medium truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="truncate">{proc.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({proc.id})</span>
                      </div>
                      <div className="col-span-2 text-right font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            proc.cpu > 20
                              ? 'bg-amber-500/20 text-amber-300'
                              : proc.cpu > 5
                              ? 'bg-sky-500/10 text-sky-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {proc.cpu.toFixed(1)}%
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-mono text-slate-300">
                        {proc.memoryMB.toFixed(0)} MB
                      </div>
                      <div className="col-span-2 text-right font-mono text-slate-400">
                        {proc.diskMBs.toFixed(1)} MB/s
                      </div>
                      <div className="col-span-1 text-right font-mono text-slate-400">
                        {proc.networkKbps > 0 ? `${proc.networkKbps} K` : '0 K'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Process Footer */}
              <div className="px-4 py-2.5 bg-[#232323] border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Processes: {processes.length}</span>
                <button
                  disabled={!selectedProcessId}
                  onClick={() => {
                    if (selectedProcessId) {
                      onEndProcess(selectedProcessId);
                      setSelectedProcessId(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded font-medium transition ${
                    selectedProcessId
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  End Task
                </button>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Performance Sidebar */}
              <div className="w-56 bg-[#212121] border-r border-white/10 p-2 space-y-1.5 overflow-y-auto">
                <div
                  onClick={() => setPerfSubTab('cpu')}
                  className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    perfSubTab === 'cpu' ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cpu size={16} />
                    <span className="font-semibold text-xs">CPU</span>
                  </div>
                  <span className="font-mono text-xs">{cpuData?.summary.currentStringValue}</span>
                </div>

                <div
                  onClick={() => setPerfSubTab('memory')}
                  className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    perfSubTab === 'memory' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    <span className="font-semibold text-xs">Memory</span>
                  </div>
                  <span className="font-mono text-xs">{memData?.summary.currentStringValue}</span>
                </div>

                <div
                  onClick={() => setPerfSubTab('disk')}
                  className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    perfSubTab === 'disk' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} />
                    <span className="font-semibold text-xs">Disk</span>
                  </div>
                  <span className="font-mono text-xs">{diskData?.summary.currentStringValue}</span>
                </div>

                <div
                  onClick={() => setPerfSubTab('network')}
                  className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    perfSubTab === 'network' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wifi size={16} />
                    <span className="font-semibold text-xs">Network</span>
                  </div>
                  <span className="font-mono text-xs">{netData?.summary.currentStringValue}</span>
                </div>

                <div
                  onClick={() => setPerfSubTab('gpu')}
                  className={`p-2.5 rounded-lg cursor-pointer transition flex items-center justify-between ${
                    perfSubTab === 'gpu' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Activity size={16} />
                    <span className="font-semibold text-xs">GPU</span>
                  </div>
                  <span className="font-mono text-xs">{gpuData?.summary.currentStringValue}</span>
                </div>
              </div>

              {/* Performance Detail View */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {perfSubTab === 'cpu' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">CPU</h3>
                        <p className="text-xs text-slate-400">{specs.processorName}</p>
                      </div>
                      <span className="text-2xl font-bold font-mono text-sky-400">
                        {cpuData?.summary.currentStringValue}
                      </span>
                    </div>

                    {/* Overall CPU Graph */}
                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10">
                      <div className="text-[11px] text-slate-400 mb-2">% Utilization Over Time</div>
                      <div className="h-32 flex items-end gap-1">
                        {cpuData?.summary.history.map((val, i) => (
                          <div
                            key={i}
                            style={{ height: `${val}%` }}
                            className="flex-1 bg-sky-500/70 hover:bg-sky-400 rounded-t-sm transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Logical Cores Grid */}
                    <div>
                      <span className="text-xs font-semibold text-slate-300 mb-2 block">
                        {specs.coreCount} Logical Processors Breakdown
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {cpuData?.subItems.map((core, i) => (
                          <div key={i} className="bg-[#141414] p-2.5 rounded border border-white/5">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Core {i}</span>
                              <span className="font-mono">{Math.round(core.currentValue)}%</span>
                            </div>
                            <div className="h-10 bg-black/40 rounded flex items-end gap-0.5 overflow-hidden p-0.5">
                              {core.history.slice(-15).map((hVal, hIdx) => (
                                <div
                                  key={hIdx}
                                  style={{ height: `${hVal}%` }}
                                  className="flex-1 bg-sky-500/60 rounded-t-sm"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {perfSubTab === 'memory' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">Memory</h3>
                        <p className="text-xs text-slate-400">System Physical RAM</p>
                      </div>
                      <span className="text-2xl font-bold font-mono text-purple-400">
                        {memData?.summary.currentStringValue} / {specs.totalMemoryGB} GB
                      </span>
                    </div>

                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10">
                      <div className="text-[11px] text-slate-400 mb-2">Memory Usage History</div>
                      <div className="h-36 flex items-end gap-1">
                        {memData?.summary.history.map((val, i) => {
                          const pct = (val / specs.totalMemoryGB) * 100;
                          return (
                            <div
                              key={i}
                              style={{ height: `${pct}%` }}
                              className="flex-1 bg-purple-500/70 hover:bg-purple-400 rounded-t-sm transition-all"
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">In Use (Compressed)</span>
                        <span className="text-lg font-bold font-mono text-white">{memData?.summary.currentStringValue}</span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">Available</span>
                        <span className="text-lg font-bold font-mono text-white">
                          {(specs.totalMemoryGB - (memData?.summary.currentValue || 0)).toFixed(1)} GB
                        </span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">Committed</span>
                        <span className="text-lg font-bold font-mono text-white">
                          {((memData?.summary.currentValue || 0) + 2.4).toFixed(1)} / {(specs.totalMemoryGB + 4).toFixed(1)} GB
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {perfSubTab === 'disk' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">Disk</h3>
                        <p className="text-xs text-slate-400">NVMe Solid State Drive</p>
                      </div>
                      <span className="text-2xl font-bold font-mono text-emerald-400">
                        {diskData?.summary.currentStringValue}
                      </span>
                    </div>

                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10">
                      <div className="text-[11px] text-slate-400 mb-2">Read / Write Activity Transfer Rate</div>
                      <div className="h-36 flex items-end gap-1">
                        {diskData?.summary.history.map((val, i) => {
                          const max = Math.max(10, diskData.summary.maximumValue);
                          const pct = Math.min(100, (val / max) * 100);
                          return (
                            <div
                              key={i}
                              style={{ height: `${pct}%` }}
                              className="flex-1 bg-emerald-500/70 hover:bg-emerald-400 rounded-t-sm transition-all"
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">Read Speed</span>
                        <span className="text-lg font-bold font-mono text-emerald-300">
                          {diskData?.subItems[0]?.currentStringValue}
                        </span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">Write Speed</span>
                        <span className="text-lg font-bold font-mono text-teal-300">
                          {diskData?.subItems[1]?.currentStringValue}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {perfSubTab === 'network' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">Network</h3>
                        <p className="text-xs text-slate-400">Wi-Fi / Ethernet Gigabit Adapter</p>
                      </div>
                      <span className="text-2xl font-bold font-mono text-amber-400">
                        {netData?.summary.currentStringValue}
                      </span>
                    </div>

                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10">
                      <div className="text-[11px] text-slate-400 mb-2">Throughput History</div>
                      <div className="h-36 flex items-end gap-1">
                        {netData?.summary.history.map((val, i) => {
                          const max = Math.max(500, netData.summary.maximumValue);
                          const pct = Math.min(100, (val / max) * 100);
                          return (
                            <div
                              key={i}
                              style={{ height: `${pct}%` }}
                              className="flex-1 bg-amber-500/70 hover:bg-amber-400 rounded-t-sm transition-all"
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">Receive (Download)</span>
                        <span className="text-lg font-bold font-mono text-amber-300">
                          {netData?.subItems[0]?.currentStringValue}
                        </span>
                      </div>
                      <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                        <span className="text-slate-400 text-xs block">Send (Upload)</span>
                        <span className="text-lg font-bold font-mono text-orange-300">
                          {netData?.subItems[1]?.currentStringValue}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {perfSubTab === 'gpu' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">GPU</h3>
                        <p className="text-xs text-slate-400">{specs.gpuName}</p>
                      </div>
                      <span className="text-2xl font-bold font-mono text-blue-400">
                        {gpuData?.summary.currentStringValue}
                      </span>
                    </div>

                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10">
                      <div className="text-[11px] text-slate-400 mb-2">3D Engine Utilization</div>
                      <div className="h-36 flex items-end gap-1">
                        {gpuData?.summary.history.map((val, i) => (
                          <div
                            key={i}
                            style={{ height: `${val}%` }}
                            className="flex-1 bg-blue-500/70 hover:bg-blue-400 rounded-t-sm transition-all"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
