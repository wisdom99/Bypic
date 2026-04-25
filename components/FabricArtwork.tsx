import type { Heritage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FabricArtworkProps {
  palette: string[];
  heritage: Heritage;
  seed?: string;
  className?: string;
  rounded?: boolean;
}

/**
 * Renders a procedural SVG fabric artwork from a palette + heritage.
 * Designed so the prototype never relies on external image hosting,
 * and each heritage has a visually distinct, recognisable signature
 * inspired by real Adire, Ankara, Aso-oke, Akwete, Kente and lace.
 */
export function FabricArtwork({
  palette,
  heritage,
  seed = "0",
  className,
  rounded = false,
}: FabricArtworkProps) {
  const colors = ensureFive(palette);
  const id = stableId(seed + heritage);

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", rounded && "rounded-2xl", className)}
      role="img"
      aria-label={`${heritage} fabric artwork`}
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="55%" stopColor={shade(colors[0], -0.06)} />
          <stop offset="100%" stopColor={shade(colors[0], -0.14)} />
        </linearGradient>
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed={hashSeed(seed)} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.07 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id={`vignette-${id}`} cx="50%" cy="50%" r="75%">
          <stop offset="60%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="500" fill={`url(#bg-${id})`} />
      {renderHeritage(heritage, colors, id, seed)}
      <rect x="0" y="0" width="400" height="500" filter={`url(#grain-${id})`} opacity="0.65" />
      <rect
        x="0"
        y="0"
        width="400"
        height="500"
        fill={`url(#vignette-${id})`}
        opacity="0.55"
      />
    </svg>
  );
}

function ensureFive(palette: string[]): string[] {
  const list = [...palette];
  while (list.length < 5) list.push(palette[list.length % palette.length] ?? "#161513");
  return list.slice(0, 5);
}

function stableId(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 9999);
}

function rng(seed: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0;
  if (s === 0) s = 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Round to 3 decimals so trig-derived coordinates serialise identically on
 *  server and client, preventing SSR/CSR hydration mismatches. */
function r3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Mix-and-shade helpers (work on hex). */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex);
  const k = 1 + amt;
  return rgbToHex(r * k, g * k, b * k);
}

function renderHeritage(
  heritage: Heritage,
  c: string[],
  id: string,
  seed: string,
): React.ReactNode {
  switch (heritage) {
    case "Adire":
      return <AdirePattern colors={c} id={id} seed={seed} />;
    case "Ankara":
      return <AnkaraPattern colors={c} id={id} seed={seed} />;
    case "Aso-oke":
      return <AsoOkePattern colors={c} seed={seed} />;
    case "Akwete":
      return <AkwetePattern colors={c} />;
    case "Kente":
      return <KentePattern colors={c} />;
    case "Lace":
      return <LacePattern colors={c} id={id} />;
    case "Cotton":
      return <CottonPattern colors={c} seed={seed} />;
    case "Linen":
      return <LinenPattern colors={c} />;
    default:
      return null;
  }
}

/* -------------------- Adire: indigo resist on cream  -------------------- */

function AdirePattern({
  colors,
  id,
  seed,
}: {
  colors: string[];
  id: string;
  seed: string;
}) {
  const rand = rng(seed + "adire");
  const resist = pickLight(colors);
  const accent = pickAccent(colors, resist);

  // Grid of "ibadandun" cells, each filled with a different resist motif.
  const cols = 4;
  const rows = 5;
  const cellW = 400 / cols;
  const cellH = 500 / rows;
  const cells: React.ReactNode[] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let cIdx = 0; cIdx < cols; cIdx++) {
      const variant = Math.floor(rand() * 4);
      const cx = cIdx * cellW + cellW / 2;
      const cy = r * cellH + cellH / 2;
      const motif = adireMotif(variant, cx, cy, cellW, cellH, resist, accent);
      cells.push(<g key={`cell-${i++}`}>{motif}</g>);
    }
  }

  // Bleed/halo behind the grid for hand-dyed feel.
  const halos = Array.from({ length: 6 }).map((_, k) => (
    <circle
      key={`halo-${k}`}
      cx={rand() * 400}
      cy={rand() * 500}
      r={70 + rand() * 60}
      fill={colors[1]}
      opacity={0.18}
      filter={`url(#blur-${id})`}
    />
  ));

  return (
    <>
      <defs>
        <filter id={`blur-${id}`}>
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      {halos}
      {/* Faint stencil grid lines */}
      <g stroke={resist} strokeWidth="0.6" opacity="0.18">
        {Array.from({ length: cols + 1 }).map((_, k) => (
          <line key={`gv-${k}`} x1={k * cellW} y1="0" x2={k * cellW} y2="500" />
        ))}
        {Array.from({ length: rows + 1 }).map((_, k) => (
          <line key={`gh-${k}`} x1="0" y1={k * cellH} x2="400" y2={k * cellH} />
        ))}
      </g>
      {cells}
    </>
  );
}

function adireMotif(
  variant: number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  resist: string,
  accent: string,
): React.ReactNode {
  const r = Math.min(w, h) * 0.36;
  const stroke = { stroke: resist, strokeWidth: 1.4, fill: "none", opacity: 0.85 };
  switch (variant) {
    case 0: {
      // Concentric rings (tie-dye)
      return (
        <g>
          {[r, r * 0.75, r * 0.5, r * 0.25].map((rr, i) => (
            <circle key={i} cx={cx} cy={cy} r={rr} {...stroke} />
          ))}
          <circle cx={cx} cy={cy} r="2.5" fill={accent} />
        </g>
      );
    }
    case 1: {
      // Eight-point starburst
      const pts: string[] = [];
      for (let a = 0; a < 16; a++) {
        const ang = (a / 16) * Math.PI * 2;
        const len = a % 2 === 0 ? r : r * 0.45;
        pts.push(`${r3(cx + Math.cos(ang) * len)},${r3(cy + Math.sin(ang) * len)}`);
      }
      return (
        <g>
          <polygon points={pts.join(" ")} {...stroke} />
          <circle cx={cx} cy={cy} r={r3(r * 0.18)} fill={resist} opacity="0.55" />
        </g>
      );
    }
    case 2: {
      // 3×3 dot grid (eleko stencil)
      const dots: React.ReactNode[] = [];
      for (let yi = -1; yi <= 1; yi++) {
        for (let xi = -1; xi <= 1; xi++) {
          dots.push(
            <circle
              key={`d-${yi}-${xi}`}
              cx={cx + xi * (r * 0.6)}
              cy={cy + yi * (r * 0.6)}
              r={r * 0.13}
              fill={resist}
              opacity={(xi + yi) % 2 === 0 ? 0.85 : 0.45}
            />,
          );
        }
      }
      return <g>{dots}</g>;
    }
    default: {
      // Half-moon / leaf "moon-adire" motif
      return (
        <g>
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            {...stroke}
          />
          <path
            d={`M ${cx - r * 0.6} ${cy} A ${r * 0.6} ${r * 0.6} 0 0 1 ${cx + r * 0.6} ${cy}`}
            {...stroke}
          />
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} {...stroke} />
          <circle cx={cx} cy={cy + r * 0.4} r="2" fill={accent} />
        </g>
      );
    }
  }
}

/* -------------------- Ankara: bold wax-print silhouettes -------------------- */

function AnkaraPattern({
  colors,
  id,
  seed,
}: {
  colors: string[];
  id: string;
  seed: string;
}) {
  const rand = rng(seed + "ankara");
  // Big repeating "Vlisco eye": concentric scalloped petals
  const eyes: React.ReactNode[] = [];
  const positions = [
    { x: 110, y: 130 },
    { x: 290, y: 90 },
    { x: 90, y: 320 },
    { x: 300, y: 290 },
    { x: 200, y: 460 },
  ];
  positions.forEach((p, i) => {
    const radius = 70 + rand() * 30;
    eyes.push(<VliscoEye key={`eye-${i}`} cx={p.x} cy={p.y} r={radius} colors={colors} variant={i % 3} />);
  });

  // Background scattered seed dots and crackle lines (wax craquelure)
  const cracks = Array.from({ length: 14 }).map((_, i) => {
    const x1 = rand() * 400;
    const y1 = rand() * 500;
    const x2 = x1 + (rand() - 0.5) * 90;
    const y2 = y1 + (rand() - 0.5) * 90;
    return (
      <line
        key={`crack-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colors[3]}
        strokeWidth="0.7"
        opacity="0.35"
      />
    );
  });

  return (
    <g>
      {cracks}
      {eyes}
    </g>
  );
}

function VliscoEye({
  cx,
  cy,
  r,
  colors,
  variant,
}: {
  cx: number;
  cy: number;
  r: number;
  colors: string[];
  variant: number;
}) {
  const petals = 12;
  const ring1: string[] = [];
  const ring2: string[] = [];
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const x1 = r3(cx + Math.cos(a) * r);
    const y1 = r3(cy + Math.sin(a) * r);
    const x2 = r3(cx + Math.cos(a + Math.PI / petals) * r * 0.78);
    const y2 = r3(cy + Math.sin(a + Math.PI / petals) * r * 0.78);
    ring1.push(`${x1},${y1}`);
    ring2.push(`${x2},${y2}`);
  }
  const points: string[] = [];
  for (let i = 0; i < petals; i++) {
    points.push(ring1[i]);
    points.push(ring2[i]);
  }
  // Most contrasting colour against the background → outer petal
  const fillA = pickContrast(colors[0], colors);
  // A different palette colour → middle ring; falls back to a contrast tone.
  const fillB = pickContrast(fillA, colors.filter((c) => c !== fillA).concat(colors[3]));
  // Inner core picks an accent that's neither bg nor petal
  const fillC = pickAccent(colors, fillA) ?? colors[1];

  return (
    <g>
      {/* Outer scalloped petal */}
      <polygon points={points.join(" ")} fill={fillA} opacity="0.92" />
      {/* Middle ring */}
      <circle cx={cx} cy={cy} r={r3(r * 0.62)} fill={fillB} opacity="0.95" />
      {/* Inner core */}
      {variant === 0 && <circle cx={cx} cy={cy} r={r3(r * 0.32)} fill={fillC} />}
      {variant === 1 && (
        <>
          <circle cx={cx} cy={cy} r={r3(r * 0.32)} fill={fillC} />
          <circle cx={cx} cy={cy} r={r3(r * 0.18)} fill={fillA} />
        </>
      )}
      {variant === 2 && (
        <g>
          <circle cx={cx} cy={cy} r={r3(r * 0.34)} fill={fillC} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={r3(cx + Math.cos(a) * r * 0.34)}
                cy={r3(cy + Math.sin(a) * r * 0.34)}
                r={r3(r * 0.07)}
                fill={fillA}
                opacity="0.85"
              />
            );
          })}
        </g>
      )}
      {/* Spoke radii */}
      <g stroke={fillC} strokeWidth="1.2" opacity="0.55">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={r3(cx + Math.cos(a) * r * 0.35)}
              y1={r3(cy + Math.sin(a) * r * 0.35)}
              x2={r3(cx + Math.cos(a) * r * 0.6)}
              y2={r3(cy + Math.sin(a) * r * 0.6)}
            />
          );
        })}
      </g>
    </g>
  );
}

/* -------------------- Aso-oke: strip-loom warp + weft  -------------------- */

function AsoOkePattern({
  colors,
  seed,
}: {
  colors: string[];
  seed: string;
}) {
  const rand = rng(seed + "asooke");
  const stripCount = 3;
  const stripW = 400 / stripCount;
  const items: React.ReactNode[] = [];
  // Pick a metallic / contrast thread automatically — gold for dark bases,
  // deep wine for light bases.
  const baseL = relativeLuminance(colors[0]);
  const metal = baseL < 0.45 ? "#d9c089" : "#3a1e1e";
  const wide = baseL < 0.45 ? colors[2] || metal : shade(colors[0], -0.35);

  // Vertical strip seams (slightly darker base, with a thin gap line)
  for (let s = 0; s < stripCount; s++) {
    const tone = s % 2 === 0 ? shade(colors[0], -0.06) : shade(colors[0], 0.04);
    items.push(
      <rect
        key={`strip-${s}`}
        x={s * stripW}
        y={0}
        width={stripW}
        height={500}
        fill={tone}
      />,
    );
  }
  // Strip seams
  for (let s = 1; s < stripCount; s++) {
    items.push(
      <line
        key={`seam-${s}`}
        x1={s * stripW}
        y1={0}
        x2={s * stripW}
        y2={500}
        stroke={shade(colors[0], -0.25)}
        strokeWidth="2"
      />,
    );
  }
  // Horizontal pinstripes (warp threads). Cluster densely in places.
  let y = 0;
  let i = 0;
  while (y < 500) {
    const isWide = i % 11 === 0;
    const isMetal = i % 5 === 0;
    const h = isWide ? 6 + rand() * 6 : 1.4;
    const fill = isWide ? wide : isMetal ? metal : shade(colors[0], 0.1);
    items.push(
      <rect
        key={`hs-${i}`}
        x="0"
        y={y}
        width="400"
        height={h}
        fill={fill}
        opacity={isWide ? 0.95 : isMetal ? 0.85 : 0.55}
      />,
    );
    y += h + (isWide ? 8 + rand() * 6 : 3);
    i++;
  }
  // Diamond/lozenge motifs on a couple of bands (shuku) — in metal accent
  const motifBands = [180, 360];
  motifBands.forEach((by, bi) => {
    for (let mx = 30; mx < 400; mx += 60) {
      items.push(
        <polygon
          key={`dm-${bi}-${mx}`}
          points={`${mx},${by} ${mx + 14},${by + 12} ${mx},${by + 24} ${mx - 14},${by + 12}`}
          fill="none"
          stroke={metal}
          strokeWidth="1.4"
          opacity="0.85"
        />,
      );
      items.push(
        <circle key={`dmd-${bi}-${mx}`} cx={mx} cy={by + 12} r="2" fill={metal} opacity="0.7" />,
      );
    }
  });

  return <g>{items}</g>;
}

/* -------------------- Akwete: diamond-and-stripe Igbo weave -------------------- */

function AkwetePattern({ colors }: { colors: string[] }) {
  const items: React.ReactNode[] = [];
  const cols = 6;
  const colW = 400 / cols;
  // Two alternating column tones — one slightly darker, one slightly lighter
  const colA = shade(colors[0], -0.05);
  const colB = colors[1] || shade(colors[0], 0.08);
  for (let c = 0; c < cols; c++) {
    items.push(
      <rect
        key={`col-${c}`}
        x={c * colW}
        y={0}
        width={colW}
        height={500}
        fill={c % 2 === 0 ? colA : colB}
      />,
    );
  }
  const diamond = pickContrast(colors[0], colors);
  const diamondInner = pickAccent(colors, diamond);
  // Diamond motifs in alternating columns
  for (let c = 0; c < cols; c++) {
    const isMotif = c % 2 === 1;
    if (!isMotif) continue;
    for (let y = 30; y < 500; y += 70) {
      const cx = c * colW + colW / 2;
      const cy = y;
      const r = 18;
      items.push(
        <g key={`d-${c}-${y}`}>
          <polygon
            points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
            fill={diamond}
            opacity="0.95"
          />
          <polygon
            points={`${cx},${cy - r * 0.55} ${cx + r * 0.55},${cy} ${cx},${cy + r * 0.55} ${cx - r * 0.55},${cy}`}
            fill={diamondInner}
            opacity="0.9"
          />
        </g>,
      );
    }
  }
  // Decorative horizontal banded zigzag every 100px in the contrast tone
  for (let y = 70; y < 500; y += 100) {
    const zig: string[] = [];
    for (let x = 0; x <= 400; x += 20) {
      const offset = (x / 20) % 2 === 0 ? 0 : 8;
      zig.push(`${x},${y + offset}`);
    }
    items.push(
      <polyline
        key={`zz-${y}`}
        points={zig.join(" ")}
        fill="none"
        stroke={diamond}
        strokeWidth="1.4"
        opacity="0.6"
      />,
    );
  }
  return <g>{items}</g>;
}

/* -------------------- Kente: blocked warp/weft color grid -------------------- */

function KentePattern({ colors }: { colors: string[] }) {
  const items: React.ReactNode[] = [];
  const blockW = 80;
  const blockH = 65;
  let i = 0;
  for (let y = 0; y < 500; y += blockH) {
    for (let x = 0; x < 400; x += blockW) {
      const isWarpFaced = (Math.floor(x / blockW) + Math.floor(y / blockH)) % 2 === 0;
      const baseColor = colors[i % colors.length];
      items.push(
        <rect key={`b-${x}-${y}`} x={x} y={y} width={blockW} height={blockH} fill={baseColor} />,
      );
      if (isWarpFaced) {
        // Vertical fine stripes (warp-faced)
        for (let sx = x + 4; sx < x + blockW; sx += 8) {
          items.push(
            <line
              key={`v-${sx}-${y}`}
              x1={sx}
              y1={y}
              x2={sx}
              y2={y + blockH}
              stroke={colors[(i + 2) % colors.length]}
              strokeWidth="2"
              opacity="0.75"
            />,
          );
        }
      } else {
        // Horizontal weft-faced with chevron motif
        for (let sy = y + 4; sy < y + blockH; sy += 8) {
          items.push(
            <line
              key={`h-${x}-${sy}`}
              x1={x}
              y1={sy}
              x2={x + blockW}
              y2={sy}
              stroke={colors[(i + 3) % colors.length]}
              strokeWidth="2"
              opacity="0.7"
            />,
          );
        }
        items.push(
          <polygon
            key={`chev-${x}-${y}`}
            points={`${x + 12},${y + blockH / 2} ${x + blockW / 2},${y + 8} ${x + blockW - 12},${y + blockH / 2} ${x + blockW / 2},${y + blockH - 8}`}
            fill="none"
            stroke={colors[(i + 4) % colors.length]}
            strokeWidth="2"
            opacity="0.85"
          />,
        );
      }
      i++;
    }
  }
  return <g>{items}</g>;
}

/* -------------------- Lace: scalloped openwork medallions -------------------- */

function LacePattern({ colors, id }: { colors: string[]; id: string }) {
  const items: React.ReactNode[] = [];
  const stroke = pickLight(colors);
  // Background tone on top of the base gradient
  items.push(<rect key="ovr" width="400" height="500" fill={colors[0]} opacity="0.5" />);
  // Floral medallions
  const cellW = 100;
  const cellH = 100;
  for (let y = 0; y < 500 + cellH; y += cellH) {
    for (let x = 0; x < 400 + cellW; x += cellW) {
      const cx = x + cellW / 2 + ((y / cellH) % 2 === 0 ? 0 : cellW / 2);
      const cy = y + cellH / 2;
      // Petals
      for (let p = 0; p < 8; p++) {
        const a = (p / 8) * Math.PI * 2;
        const px = r3(cx + Math.cos(a) * 22);
        const py = r3(cy + Math.sin(a) * 22);
        const angDeg = r3((a * 180) / Math.PI);
        items.push(
          <ellipse
            key={`pe-${x}-${y}-${p}`}
            cx={px}
            cy={py}
            rx={9}
            ry={5}
            transform={`rotate(${angDeg} ${px} ${py})`}
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            opacity="0.75"
          />,
        );
      }
      // Inner ring
      items.push(
        <circle
          key={`ic-${x}-${y}`}
          cx={cx}
          cy={cy}
          r="7"
          fill="none"
          stroke={stroke}
          strokeWidth="1"
          opacity="0.85"
        />,
      );
      // Connecting filaments
      items.push(
        <path
          key={`f-${x}-${y}`}
          d={`M ${cx - cellW / 2} ${cy} Q ${cx} ${cy - 8} ${cx + cellW / 2} ${cy}`}
          fill="none"
          stroke={stroke}
          strokeWidth="0.6"
          opacity="0.45"
        />,
      );
    }
  }
  return (
    <>
      <defs>
        <filter id={`lace-soft-${id}`}>
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>
      <g filter={`url(#lace-soft-${id})`}>{items}</g>
    </>
  );
}

/* -------------------- Cotton: hand-loomed plain weave -------------------- */

function CottonPattern({
  colors,
  seed,
}: {
  colors: string[];
  seed: string;
}) {
  const rand = rng(seed + "cotton");
  const items: React.ReactNode[] = [];
  // Subtle plain-weave warp + weft
  for (let y = 0; y < 500; y += 6) {
    items.push(
      <line
        key={`h-${y}`}
        x1="0"
        y1={y}
        x2="400"
        y2={y}
        stroke={shade(colors[0], -0.05)}
        strokeWidth="0.6"
        opacity="0.45"
      />,
    );
  }
  for (let x = 0; x < 400; x += 6) {
    items.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1="0"
        x2={x}
        y2="500"
        stroke={shade(colors[0], 0.05)}
        strokeWidth="0.6"
        opacity="0.4"
      />,
    );
  }
  // Slubs
  for (let i = 0; i < 80; i++) {
    items.push(
      <line
        key={`sl-${i}`}
        x1={rand() * 400}
        y1={rand() * 500}
        x2={rand() * 400 + 8}
        y2={rand() * 500}
        stroke={colors[2]}
        strokeWidth="1.1"
        opacity={0.25 + rand() * 0.4}
      />,
    );
  }
  // A couple of soft warm bands (kola-dyed effect)
  for (let i = 0; i < 3; i++) {
    const y = rand() * 500;
    items.push(
      <rect
        key={`band-${i}`}
        x="0"
        y={y}
        width="400"
        height={20 + rand() * 20}
        fill={colors[3]}
        opacity="0.18"
      />,
    );
  }
  return <g>{items}</g>;
}

/* -------------------- Linen: airy crosshatch -------------------- */

function LinenPattern({ colors }: { colors: string[] }) {
  const items: React.ReactNode[] = [];
  for (let y = 0; y < 500; y += 4) {
    items.push(
      <line
        key={`h-${y}`}
        x1="0"
        y1={y}
        x2="400"
        y2={y}
        stroke={colors[3]}
        strokeWidth="0.5"
        opacity="0.16"
      />,
    );
  }
  for (let x = 0; x < 400; x += 4) {
    items.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1="0"
        x2={x}
        y2="500"
        stroke={colors[1]}
        strokeWidth="0.5"
        opacity="0.16"
      />,
    );
  }
  // A few wider warm threads
  for (let i = 0; i < 6; i++) {
    const x = (i / 6) * 400 + 20;
    items.push(
      <line
        key={`th-${i}`}
        x1={x}
        y1="0"
        x2={x}
        y2="500"
        stroke={colors[2]}
        strokeWidth="1.2"
        opacity="0.4"
      />,
    );
  }
  return <g>{items}</g>;
}

/* -------------------- Helpers -------------------- */

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function pickLight(colors: string[]): string {
  let best = colors[0];
  let bestL = relativeLuminance(colors[0]);
  for (const c of colors) {
    const l = relativeLuminance(c);
    if (l > bestL) {
      bestL = l;
      best = c;
    }
  }
  return bestL < 0.5 ? "#f3ead2" : best;
}

function pickAccent(colors: string[], avoid: string): string {
  for (const c of colors) {
    if (c.toLowerCase() !== avoid.toLowerCase()) return c;
  }
  return colors[0];
}

/** Pick the palette colour with the highest luminance distance from `against`.
 *  Falls back to a cream/charcoal so motifs always read on flat palettes. */
function pickContrast(against: string, colors: string[]): string {
  const targetL = relativeLuminance(against);
  let best = colors[0];
  let bestDelta = 0;
  for (const c of colors) {
    const d = Math.abs(relativeLuminance(c) - targetL);
    if (d > bestDelta) {
      bestDelta = d;
      best = c;
    }
  }
  if (bestDelta < 0.18) {
    return targetL < 0.5 ? "#f3ead2" : "#1a1714";
  }
  return best;
}
