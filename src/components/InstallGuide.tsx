import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Check, 
  Copy, 
  Laptop, 
  FolderCheck, 
  Play, 
  Cpu, 
  Headphones, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  GitBranch,
  Zap,
  Layers
} from 'lucide-react';

export const InstallGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const msbuildCommand = 'msbuild TaskbarMonitor.sln /p:Configuration=Release /p:Platform="Any CPU"';
  const startupCommand = 'explorer shell:startup';
  const oneClickBatch = 'Build-Windows.bat';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Windows 11 Native Installation</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              How to Install &amp; Run Taskbar Monitor on Your PC
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Choose the method that works best for you: download the pre-built release executable from GitHub, use the 1-click batch builder on Windows, or compile via Visual Studio.
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-sky-600/30 border border-sky-500/40 items-center justify-center text-sky-300 shrink-0">
            <Download className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3 INSTALL METHODS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method 1: GitHub Automatic Release */}
        <div className="bg-slate-900 border border-sky-600/40 rounded-xl p-5 shadow-lg relative flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
                <GitBranch className="w-4 h-4" />
                <span>Method 1: GitHub Release (Automatic)</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-semibold border border-sky-500/30">
                Recommended
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We added a GitHub Actions workflow (<code className="text-sky-300 font-mono">.github/workflows/build-release.yml</code>) to this repository.
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 mt-2">
              <li>Push this repository to your GitHub account (or trigger the action).</li>
              <li>GitHub automatically builds the Windows executable in the cloud on a Windows server.</li>
              <li>Go to your repository’s <strong>Releases</strong> page on GitHub.</li>
              <li>Download <strong><code className="text-emerald-400">TaskbarMonitorWindows11.exe</code></strong> or the full ZIP file directly to your PC!</li>
            </ol>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
            💡 No Visual Studio or build tools needed on your personal machine!
          </div>
        </div>

        {/* Method 2: 1-Click Batch Builder */}
        <div className="bg-slate-900 border border-emerald-600/40 rounded-xl p-5 shadow-lg relative flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>Method 2: 1-Click Batch Script</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-500/30">
                Fast Local Build
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We included a ready-to-run <strong><code className="text-emerald-300">Build-Windows.bat</code></strong> script in the repository root.
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 mt-2">
              <li>On your PC, double-click <strong><code className="text-emerald-300">Build-Windows.bat</code></strong>.</li>
              <li>It automatically searches for MSBuild (Visual Studio or .NET Framework) and compiles the solution.</li>
              <li>It places the compiled files into a clean folder: <strong><code className="text-white">TaskbarMonitor_Release/</code></strong>.</li>
              <li>It prompts you to launch it right away and optionally adds it to your Windows Startup folder!</li>
            </ol>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between">
            <span>Script: <code>Build-Windows.bat</code></span>
            <button
              onClick={() => copyToClipboard('Build-Windows.bat', 'oneclick')}
              className="text-xs text-sky-400 hover:text-white"
            >
              {copiedId === 'oneclick' ? 'Copied' : 'Copy Name'}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Steps & Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Headphones className="w-4 h-4 text-sky-400" />
          Running &amp; Configuring on Windows 11
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-white block">1. Run the Executable</span>
            <p className="text-slate-400 leading-relaxed">
              Double-click <strong className="text-white">TaskbarMonitorWindows11.exe</strong>. The widget immediately docks beside your Windows 11 clock.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-white block">2. Configure Soundcore</span>
            <p className="text-slate-400 leading-relaxed">
              Right-click the widget $\to$ <strong>Options...</strong> $\to$ click the <strong>SOUNDCORE BATTERY</strong> tab. Confirm MAC address <code className="text-sky-300">34:09:C9:AD:A9:20</code> and openscq30 path.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="font-bold text-white block">3. Run on Boot</span>
            <p className="text-slate-400 leading-relaxed">
              Press <strong>Win + R</strong>, type <code className="text-sky-300">shell:startup</code>, and place a shortcut to <strong className="text-white">TaskbarMonitorWindows11.exe</strong> there.
            </p>
          </div>
        </div>

        {/* Low Battery Alert Notice */}
        <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg text-xs text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p>
            <strong>Low Battery Alert:</strong> Any earbud or case reading at or below <strong>40%</strong> will turn bright crimson red (<code className="text-rose-300 font-mono">#F23C34</code>) automatically. When disconnected, it collapses to avoid taking up taskbar space.
          </p>
        </div>
      </div>
    </div>
  );
};
