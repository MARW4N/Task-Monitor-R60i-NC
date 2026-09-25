import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Terminal } from 'lucide-react';

export const SourceCodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'counter' | 'control' | 'optionForm' | 'options' | 'monitor' | 'build'>('counter');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<string, string> = {
    counter: `// TaskbarMonitor/Counters/CounterSoundcore.cs
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using Newtonsoft.Json.Linq;

namespace TaskbarMonitor.Counters
{
    public class CounterSoundcore : ICounter
    {
        private System.Threading.Timer pollTimer;
        private bool isPolling = false;

        public string LeftBattery { get; private set; } = "?";
        public string RightBattery { get; private set; } = "?";
        public string CaseBattery { get; private set; } = "?";
        public bool IsConnected { get; private set; } = false;

        public int LeftPercent { get; private set; } = -1;
        public int RightPercent { get; private set; } = -1;
        public int CasePercent { get; private set; } = -1;

        public CounterSoundcore(Options options) : base(options) { }

        internal override void Initialize(PerformanceCounterReader reader)
        {
            lock (ThreadLock)
            {
                InfoSummary = new CounterInfo() { Name = "summary", History = new List<float>(), MaximumValue = 100.0f, CurrentValue = 0, CurrentStringValue = "L:? R:? C:?" };
                Infos = new List<CounterInfo>
                {
                    new CounterInfo() { Name = "L", History = new List<float>(), MaximumValue = 100.0f, CurrentValue = 0, CurrentStringValue = "?" },
                    new CounterInfo() { Name = "R", History = new List<float>(), MaximumValue = 100.0f, CurrentValue = 0, CurrentStringValue = "?" },
                    new CounterInfo() { Name = "C", History = new List<float>(), MaximumValue = 100.0f, CurrentValue = 0, CurrentStringValue = "?" }
                };
            }

            int intervalMs = Math.Max(2, (Options?.Soundcore?.PollIntervalSeconds ?? 5)) * 1000;
            pollTimer = new System.Threading.Timer(PollSoundcore, null, 500, intervalMs);
        }

        private void PollSoundcore(object state)
        {
            if (isPolling) return;
            isPolling = true;

            try
            {
                string exePath = Options?.Soundcore?.ExePath ?? "openscq30.exe";
                string macAddress = Options?.Soundcore?.MacAddress ?? "34:09:C9:AD:A9:20";

                if (!File.Exists(exePath))
                {
                    string localExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "openscq30.exe");
                    if (File.Exists(localExe)) exePath = localExe;
                }

                if (File.Exists(exePath))
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = exePath,
                        Arguments = $"device --mac-address {macAddress} setting --get batteryLevelLeft --get batteryLevelRight --get caseBatteryLevel --json",
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };

                    using (var proc = Process.Start(psi))
                    {
                        string jsonOutput = proc.StandardOutput.ReadToEnd();
                        proc.WaitForExit(4000);
                        if (!string.IsNullOrWhiteSpace(jsonOutput))
                        {
                            ParseBatteryData(jsonOutput);
                            return;
                        }
                    }
                }
            }
            catch { }
            finally { isPolling = false; }

            SetDisconnected();
        }

        private void ParseBatteryData(string json)
        {
            string rawLeft = ExtractJsonValue(json, "batteryLevelLeft");
            string rawRight = ExtractJsonValue(json, "batteryLevelRight");
            string rawCase = ExtractJsonValue(json, "caseBatteryLevel");

            string fmtLeft = FormatBattery(rawLeft);
            string fmtRight = FormatBattery(rawRight);
            string fmtCase = FormatBattery(rawCase);

            lock (ThreadLock)
            {
                LeftBattery = fmtLeft;
                RightBattery = fmtRight;
                CaseBattery = fmtCase;
                LeftPercent = ParsePercent(fmtLeft);
                RightPercent = ParsePercent(fmtRight);
                CasePercent = ParsePercent(fmtCase);
                IsConnected = fmtLeft != "?" || fmtRight != "?";
                UpdateInfosInternal();
            }
        }

        private void SetDisconnected()
        {
            lock (ThreadLock)
            {
                LeftBattery = "?"; RightBattery = "?"; CaseBattery = "?";
                LeftPercent = -1; RightPercent = -1; CasePercent = -1;
                IsConnected = false;
                UpdateInfosInternal();
            }
        }

        public static string FormatBattery(string raw)
        {
            switch (raw)
            {
                case "9/5": return "100%";
                case "8/5": return "90%";
                case "7/5": return "80%";
                case "6/5": return "70%";
                case "5/5": return "60%";
                case "4/5": return "50%";
                case "3/5": return "40%";
                case "2/5": return "30%";
                case "1/5": return "20%";
                case "0/5": return "10%";
                default: return raw.EndsWith("%") ? raw : (raw.Length > 0 ? raw : "?");
            }
        }
    }
}`,
    optionForm: `// Excerpt from TaskbarMonitor/OptionForm.cs & OptionForm.Designer.cs:
// Added "SOUNDCORE BATTERY" tab to the OptionForm settings sidebar!

// 1. Initializing and loading Soundcore options into form controls:
private void UpdateSoundcoreForm()
{
    if (this.Options.Soundcore == null)
        this.Options.Soundcore = new SoundcoreOptions();

    this.txtSoundcoreMac.Text = this.Options.Soundcore.MacAddress;
    this.txtSoundcoreExePath.Text = this.Options.Soundcore.ExePath;
    this.editSoundcorePoll.Value = Math.Max(1, Math.Min(60, this.Options.Soundcore.PollIntervalSeconds));
    this.editSoundcoreThreshold.Value = Math.Max(0, Math.Min(100, this.Options.Soundcore.LowBatteryThreshold));
    this.chkSoundcoreShowLeft.Checked = this.Options.Soundcore.ShowLeft;
    this.chkSoundcoreShowRight.Checked = this.Options.Soundcore.ShowRight;
    this.chkSoundcoreShowCase.Checked = this.Options.Soundcore.ShowCase;
    this.chkSoundcoreHideDisconnected.Checked = this.Options.Soundcore.HideWhenDisconnected;
}

// 2. Saving Soundcore options on OK or Apply click:
private void SaveSoundcoreOptions()
{
    this.Options.Soundcore.MacAddress = this.txtSoundcoreMac.Text.Trim();
    this.Options.Soundcore.ExePath = this.txtSoundcoreExePath.Text.Trim();
    this.Options.Soundcore.PollIntervalSeconds = Convert.ToInt32(this.editSoundcorePoll.Value);
    this.Options.Soundcore.LowBatteryThreshold = Convert.ToInt32(this.editSoundcoreThreshold.Value);
    this.Options.Soundcore.ShowLeft = this.chkSoundcoreShowLeft.Checked;
    this.Options.Soundcore.ShowRight = this.chkSoundcoreShowRight.Checked;
    this.Options.Soundcore.ShowCase = this.chkSoundcoreShowCase.Checked;
    this.Options.Soundcore.HideWhenDisconnected = this.chkSoundcoreHideDisconnected.Checked;
}`,
    control: `// Excerpt from TaskbarMonitor/SystemWatcherControl.cs:
// drawSoundcoreWidget: Direct Win32 / GDI+ rendering of earbuds battery
private void drawSoundcoreWidget(Graphics g, Rectangle rect, TaskbarMonitor.Counters.CounterSoundcore scCounter)
{
    using (SolidBrush bgBrush = new SolidBrush(Color.FromArgb(160, 20, 20, 20)))
    {
        g.FillRectangle(bgBrush, rect.X, rect.Y, rect.Width, rect.Height);
    }

    using (Font font = new Font("Segoe UI", 8.25f, FontStyle.Bold))
    using (SolidBrush normalBrush = new SolidBrush(Theme.TextColor))
    using (SolidBrush lowBrush = new SolidBrush(Color.FromArgb(242, 60, 52))) // #F23C34
    {
        // Render L: %, R: %, C: % with color highlighting for low battery
        // Levels <= LowBatteryThreshold turn Red (#F23C34)
    }
}`,
    options: `// Excerpt from TaskbarMonitor/Options.cs:
public class SoundcoreOptions
{
    public string ExePath { get; set; } = @"F:\\R60i NC Battery\\openscq30.exe";
    public string MacAddress { get; set; } = "34:09:C9:AD:A9:20";
    public int PollIntervalSeconds { get; set; } = 5;
    public bool HideWhenDisconnected { get; set; } = false;
    public int LowBatteryThreshold { get; set; } = 40;
    public bool ShowLeft { get; set; } = true;
    public bool ShowRight { get; set; } = true;
    public bool ShowCase { get; set; } = true;
    public bool RenderAsWidgetText { get; set; } = true;
}

// In Options.DefaultOptions():
opt.CounterOptions.Add("SOUNDCORE", new CounterOptions {
    GraphType = TaskbarMonitor.Counters.ICounter.CounterType.SINGLE,
    SeparateScales = false,
    InvertOrder = false,
    SummaryPosition = TaskbarMonitor.CounterOptions.DisplayPosition.TOP,
    CurrentValueAsSummary = true,
    ShowCurrentValueShadowOnHover = true,
    ShowCurrentValue = TaskbarMonitor.CounterOptions.DisplayType.SHOW,
    TitlePosition = TaskbarMonitor.CounterOptions.DisplayPosition.MIDDLE,
    ShowTitle = TaskbarMonitor.CounterOptions.DisplayType.HOVER,
    Enabled = true,
    ShowTitleShadowOnHover = true,
    Order = 6
});`,
    monitor: `// Excerpt from TaskbarMonitor/Monitor.cs:
var counterNames = new List<string> { 
    "CPU", "MEM", "DISK", "NET", "GPU 3D", "GPU MEM", "SOUNDCORE" 
};

// Inside switch(counterName):
case "SOUNDCORE":
    ct = new Counters.CounterSoundcore(opt);
    break;`,
    build: `# Building TaskbarMonitor on Windows

1. Prerequisites:
   - Visual Studio 2019/2022 (with .NET desktop development workload)
   - .NET Framework 4.7.2 Developer Pack

2. Build using Developer Command Prompt:
   msbuild TaskbarMonitor.sln /p:Configuration=Release /p:Platform="Any CPU"

3. Locate compiled binaries:
   - TaskbarMonitor\\bin\\Release\\TaskbarMonitor.dll
   - TaskbarMonitorWindows11\\bin\\Release\\TaskbarMonitorWindows11.exe

4. Setup OpenSCQ30:
   - Place openscq30.exe into the app folder or at "F:\\R60i NC Battery\\openscq30.exe"
   - Confirm your Soundcore Bluetooth MAC address in Windows Bluetooth settings
   - Run TaskbarMonitorWindows11.exe!

5. Run on Startup:
   - Press Win + R, type 'shell:startup'
   - Create a shortcut to TaskbarMonitorWindows11.exe in that folder`
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <Code2 className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              C# Solution Implementation Files
            </h3>
            <p className="text-xs text-slate-400">
              Directly inserted into the repository's C# TaskbarMonitor codebase
            </p>
          </div>
        </div>

        <button
          onClick={() => copyCode(codeSnippets[activeTab])}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('counter')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'counter'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>CounterSoundcore.cs</span>
        </button>

        <button
          onClick={() => setActiveTab('optionForm')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'optionForm'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>OptionForm.cs</span>
        </button>

        <button
          onClick={() => setActiveTab('control')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'control'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>SystemWatcherControl.cs</span>
        </button>

        <button
          onClick={() => setActiveTab('options')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'options'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Options.cs</span>
        </button>

        <button
          onClick={() => setActiveTab('monitor')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'monitor'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Monitor.cs</span>
        </button>

        <button
          onClick={() => setActiveTab('build')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'build'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Windows Build &amp; Setup</span>
        </button>
      </div>

      {/* Code Display Area */}
      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-[380px] leading-relaxed">
        {codeSnippets[activeTab]}
      </pre>
    </div>
  );
};
