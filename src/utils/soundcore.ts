export const SOUNDCORE_FRACTION_MAP: Record<string, number> = {
  '9/5': 100,
  '8/5': 90,
  '7/5': 80,
  '6/5': 70,
  '5/5': 60,
  '4/5': 50,
  '3/5': 40,
  '2/5': 30,
  '1/5': 20,
  '0/5': 10,
};

export function formatBatteryFromRaw(raw: string): { percent: number; label: string } {
  if (raw in SOUNDCORE_FRACTION_MAP) {
    const pct = SOUNDCORE_FRACTION_MAP[raw];
    return { percent: pct, label: `${pct}%` };
  }
  if (raw === '?') {
    return { percent: -1, label: '?' };
  }
  const numeric = parseInt(raw.replace('%', ''), 10);
  if (!isNaN(numeric)) {
    return { percent: numeric, label: `${numeric}%` };
  }
  return { percent: -1, label: raw || '?' };
}

export function isLowBattery(percent: number, threshold = 40): boolean {
  return percent >= 0 && percent <= threshold;
}

export function generateOpenSCQ30Json(
  leftRaw: string,
  rightRaw: string,
  caseRaw: string,
  mac: string = '34:09:C9:AD:A9:20'
): string {
  return JSON.stringify(
    {
      device: {
        macAddress: mac,
        model: 'Soundcore P40i / R60i NC',
        connected: leftRaw !== '?' || rightRaw !== '?'
      },
      settings: [
        {
          settingId: 'batteryLevelLeft',
          value: {
            value: leftRaw
          }
        },
        {
          settingId: 'batteryLevelRight',
          value: {
            value: rightRaw
          }
        },
        {
          settingId: 'caseBatteryLevel',
          value: {
            value: caseRaw
          }
        }
      ]
    },
    null,
    2
  );
}
