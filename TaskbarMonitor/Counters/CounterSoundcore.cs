using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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

        public CounterSoundcore(Options options)
            : base(options)
        {
        }

        internal override void Initialize(PerformanceCounterReader reader)
        {
            lock (ThreadLock)
            {
                InfoSummary = new CounterInfo()
                {
                    Name = "summary",
                    History = new List<float>(),
                    MaximumValue = 100.0f,
                    CurrentValue = 0,
                    CurrentStringValue = "L:? R:? C:?"
                };

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

                // Check common relative paths if absolute path not found
                if (!File.Exists(exePath))
                {
                    string localExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "openscq30.exe");
                    if (File.Exists(localExe))
                    {
                        exePath = localExe;
                    }
                }

                if (!File.Exists(exePath))
                {
                    // Fallback to checking PATH or known directories
                    string altPath = @"F:\R60i NC Battery\openscq30.exe";
                    if (File.Exists(altPath))
                    {
                        exePath = altPath;
                    }
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
                        RedirectStandardError = true,
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
            catch
            {
                // Silently handle exceptions from background polling
            }
            finally
            {
                isPolling = false;
            }

            // If execution failed or output was empty
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

            int pLeft = ParsePercent(fmtLeft);
            int pRight = ParsePercent(fmtRight);
            int pCase = ParsePercent(fmtCase);

            bool connected = fmtLeft != "?" || fmtRight != "?";

            lock (ThreadLock)
            {
                LeftBattery = fmtLeft;
                RightBattery = fmtRight;
                CaseBattery = fmtCase;
                LeftPercent = pLeft;
                RightPercent = pRight;
                CasePercent = pCase;
                IsConnected = connected;

                UpdateInfosInternal();
            }
        }

        private void SetDisconnected()
        {
            lock (ThreadLock)
            {
                LeftBattery = "?";
                RightBattery = "?";
                CaseBattery = "?";
                LeftPercent = -1;
                RightPercent = -1;
                CasePercent = -1;
                IsConnected = false;

                UpdateInfosInternal();
            }
        }

        private void UpdateInfosInternal()
        {
            InfoSummary.CurrentValue = Math.Max(0, LeftPercent);
            InfoSummary.History.Add(InfoSummary.CurrentValue);
            if (InfoSummary.History.Count > Options.HistorySize) InfoSummary.History.RemoveAt(0);
            InfoSummary.CurrentStringValue = $"L:{LeftBattery} R:{RightBattery} C:{CaseBattery}";

            var infoL = Infos.FirstOrDefault(x => x.Name == "L");
            if (infoL != null)
            {
                infoL.CurrentValue = Math.Max(0, LeftPercent);
                infoL.History.Add(infoL.CurrentValue);
                if (infoL.History.Count > Options.HistorySize) infoL.History.RemoveAt(0);
                infoL.CurrentStringValue = LeftBattery;
            }

            var infoR = Infos.FirstOrDefault(x => x.Name == "R");
            if (infoR != null)
            {
                infoR.CurrentValue = Math.Max(0, RightPercent);
                infoR.History.Add(infoR.CurrentValue);
                if (infoR.History.Count > Options.HistorySize) infoR.History.RemoveAt(0);
                infoR.CurrentStringValue = RightBattery;
            }

            var infoC = Infos.FirstOrDefault(x => x.Name == "C");
            if (infoC != null)
            {
                infoC.CurrentValue = Math.Max(0, CasePercent);
                infoC.History.Add(infoC.CurrentValue);
                if (infoC.History.Count > Options.HistorySize) infoC.History.RemoveAt(0);
                infoC.CurrentStringValue = CaseBattery;
            }
        }

        public override void Update()
        {
            // Called by Monitor timer loop - syncs values into Infos
            lock (ThreadLock)
            {
                UpdateInfosInternal();
            }
        }

        private string ExtractJsonValue(string json, string key)
        {
            try
            {
                // Attempt direct JToken search first
                if (json.TrimStart().StartsWith("{") || json.TrimStart().StartsWith("["))
                {
                    var token = JToken.Parse(json);
                    var match = token.SelectTokens($"$..[?(@.settingId == '{key}')]").FirstOrDefault();
                    if (match != null)
                    {
                        var valToken = match["value"];
                        if (valToken != null)
                        {
                            if (valToken is JObject obj && obj["value"] != null)
                                return obj["value"].ToString();
                            return valToken.ToString();
                        }
                    }
                }
            }
            catch
            {
                // Fallback to substring matching as in the Rust implementation
            }

            string blockMarker = $"\"settingId\": \"{key}\"";
            int blockStart = json.IndexOf(blockMarker);
            if (blockStart >= 0)
            {
                string blockSlice = json.Substring(blockStart);
                int firstVal = blockSlice.IndexOf("\"value\":");
                if (firstVal >= 0)
                {
                    string afterFirst = blockSlice.Substring(firstVal + 8);
                    int secondVal = afterFirst.IndexOf("\"value\":");
                    if (secondVal >= 0)
                    {
                        string valStr = afterFirst.Substring(secondVal + 8).TrimStart();
                        if (valStr.StartsWith("\""))
                        {
                            int endQuote = valStr.IndexOf('"', 1);
                            if (endQuote > 1)
                            {
                                return valStr.Substring(1, endQuote - 1);
                            }
                        }
                    }
                }
            }

            return "?";
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
                case "?": return "?";
                default:
                    if (!string.IsNullOrEmpty(raw) && raw.All(char.IsDigit))
                        return raw + "%";
                    return raw ?? "?";
            }
        }

        public static int ParsePercent(string formatted)
        {
            if (string.IsNullOrEmpty(formatted)) return -1;
            string clean = formatted.Replace("%", "").Trim();
            if (int.TryParse(clean, out int val))
            {
                return val;
            }
            return -1;
        }

        public static bool IsLowBattery(string val, int threshold = 40)
        {
            int p = ParsePercent(val);
            return p >= 0 && p <= threshold;
        }

        public override string GetName()
        {
            return "SOUNDCORE";
        }

        public override string GetLabel()
        {
            return "Soundcore";
        }

        public override CounterType GetCounterType()
        {
            return Options.CounterOptions.ContainsKey("SOUNDCORE")
                ? Options.CounterOptions["SOUNDCORE"].GraphType
                : CounterType.SINGLE;
        }

        public override void Dispose()
        {
            pollTimer?.Change(Timeout.Infinite, Timeout.Infinite);
            pollTimer?.Dispose();
            pollTimer = null;
            base.Dispose();
        }
    }
}
