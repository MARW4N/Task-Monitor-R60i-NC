import React, { useRef, useEffect, useState } from 'react';
import { AppOptions, CounterData, GraphTheme } from '../types/monitor';
import { getNthGradientColor } from '../utils/defaults';

interface DeskbandCanvasProps {
  options: AppOptions;
  theme: GraphTheme;
  data: Record<string, CounterData>;
  height?: number;
  previewMode?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onSettingsClick?: () => void;
  className?: string;
}

export const DeskbandCanvas: React.FC<DeskbandCanvasProps> = ({
  options,
  theme,
  data,
  height = 36,
  previewMode = false,
  onContextMenu,
  onSettingsClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredCounter, setHoveredCounter] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter enabled counters sorted by order
  const activeCounters = Object.entries(options.CounterOptions)
    .filter(([_, opt]) => opt.Enabled)
    .sort((a, b) => a[1].Order - b[1].Order);

  // Width per counter is HistorySize + 10 (spacing)
  const counterSlotWidth = options.HistorySize + 10;
  const totalWidth = Math.max(80, activeCounters.length * counterSlotWidth + 4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle HiDPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, totalWidth, height);

    let currentX = 2;

    activeCounters.forEach(([key, opt]) => {
      const counterData = data[key];
      if (!counterData) {
        currentX += counterSlotWidth;
        return;
      }

      const maxH = height;
      const graphW = options.HistorySize;
      const isMouseOver = isHovered;

      // 1. Draw Graph based on type
      if (opt.GraphType === 'SINGLE') {
        const info = counterData.subItems[0] || counterData.summary;
        drawSingleGraph(ctx, currentX, 0, graphW, maxH, false, info, theme);
      } else if (opt.GraphType === 'MIRRORED') {
        const halfH = Math.floor(maxH / 2);
        const infos = opt.InvertOrder
          ? [...counterData.subItems].reverse()
          : counterData.subItems;

        if (infos[0]) {
          drawSingleGraph(ctx, currentX, 0, graphW, halfH, false, infos[0], theme, 0);
        }
        if (infos[1]) {
          drawSingleGraph(ctx, currentX, halfH, graphW, halfH, true, infos[1], theme, 1);
        }
      } else if (opt.GraphType === 'STACKED') {
        const infos = opt.InvertOrder
          ? [...counterData.subItems].reverse()
          : counterData.subItems;
        drawStackedGraph(ctx, currentX, 0, graphW, maxH, opt.InvertOrder, infos, theme);
      }

      // 2. Draw Title Text
      const showTitle =
        opt.ShowTitle === 'SHOW' || (opt.ShowTitle === 'HOVER' && isMouseOver);

      ctx.save();
      ctx.font = `${theme.TitleFontStyle} ${theme.TitleSize}px ${theme.TitleFont}`;
      const titleLabel = counterData.label || counterData.name;
      const titleMetrics = ctx.measureText(titleLabel);
      const titleW = titleMetrics.width;
      const titleH = theme.TitleSize;

      let titleY = maxH / 2 + titleH / 2.5; // MIDDLE
      if (opt.TitlePosition === 'TOP') {
        titleY = titleH + 2;
      } else if (opt.TitlePosition === 'BOTTOM') {
        titleY = maxH - 3;
      }

      const titleCenterX = currentX + graphW / 2 - titleW / 2;

      if (showTitle) {
        // Shadow
        if (
          (opt.ShowTitle === 'HOVER' && opt.ShowTitleShadowOnHover) ||
          isMouseOver ||
          opt.ShowTitle === 'SHOW'
        ) {
          ctx.fillStyle = theme.TitleShadowColor;
          ctx.fillText(titleLabel, titleCenterX + 1, titleY + 1);
        }
        // Main text
        ctx.fillStyle = theme.TitleColor;
        ctx.fillText(titleLabel, titleCenterX, titleY);
      }
      ctx.restore();

      // 3. Draw Current Value Text
      const showValue =
        opt.ShowCurrentValue === 'SHOW' ||
        (opt.ShowCurrentValue === 'HOVER' && isMouseOver);

      if (showValue) {
        ctx.save();
        ctx.font = `${theme.CurrentValueFontStyle} ${theme.CurrentValueSize}px ${theme.CurrentValueFont}`;

        const valueText = opt.CurrentValueAsSummary
          ? counterData.summary.currentStringValue
          : counterData.subItems[0]?.currentStringValue || counterData.summary.currentStringValue;

        const valMetrics = ctx.measureText(valueText);
        const valW = valMetrics.width;
        const valH = theme.CurrentValueSize;

        let valY = valH + 2; // TOP
        if (opt.SummaryPosition === 'MIDDLE') {
          valY = maxH / 2 + valH / 2.5;
        } else if (opt.SummaryPosition === 'BOTTOM') {
          valY = maxH - 3;
        }

        const valCenterX = currentX + graphW / 2 - valW / 2;

        // Shadow
        if (
          (opt.ShowCurrentValue === 'HOVER' && opt.ShowCurrentValueShadowOnHover) ||
          isMouseOver ||
          opt.ShowCurrentValue === 'SHOW'
        ) {
          ctx.fillStyle = theme.TextShadowColor;
          ctx.fillText(valueText, valCenterX + 1, valY + 1);
        }
        // Main text
        ctx.fillStyle = theme.TextColor;
        ctx.fillText(valueText, valCenterX, valY);

        ctx.restore();
      }

      currentX += counterSlotWidth;
    });
  }, [options, theme, data, totalWidth, height, isHovered]);

  // Helper: Draw Single Graph
  const drawSingleGraph = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    inverted: boolean,
    info: { currentValue: number; maximumValue: number; history: number[] },
    theme: GraphTheme,
    colorIdx: number = 0
  ) => {
    if (!info || info.maximumValue <= 0) return;
    const history = info.history || [];
    const maxVal = info.maximumValue;

    // Fill polygon history area
    const startX = x + w - history.length;
    ctx.beginPath();

    if (inverted) {
      ctx.moveTo(startX, y);
      history.forEach((val, i) => {
        const barH = (val / maxVal) * h;
        ctx.lineTo(startX + i, y + barH);
      });
      ctx.lineTo(startX + history.length - 1, y);
    } else {
      ctx.moveTo(startX, y + h);
      history.forEach((val, i) => {
        const barH = (val / maxVal) * h;
        ctx.lineTo(startX + i, y + h - barH);
      });
      ctx.lineTo(startX + history.length - 1, y + h);
    }
    ctx.closePath();

    ctx.fillStyle = getNthGradientColor(theme.StackedColors, 2, colorIdx);
    ctx.fill();

    // Instantaneous bar at right (width 3-4px)
    const currentValH = Math.min(h, Math.max(0, (info.currentValue / maxVal) * h));
    ctx.fillStyle = theme.BarColor;
    if (inverted) {
      ctx.fillRect(x + w, y, 3, currentValH);
    } else {
      ctx.fillRect(x + w, y + h - currentValH, 3, currentValH);
    }
  };

  // Helper: Draw Stacked Graph
  const drawStackedGraph = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    inverted: boolean,
    infos: { currentValue: number; maximumValue: number; history: number[] }[],
    theme: GraphTheme
  ) => {
    if (!infos || infos.length === 0) return;
    const totalMax = infos.reduce((sum, item) => sum + (item.maximumValue || 1), 0);
    if (totalMax <= 0) return;

    // Accumulate history layers from bottom to top
    const historyLen = infos[0]?.history?.length || 0;
    const accumulated: number[][] = [];
    let running = new Array(historyLen).fill(0);

    for (let layer = 0; layer < infos.length; layer++) {
      const hist = infos[layer]?.history || [];
      const currentLayer = hist.map((v, idx) => v + (running[idx] || 0));
      accumulated.push(currentLayer);
      running = currentLayer;
    }

    // Draw from top layer downwards
    for (let layer = infos.length - 1; layer >= 0; layer--) {
      const hist = accumulated[layer];
      const startX = x + w - hist.length;
      ctx.beginPath();
      ctx.moveTo(startX, y + h);
      hist.forEach((val, i) => {
        const barH = (val / totalMax) * h;
        ctx.lineTo(startX + i, y + h - barH);
      });
      ctx.lineTo(startX + hist.length - 1, y + h);
      ctx.closePath();

      ctx.fillStyle = getNthGradientColor(theme.StackedColors, infos.length, layer);
      ctx.fill();
    }

    // Instantaneous stacked bar
    let curRunningH = 0;
    for (let layer = 0; layer < infos.length; layer++) {
      const layerValH = (infos[layer].currentValue / totalMax) * h;
      ctx.fillStyle = layer === 0 ? theme.BarColor : getNthGradientColor(theme.StackedColors, infos.length, layer);
      ctx.fillRect(x + w, y + h - curRunningH - layerValH, 3, layerValH);
      curRunningH += layerValH;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const counterIdx = Math.floor((x - 2) / counterSlotWidth);
    if (counterIdx >= 0 && counterIdx < activeCounters.length) {
      setHoveredCounter(activeCounters[counterIdx][0]);
    } else {
      setHoveredCounter(null);
    }
  };

  return (
    <div className={`relative inline-flex items-center group cursor-pointer ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: `${totalWidth}px`, height: `${height}px` }}
        className="rounded transition-all duration-150 hover:bg-white/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredCounter(null);
        }}
        onMouseMove={handleMouseMove}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu?.(e);
        }}
        onClick={(e) => {
          if (!previewMode) {
            onSettingsClick?.();
          }
        }}
      />

      {/* Tooltip on Hover showing deep telemetry */}
      {isHovered && hoveredCounter && data[hoveredCounter] && !previewMode && (
        <div
          style={{
            left: `${Math.min(window.innerWidth - 220, Math.max(10, mousePos.x - 60))}px`,
            bottom: `${height + 10}px`,
          }}
          className="absolute z-50 pointer-events-none bg-[#202020]/95 backdrop-blur-md border border-white/10 rounded-lg p-2.5 shadow-2xl text-xs text-white min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
            <span className="font-semibold text-sky-400">{data[hoveredCounter].label}</span>
            <span className="font-mono font-bold text-emerald-400">
              {data[hoveredCounter].summary.currentStringValue}
            </span>
          </div>

          <div className="space-y-1 text-slate-300">
            {data[hoveredCounter].subItems.map((sub, i) => (
              <div key={i} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">{sub.name}:</span>
                <span className="font-mono text-white">{sub.currentStringValue || sub.currentValue.toFixed(1)}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400 flex justify-between">
            <span>Peak: {Math.max(...data[hoveredCounter].summary.history).toFixed(1)}</span>
            <span>Avg: {(data[hoveredCounter].summary.history.reduce((a, b) => a + b, 0) / (data[hoveredCounter].summary.history.length || 1)).toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
