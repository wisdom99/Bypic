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
 * Built so the prototype never relies on external image hosting.
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
          <stop offset="55%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[3]} />
        </linearGradient>
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect
        x="0"
        y="0"
        width="400"
        height="500"
        fill={`url(#bg-${id})`}
      />
      {renderHeritage(heritage, colors, id, seed)}
      <rect
        x="0"
        y="0"
        width="400"
        height="500"
        filter={`url(#grain-${id})`}
        opacity="0.7"
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

function rng(seed: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
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
      return <AsoOkePattern colors={c} />;
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
  const blobs = Array.from({ length: 18 }).map((_, i) => ({
    cx: rand() * 400,
    cy: rand() * 500,
    r: 30 + rand() * 70,
    fill: colors[i % 3],
    opacity: 0.18 + rand() * 0.18,
  }));
  return (
    <>
      <g filter={`url(#blur-${id})`}>
        {blobs.map((b, i) => (
          <circle key={i} {...b} />
        ))}
      </g>
      <defs>
        <filter id={`blur-${id}`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {Array.from({ length: 14 }).map((_, i) => (
        <circle
          key={`s-${i}`}
          cx={rand() * 400}
          cy={rand() * 500}
          r={2 + rand() * 4}
          fill={colors[4]}
          opacity={0.6}
        />
      ))}
    </>
  );
}

function AnkaraPattern({
  colors,
  seed,
}: {
  colors: string[];
  id: string;
  seed: string;
}) {
  const rand = rng(seed + "ankara");
  const tile = 80;
  const cells = [];
  for (let y = 0; y < 500 + tile; y += tile) {
    for (let x = 0; x < 400 + tile; x += tile) {
      const variant = Math.floor(rand() * 4);
      cells.push({ x, y, variant });
    }
  }
  return (
    <g>
      {cells.map((cell, i) => (
        <g key={i} transform={`translate(${cell.x} ${cell.y})`}>
          {cell.variant === 0 && (
            <circle cx={tile / 2} cy={tile / 2} r={tile / 3} fill={colors[2]} opacity="0.5" />
          )}
          {cell.variant === 1 && (
            <path
              d={`M ${tile / 2} 5 L ${tile - 5} ${tile - 5} L 5 ${tile - 5} Z`}
              fill={colors[3]}
              opacity="0.45"
            />
          )}
          {cell.variant === 2 && (
            <rect x={tile / 4} y={tile / 4} width={tile / 2} height={tile / 2} fill={colors[1]} opacity="0.4" transform={`rotate(45 ${tile / 2} ${tile / 2})`} />
          )}
          {cell.variant === 3 && (
            <g stroke={colors[2]} strokeWidth="3" fill="none" opacity="0.55">
              <path d={`M 0 ${tile / 2} Q ${tile / 2} 0 ${tile} ${tile / 2}`} />
              <path d={`M 0 ${tile / 2} Q ${tile / 2} ${tile} ${tile} ${tile / 2}`} />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

function AsoOkePattern({ colors }: { colors: string[] }) {
  const stripes = [];
  let y = 0;
  let i = 0;
  while (y < 500) {
    const h = 18 + ((i * 7) % 22);
    const fill = colors[i % colors.length];
    stripes.push(<rect key={i} x="0" y={y} width="400" height={h} fill={fill} />);
    if (i % 3 === 0) {
      stripes.push(
        <rect
          key={`m-${i}`}
          x="0"
          y={y + h - 2}
          width="400"
          height="2"
          fill={colors[3]}
          opacity="0.6"
        />,
      );
    }
    y += h;
    i++;
  }
  return <g>{stripes}</g>;
}

function AkwetePattern({ colors }: { colors: string[] }) {
  const cell = 50;
  const items: React.ReactNode[] = [];
  for (let y = 0; y < 500; y += cell) {
    for (let x = 0; x < 400; x += cell) {
      const isAlt = ((x / cell + y / cell) % 2) === 0;
      const fill = isAlt ? colors[2] : colors[1];
      items.push(
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <rect width={cell} height={cell} fill={fill} opacity="0.85" />
          <path
            d={`M 0 ${cell / 2} L ${cell / 2} 0 L ${cell} ${cell / 2} L ${cell / 2} ${cell} Z`}
            fill={colors[0]}
            opacity="0.55"
          />
          <circle cx={cell / 2} cy={cell / 2} r="3" fill={colors[3]} opacity="0.7" />
        </g>,
      );
    }
  }
  return <g>{items}</g>;
}

function KentePattern({ colors }: { colors: string[] }) {
  const cell = 40;
  const blocks: React.ReactNode[] = [];
  let i = 0;
  for (let y = 0; y < 500; y += cell) {
    for (let x = 0; x < 400; x += cell) {
      const fill = colors[(i + Math.floor(y / cell)) % colors.length];
      blocks.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={cell} height={cell} fill={fill} />,
      );
      if (i % 2 === 0) {
        blocks.push(
          <rect
            key={`o-${x}-${y}`}
            x={x + 6}
            y={y + 6}
            width={cell - 12}
            height={cell - 12}
            fill="none"
            stroke={colors[3]}
            strokeWidth="2"
            opacity="0.5"
          />,
        );
      }
      i++;
    }
  }
  return <g>{blocks}</g>;
}

function LacePattern({ colors, id }: { colors: string[]; id: string }) {
  const dots: React.ReactNode[] = [];
  for (let y = 20; y < 500; y += 32) {
    for (let x = 20; x < 400; x += 32) {
      dots.push(
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="6"
          fill="none"
          stroke={colors[3]}
          strokeWidth="1.2"
          opacity="0.65"
        />,
      );
      dots.push(
        <circle
          key={`d-${x}-${y}`}
          cx={x + 16}
          cy={y + 16}
          r="2"
          fill={colors[3]}
          opacity="0.7"
        />,
      );
    }
  }
  return (
    <>
      <rect width="400" height="500" fill={colors[0]} opacity="0.55" />
      <g filter={`url(#soft-${id})`}>{dots}</g>
      <defs>
        <filter id={`soft-${id}`}>
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
    </>
  );
}

function CottonPattern({ colors, seed }: { colors: string[]; seed: string }) {
  const rand = rng(seed + "cotton");
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 220; i++) {
    const y = rand() * 500;
    const len = 20 + rand() * 60;
    const x = rand() * 400;
    lines.push(
      <line
        key={i}
        x1={x}
        y1={y}
        x2={x + len}
        y2={y}
        stroke={colors[2]}
        strokeWidth="1"
        opacity={0.25 + rand() * 0.4}
      />,
    );
  }
  return <g>{lines}</g>;
}

function LinenPattern({ colors }: { colors: string[] }) {
  const lines: React.ReactNode[] = [];
  for (let y = 0; y < 500; y += 4) {
    lines.push(
      <line
        key={`h-${y}`}
        x1="0"
        y1={y}
        x2="400"
        y2={y}
        stroke={colors[3]}
        strokeWidth="0.5"
        opacity="0.18"
      />,
    );
  }
  for (let x = 0; x < 400; x += 4) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1="0"
        x2={x}
        y2="500"
        stroke={colors[1]}
        strokeWidth="0.5"
        opacity="0.18"
      />,
    );
  }
  return <g>{lines}</g>;
}
