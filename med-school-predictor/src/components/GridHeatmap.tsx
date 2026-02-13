import { useRef, useEffect } from 'react';
import { getBaselineGrid } from '../lib/calculator';

interface GridHeatmapProps {
  userGpa: number | null;
  userMcat: number | null;
}

function rateToColor(rate: number | null): string {
  if (rate === null) return '#1a2332';
  const t = Math.min(rate / 85, 1);
  // Red (low) -> Yellow (mid) -> Green (high)
  const r = Math.round(t < 0.5 ? 220 : 220 - (t - 0.5) * 2 * 180);
  const g = Math.round(t < 0.5 ? t * 2 * 200 : 200);
  const b = Math.round(40);
  return `rgb(${r},${g},${b})`;
}

function getGpaIndex(gpa: number): number {
  if (gpa >= 3.80) return 0;
  if (gpa >= 3.60) return 1;
  if (gpa >= 3.40) return 2;
  if (gpa >= 3.20) return 3;
  if (gpa >= 3.00) return 4;
  if (gpa >= 2.80) return 5;
  if (gpa >= 2.60) return 6;
  if (gpa >= 2.40) return 7;
  if (gpa >= 2.20) return 8;
  if (gpa >= 2.00) return 9;
  return 10;
}

function getMcatIndex(mcat: number): number {
  if (mcat >= 518) return 9;
  if (mcat >= 514) return 8;
  if (mcat >= 510) return 7;
  if (mcat >= 506) return 6;
  if (mcat >= 502) return 5;
  if (mcat >= 498) return 4;
  if (mcat >= 494) return 3;
  if (mcat >= 490) return 2;
  if (mcat >= 486) return 1;
  return 0;
}

export default function GridHeatmap({ userGpa, userMcat }: GridHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { grid, gpaRanges, mcatRanges } = getBaselineGrid();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const labelLeft = 70;
    const labelTop = 50;
    const cellW = 52;
    const cellH = 36;
    const cols = mcatRanges.length;
    const rows = gpaRanges.length;
    const width = labelLeft + cols * cellW + 10;
    const height = labelTop + rows * cellH + 10;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0f1b2d';
    ctx.fillRect(0, 0, width, height);

    // Column labels (MCAT)
    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#829ab1';
    for (let c = 0; c < cols; c++) {
      ctx.fillText(mcatRanges[c], labelLeft + c * cellW + cellW / 2, labelTop - 8);
    }

    // Row labels (GPA)
    ctx.textAlign = 'right';
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = '#829ab1';
      ctx.fillText(gpaRanges[r], labelLeft - 8, labelTop + r * cellH + cellH / 2 + 3);
    }

    // Axis labels
    ctx.save();
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#9fb3c8';
    ctx.textAlign = 'center';
    ctx.fillText('MCAT Score', labelLeft + (cols * cellW) / 2, 12);
    ctx.translate(12, labelTop + (rows * cellH) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('GPA', 0, 0);
    ctx.restore();

    // Cells
    const userGpaIdx = userGpa !== null ? getGpaIndex(userGpa) : null;
    const userMcatIdx = userMcat !== null ? getMcatIndex(userMcat) : null;

    for (let r = 0; r < rows; r++) {
      const gpaKey = gpaRanges[r];
      const row = grid[gpaKey];
      if (!row) continue;

      for (let c = 0; c < cols; c++) {
        const mcatKey = mcatRanges[c];
        const cell = row[mcatKey];
        const rate = cell ? cell.acceptanceRate : null;

        const x = labelLeft + c * cellW;
        const y = labelTop + r * cellH;

        // Cell fill
        ctx.fillStyle = rateToColor(rate);
        ctx.fillRect(x, y, cellW - 1, cellH - 1);

        // Rate text
        if (rate !== null) {
          ctx.font = '10px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = rate > 50 ? '#0a1929' : '#d9e2ec';
          ctx.fillText(`${rate}%`, x + cellW / 2, y + cellH / 2 + 3);
        } else if (cell === null) {
          ctx.font = '10px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#486581';
          ctx.fillText('—', x + cellW / 2, y + cellH / 2 + 3);
        }

        // Highlight user's cell
        if (r === userGpaIdx && c === userMcatIdx) {
          ctx.strokeStyle = '#4fd1c5';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x - 1, y - 1, cellW + 1, cellH + 1);

          // Pulsing dot
          ctx.beginPath();
          ctx.arc(x + cellW / 2, y + cellH / 2 - 6, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#4fd1c5';
          ctx.fill();
        }
      }
    }
  }, [userGpa, userMcat, grid, gpaRanges, mcatRanges]);

  return (
    <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 overflow-x-auto">
      <h3 className="text-sm font-medium text-navy-300 uppercase tracking-wider mb-3">
        AAMC Table A-23 Grid
      </h3>
      <p className="text-xs text-navy-400 mb-4">
        National acceptance rates by GPA x MCAT. Your position is highlighted in teal.
      </p>
      <canvas ref={canvasRef} className="mx-auto" />
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-navy-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: rateToColor(5) }} />
          <span>&lt;10%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: rateToColor(25) }} />
          <span>~25%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: rateToColor(50) }} />
          <span>~50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: rateToColor(75) }} />
          <span>75%+</span>
        </div>
      </div>
    </div>
  );
}
