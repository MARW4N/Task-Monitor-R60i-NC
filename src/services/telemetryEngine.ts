import { CounterData, SystemProcess } from '../types/monitor';

export class TelemetryEngine {
  private historySize: number;
  private coreCount: number;
  private totalMemoryGB: number;
  private totalVramGB: number;

  // Real or simulated stress modes
  public isCpuStress: boolean = false;
  public isDiskStress: boolean = false;
  public isNetStress: boolean = false;
  public isGpuStress: boolean = false;
  public isMemStress: boolean = false;

  // Process list
  public processes: SystemProcess[] = [
    { id: 4, name: 'System', icon: 'server', cpu: 1.2, memoryMB: 184, diskMBs: 0.1, networkKbps: 0, status: 'Running' },
    { id: 1042, name: 'Windows Explorer', icon: 'folder', cpu: 0.8, memoryMB: 142, diskMBs: 0.0, networkKbps: 0, status: 'Running' },
    { id: 2184, name: 'Google Chrome (12 tabs)', icon: 'globe', cpu: 5.4, memoryMB: 1820, diskMBs: 0.4, networkKbps: 45, status: 'Running' },
    { id: 3912, name: 'Visual Studio Code', icon: 'code', cpu: 2.1, memoryMB: 850, diskMBs: 0.2, networkKbps: 2, status: 'Running' },
    { id: 4520, name: 'Discord', icon: 'message-square', cpu: 1.5, memoryMB: 490, diskMBs: 0.0, networkKbps: 18, status: 'Running' },
    { id: 5612, name: 'Spotify Music', icon: 'music', cpu: 0.9, memoryMB: 280, diskMBs: 0.1, networkKbps: 128, status: 'Running' },
    { id: 6204, name: 'Antivirus Service Executable', icon: 'shield', cpu: 0.4, memoryMB: 210, diskMBs: 0.2, networkKbps: 0, status: 'Running' },
    { id: 7810, name: 'TaskbarMonitor DeskBand', icon: 'activity', cpu: 0.3, memoryMB: 42, diskMBs: 0.0, networkKbps: 0, status: 'Running' },
  ];

  // Raw history buffers
  private cpuHistory: number[] = [];
  private cpuCoreHistories: number[][] = [];
  private memHistory: number[] = [];
  private diskReadHistory: number[] = [];
  private diskWriteHistory: number[] = [];
  private netDownloadHistory: number[] = [];
  private netUploadHistory: number[] = [];
  private gpuHistory: number[] = [];
  private gpuMemHistory: number[] = [];

  private gpuEngines = ['3D', '3D', '3D', 'COPY', 'VDEC', 'CUDA'];
  private currentGpuEngine = '3D';

  constructor(historySize: number = 40) {
    this.historySize = historySize;
    this.coreCount = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 8;
    this.totalMemoryGB = (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) ? (navigator as any).deviceMemory : 16;
    this.totalVramGB = 8.0;

    for (let c = 0; c < this.coreCount; c++) {
      this.cpuCoreHistories.push([]);
    }

    // Seed initial history
    for (let i = 0; i < this.historySize; i++) {
      this.tick(true);
    }
  }

  public setHistorySize(newSize: number) {
    this.historySize = Math.max(10, Math.min(120, newSize));
    const trim = (arr: number[]) => {
      while (arr.length > this.historySize) arr.shift();
    };
    trim(this.cpuHistory);
    this.cpuCoreHistories.forEach(trim);
    trim(this.memHistory);
    trim(this.diskReadHistory);
    trim(this.diskWriteHistory);
    trim(this.netDownloadHistory);
    trim(this.netUploadHistory);
    trim(this.gpuHistory);
    trim(this.gpuMemHistory);
  }

  public tick(isInitial: boolean = false): Record<string, CounterData> {
    const pushWithLimit = (arr: number[], val: number) => {
      arr.push(val);
      if (arr.length > this.historySize) arr.shift();
    };

    // 1. CPU Calculation
    let targetCpu = 12 + Math.random() * 14;
    if (this.isCpuStress) {
      targetCpu = 88 + Math.random() * 12;
    }
    const cpuTotal = Math.min(100, Math.max(2, targetCpu));
    pushWithLimit(this.cpuHistory, cpuTotal);

    // Cores breakdown
    const coreData: { name: string; val: number }[] = [];
    for (let c = 0; c < this.coreCount; c++) {
      let coreVal = cpuTotal + (Math.sin(Date.now() / 1500 + c) * 12) + (Math.random() * 10 - 5);
      coreVal = Math.min(100, Math.max(0, coreVal));
      pushWithLimit(this.cpuCoreHistories[c], coreVal);
      coreData.push({ name: `Core ${c}`, val: coreVal });
    }

    // 2. Memory Calculation
    let baseMemPercent = 0.45; // 45% used
    if (this.isMemStress) {
      baseMemPercent = 0.88;
    }
    const memNoise = (Math.sin(Date.now() / 4000) * 0.03) + (Math.random() * 0.02);
    const usedMemGB = parseFloat((this.totalMemoryGB * Math.min(0.96, baseMemPercent + memNoise)).toFixed(1));
    pushWithLimit(this.memHistory, usedMemGB);

    // 3. Disk Calculation (Bytes/sec -> MB/s)
    let readMB = Math.random() < 0.2 ? Math.random() * 8.5 : Math.random() * 1.5;
    let writeMB = Math.random() < 0.3 ? Math.random() * 12.0 : Math.random() * 0.8;
    if (this.isDiskStress) {
      readMB = 140 + Math.random() * 85;
      writeMB = 95 + Math.random() * 60;
    }
    pushWithLimit(this.diskReadHistory, readMB);
    pushWithLimit(this.diskWriteHistory, writeMB);

    // 4. Network Calculation (Bytes/sec -> KB/s or MB/s)
    let downKbps = Math.random() < 0.4 ? 120 + Math.random() * 650 : 25 + Math.random() * 60;
    let upKbps = Math.random() < 0.25 ? 60 + Math.random() * 220 : 8 + Math.random() * 25;
    if (this.isNetStress) {
      downKbps = 18500 + Math.random() * 8500; // ~18-27 MB/s
      upKbps = 3200 + Math.random() * 1800;
    }
    pushWithLimit(this.netDownloadHistory, downKbps);
    pushWithLimit(this.netUploadHistory, upKbps);

    // 5. GPU 3D & GPU Memory Calculation
    let gpu3d = 8 + Math.random() * 10;
    let gpuMemGB = 2.4 + Math.random() * 0.2;
    if (this.isGpuStress) {
      gpu3d = 82 + Math.random() * 18;
      gpuMemGB = 6.2 + Math.random() * 0.8;
      this.currentGpuEngine = '3D';
    } else {
      if (Math.random() < 0.05) {
        this.currentGpuEngine = this.gpuEngines[Math.floor(Math.random() * this.gpuEngines.length)];
      }
    }
    pushWithLimit(this.gpuHistory, gpu3d);
    pushWithLimit(this.gpuMemHistory, gpuMemGB);

    // Dynamically fluctuate process table CPU & Net
    if (!isInitial) {
      this.processes.forEach((p) => {
        if (p.name === 'TaskbarMonitor DeskBand' && this.isCpuStress) {
          p.cpu = 38.5;
        } else if (p.name.includes('Chrome')) {
          p.cpu = this.isNetStress ? 18.2 : Math.max(1.2, parseFloat((4.5 + Math.random() * 5).toFixed(1)));
          p.networkKbps = this.isNetStress ? Math.round(downKbps) : Math.round(Math.random() * 80);
        } else {
          p.cpu = Math.max(0.1, parseFloat((p.cpu + (Math.random() * 0.8 - 0.4)).toFixed(1)));
        }
      });
    }

    // Build data objects for each counter
    const cpuSummaryString = cpuTotal > 100
      ? `100% +${Math.round(cpuTotal - 100)}`
      : `${Math.round(cpuTotal)}%`;

    const memSummaryString = `${usedMemGB.toFixed(1)}GB`;

    const diskTotalMB = readMB + writeMB;
    const diskSummaryString = `${diskTotalMB.toFixed(1)}MB/s`;
    const diskReadMax = Math.max(1, ...this.diskReadHistory);
    const diskWriteMax = Math.max(1, ...this.diskWriteHistory);

    const netTotalKbps = downKbps + upKbps;
    const formatNetString = (valKbps: number) => {
      if (valKbps >= 1024) {
        return `${(valKbps / 1024).toFixed(1)}MB/s`;
      }
      return `${Math.round(valKbps)}KB/s`;
    };
    const netSummaryString = formatNetString(netTotalKbps);
    const netDownMax = Math.max(1, ...this.netDownloadHistory);
    const netUpMax = Math.max(1, ...this.netUploadHistory);

    const gpuSummaryString = `${Math.round(gpu3d)}%`;
    const gpuMemSummaryString = `${gpuMemGB.toFixed(1)}GB`;

    return {
      CPU: {
        id: 'CPU',
        name: 'CPU',
        label: 'CPU',
        summary: {
          name: 'summary',
          currentValue: cpuTotal,
          currentStringValue: cpuSummaryString,
          maximumValue: 100,
          history: [...this.cpuHistory],
        },
        subItems: coreData.map((c, idx) => ({
          name: c.name,
          currentValue: c.val,
          currentStringValue: cpuSummaryString,
          maximumValue: 100,
          history: [...this.cpuCoreHistories[idx]],
        })),
      },
      MEM: {
        id: 'MEM',
        name: 'MEM',
        label: 'MEM',
        summary: {
          name: 'summary',
          currentValue: usedMemGB,
          currentStringValue: memSummaryString,
          maximumValue: this.totalMemoryGB,
          history: [...this.memHistory],
        },
        subItems: [
          {
            name: 'U',
            currentValue: usedMemGB,
            currentStringValue: memSummaryString,
            maximumValue: this.totalMemoryGB,
            history: [...this.memHistory],
          },
        ],
      },
      DISK: {
        id: 'DISK',
        name: 'DISK',
        label: 'DISK',
        summary: {
          name: 'summary',
          currentValue: diskTotalMB,
          currentStringValue: diskSummaryString,
          maximumValue: Math.max(1, diskReadMax + diskWriteMax),
          history: this.diskReadHistory.map((r, i) => r + this.diskWriteHistory[i]),
        },
        subItems: [
          {
            name: 'R',
            currentValue: readMB,
            currentStringValue: `${readMB.toFixed(1)}MB/s`,
            maximumValue: diskReadMax,
            history: [...this.diskReadHistory],
          },
          {
            name: 'W',
            currentValue: writeMB,
            currentStringValue: `${writeMB.toFixed(1)}MB/s`,
            maximumValue: diskWriteMax,
            history: [...this.diskWriteHistory],
          },
        ],
      },
      NET: {
        id: 'NET',
        name: 'NET',
        label: 'NET',
        summary: {
          name: 'summary',
          currentValue: netTotalKbps,
          currentStringValue: netSummaryString,
          maximumValue: Math.max(1, netDownMax + netUpMax),
          history: this.netDownloadHistory.map((d, i) => d + this.netUploadHistory[i]),
        },
        subItems: [
          {
            name: 'D',
            currentValue: downKbps,
            currentStringValue: formatNetString(downKbps),
            maximumValue: netDownMax,
            history: [...this.netDownloadHistory],
          },
          {
            name: 'U',
            currentValue: upKbps,
            currentStringValue: formatNetString(upKbps),
            maximumValue: netUpMax,
            history: [...this.netUploadHistory],
          },
        ],
      },
      'GPU 3D': {
        id: 'GPU 3D',
        name: 'GPU 3D',
        label: `GPU ${this.currentGpuEngine}`,
        summary: {
          name: 'summary',
          currentValue: gpu3d,
          currentStringValue: gpuSummaryString,
          maximumValue: 100,
          history: [...this.gpuHistory],
        },
        subItems: [
          {
            name: 'GPU',
            currentValue: gpu3d,
            currentStringValue: gpuSummaryString,
            maximumValue: 100,
            history: [...this.gpuHistory],
          },
        ],
      },
      'GPU MEM': {
        id: 'GPU MEM',
        name: 'GPU MEM',
        label: 'GPU MEM',
        summary: {
          name: 'summary',
          currentValue: gpuMemGB,
          currentStringValue: gpuMemSummaryString,
          maximumValue: this.totalVramGB,
          history: [...this.gpuMemHistory],
        },
        subItems: [
          {
            name: 'VRAM',
            currentValue: gpuMemGB,
            currentStringValue: gpuMemSummaryString,
            maximumValue: this.totalVramGB,
            history: [...this.gpuMemHistory],
          },
        ],
      },
    };
  }

  public getHardwareSpecs() {
    return {
      coreCount: this.coreCount,
      totalMemoryGB: this.totalMemoryGB,
      totalVramGB: this.totalVramGB,
      osName: 'Windows 11 Pro 64-bit',
      processorName: `${this.coreCount}-Core Virtual / Physical Processor @ 3.60 GHz`,
      gpuName: 'DirectX 12 / WebGL Hardware Accelerated GPU',
    };
  }
}
