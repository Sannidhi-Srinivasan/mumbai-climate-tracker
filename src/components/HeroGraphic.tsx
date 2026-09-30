// A standalone banner graphic — a Mumbai skyline (Art Deco-stepped towers mixed
// with taller BKC-style glass ones, a few lit windows for a dusk feel) above a
// layered coastline, with the Worli Sea Link's cable-stay mast in between. It
// sits in its own strip above the title now, rather than behind the text, so it
// can carry more detail without ever competing with what people need to read.

type Building = { x: number; width: number; height: number; step?: boolean; lit?: boolean };

const BUILDINGS: Building[] = [
  { x: 20, width: 34, height: 90 },
  { x: 60, width: 26, height: 140, step: true },
  { x: 92, width: 40, height: 70 },
  { x: 138, width: 22, height: 115, lit: true },
  { x: 166, width: 30, height: 60 },
  { x: 200, width: 24, height: 55 },
  { x: 228, width: 30, height: 85, lit: true },
  { x: 262, width: 20, height: 65 },
  { x: 286, width: 34, height: 100, step: true },
  { x: 324, width: 22, height: 70, lit: true },
  { x: 350, width: 26, height: 50 },
  { x: 830, width: 28, height: 80 },
  { x: 864, width: 20, height: 150, lit: true },
  { x: 890, width: 36, height: 105 },
  { x: 932, width: 26, height: 190, step: true, lit: true },
  { x: 964, width: 34, height: 65 },
  { x: 1004, width: 22, height: 130, lit: true },
  { x: 1032, width: 30, height: 95 },
  { x: 1068, width: 18, height: 160, step: true },
];

const GROUND_Y = 205;

function buildingPath({ x, width, height, step }: Building): string {
  const top = GROUND_Y - height;
  if (!step) {
    return `M${x} ${GROUND_Y} V${top} h${width} V${GROUND_Y} Z`;
  }
  const notchW = width * 0.35;
  const notchH = height * 0.14;
  return `M${x} ${GROUND_Y} V${top + notchH} h${notchW} V${top} h${width - notchW} V${GROUND_Y} Z`;
}

// One cable-stay pylon: an A-frame (twin legs meeting at an apex, like the
// Sea Link's real towers) with cables sagging in gentle curves down to the
// deck on either side.
function Pylon({
  x,
  apexY,
  deckY,
  legSpread,
  cables,
}: {
  x: number;
  apexY: number;
  deckY: number;
  legSpread: number;
  cables: { startY: number; target: number }[];
}) {
  const legWidth = legSpread > 15 ? 3 : 2;
  return (
    <g stroke="currentColor" fill="none" strokeLinecap="round">
      <path d={`M${x - legSpread} ${deckY} L${x} ${apexY} L${x + legSpread} ${deckY}`} strokeWidth={legWidth} />
      <circle cx={x} cy={apexY} r={legWidth} fill="currentColor" stroke="none" />
      {cables.map(({ startY, target }, i) => (
        <path
          key={i}
          d={`M${x} ${startY} Q ${(x + target) / 2} ${Math.max(startY, deckY) + 16}, ${target} ${deckY}`}
          strokeWidth="1.2"
        />
      ))}
    </g>
  );
}

function windowDots({ x, width, height, lit }: Building) {
  if (!lit) return null;
  const top = GROUND_Y - height;
  const cols = Math.max(2, Math.round(width / 9));
  const rows = Math.max(3, Math.round(height / 16));
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 3 === 0) continue;
      dots.push(
        <rect
          key={`${r}-${c}`}
          x={x + 4 + c * (width / cols)}
          y={top + 8 + r * (height / rows)}
          width={2.2}
          height={3}
          fill="currentColor"
          className="text-amber-300/70 dark:text-amber-200/80"
        />,
      );
    }
  }
  return <g>{dots}</g>;
}

export function HeroGraphic() {
  return (
    <svg
      viewBox="0 0 1200 280"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="pointer-events-none h-full w-full text-foreground/[.32] dark:text-foreground/[.34]"
    >
      <defs>
        {/* Tailwind's fuchsia-300, written directly since gradient stops can't use Tailwind classes */}
        <radialGradient id="dusk-glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="600" cy="70" rx="420" ry="140" fill="url(#dusk-glow)" />

      {/* skyline, spanning both edges with a gap in the middle for the bridge */}
      <g fill="currentColor">
        {BUILDINGS.map((b, i) => (
          <path key={i} d={buildingPath(b)} />
        ))}
      </g>
      {BUILDINGS.map((b, i) => (
        <g key={`w-${i}`}>{windowDots(b)}</g>
      ))}

      {/* Worli Sea Link: a single central A-frame pylon with cables sagging to
          a doubled deck rail with lamp-post ticks. The deck runs almost to
          both building clusters so the skyline reads as continuous. */}
      <g className="text-foreground/[.45] dark:text-foreground/[.5]">
        <Pylon
          x={600}
          apexY={48}
          deckY={GROUND_Y}
          legSpread={22}
          cables={[
            { startY: 68, target: 320 },
            { startY: 85, target: 380 },
            { startY: 102, target: 440 },
            { startY: 119, target: 500 },
            { startY: 136, target: 555 },
            { startY: 68, target: 880 },
            { startY: 85, target: 820 },
            { startY: 102, target: 760 },
            { startY: 119, target: 700 },
            { startY: 136, target: 645 },
          ]}
        />

        {/* deck: two parallel rails plus lamp-post ticks for scale */}
        <path d={`M205 ${GROUND_Y} H905`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path
          d={`M205 ${GROUND_Y - 5} H905`}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        {Array.from({ length: 24 }, (_, i) => 215 + i * 30).map((tx) => (
          <path key={tx} d={`M${tx} ${GROUND_Y - 5} V${GROUND_Y - 11}`} stroke="currentColor" strokeWidth="1.2" />
        ))}
      </g>

      {/* coastline meeting the sea: layered, more pronounced curves for depth */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M0 214 C 90 190, 180 238, 280 208 S 460 178, 560 218 S 700 246, 820 206 S 1000 176, 1200 212"
          stroke="currentColor"
          className="text-teal-600/60 dark:text-teal-400/55"
          strokeWidth="3"
        />
        <path
          d="M0 236 C 130 214, 260 258, 420 232 S 700 202, 860 240 S 1040 262, 1200 230"
          stroke="currentColor"
          className="text-foreground/[.28] dark:text-foreground/[.32]"
          strokeWidth="2"
        />
        <path
          d="M0 256 C 160 244, 340 270, 520 250 S 820 226, 1000 258 S 1120 270, 1200 250"
          stroke="currentColor"
          className="text-foreground/[.16] dark:text-foreground/[.2]"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

// A thin wave-crest divider marking the break between the live readings and
// the actions below it — the "coastline" idea carried into the page rhythm.
export function WaveDivider() {
  return (
    <svg
      viewBox="0 0 800 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="h-4 w-full text-teal-600/40 dark:text-teal-400/30"
    >
      <path
        d="M0 12 C 60 2, 120 22, 180 12 S 300 2, 360 12 S 480 22, 540 12 S 660 2, 720 12 S 780 20, 800 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
