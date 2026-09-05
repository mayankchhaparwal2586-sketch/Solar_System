import { memo, useMemo } from "react";
import type { MutableRefObject } from "react";
import { PLANETS, SUN, type CelestialBody } from "../data/bodies";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const planetPosition = (p: CelestialBody, days: number) => {
  const a = p.startAngle - (2 * Math.PI * days) / p.periodDays;
  return { x: Math.cos(a) * p.orbitR, y: Math.sin(a) * p.orbitR };
};

interface Props {
  selectedId: string | null;
  hoveredId: string | null;
  showOrbits: boolean;
  showLabels: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  planetEls: MutableRefObject<Record<string, SVGGElement | null>>;
}

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180;
  const major = i % 5 === 0;
  const r1 = 505;
  const r2 = major ? 492 : 499;
  return {
    x1: Math.cos(a) * r1,
    y1: Math.sin(a) * r1,
    x2: Math.cos(a) * r2,
    y2: Math.sin(a) * r2,
    major,
  };
});

const Belt = memo(function Belt() {
  const dots = useMemo(() => {
    const rnd = mulberry32(7);
    return Array.from({ length: 140 }, (_, i) => {
      const a = rnd() * Math.PI * 2;
      const r = 180 + rnd() * 30;
      return {
        cx: Math.cos(a) * r,
        cy: Math.sin(a) * r,
        s: 0.7 + rnd() * 1.1,
        o: 0.1 + rnd() * 0.25,
        k: i,
      };
    });
  }, []);
  return (
    <g className="belt">
      {dots.map((d) => (
        <circle key={d.k} cx={d.cx} cy={d.cy} r={d.s} fill="#93a5c4" opacity={d.o} />
      ))}
    </g>
  );
});

function PlanetGlyph({ p, selected, hovered }: { p: CelestialBody; selected: boolean; hovered: boolean }) {
  const r = p.visR;
  const ringR = r * 2.05;
  const ringRY = r * 0.62;
  return (
    <g className="planet-body">
      {/* saturn back ring */}
      {p.ring === "saturn" && (
        <g transform="rotate(-18)">
          <ellipse rx={ringR} ry={ringRY} fill="none" stroke="#d8bd82" strokeOpacity={0.45} strokeWidth={4.6} />
          <ellipse rx={ringR * 0.8} ry={ringRY * 0.8} fill="none" stroke="#b89d63" strokeOpacity={0.3} strokeWidth={2} />
        </g>
      )}

      <circle r={r} fill={`url(#grad-${p.id})`} />
      <circle r={r} fill="url(#sphere-shade)" />

      {/* cloud bands + great red spot */}
      {p.bands && (
        <g clipPath={`url(#clip-${p.id})`}>
          {p.id === "jupiter" && (
            <>
              <line x1={-r} x2={r} y1={-r * 0.45} y2={-r * 0.45} stroke="#b8834c" strokeWidth={3.4} opacity={0.5} />
              <line x1={-r} x2={r} y1={-r * 0.08} y2={-r * 0.08} stroke="#f2d5a4" strokeWidth={4.2} opacity={0.55} />
              <line x1={-r} x2={r} y1={r * 0.32} y2={r * 0.32} stroke="#a56b3c" strokeWidth={3.6} opacity={0.5} />
              <ellipse cx={r * 0.34} cy={r * 0.52} rx={r * 0.26} ry={r * 0.15} fill="#c05a38" opacity={0.8} />
            </>
          )}
          {p.id === "saturn" && (
            <>
              <line x1={-r} x2={r} y1={-r * 0.32} y2={-r * 0.32} stroke="#c9a15f" strokeWidth={3.4} opacity={0.45} />
              <line x1={-r} x2={r} y1={r * 0.24} y2={r * 0.24} stroke="#f4e0b0" strokeWidth={4} opacity={0.5} />
            </>
          )}
        </g>
      )}

      {/* atmosphere rim */}
      {p.atmosphere && <circle r={r + 1.4} fill="none" stroke={p.atmosphere} strokeWidth={1.6} />}

      {/* saturn front ring arc */}
      {p.ring === "saturn" && (
        <g transform="rotate(-18)">
          <path
            d={`M ${-ringR} 0 A ${ringR} ${ringRY} 0 0 0 ${ringR} 0`}
            fill="none"
            stroke="#e6cf95"
            strokeOpacity={0.9}
            strokeWidth={4.6}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* uranus vertical rings */}
      {p.ring === "uranus" && (
        <g transform="rotate(78)">
          <ellipse rx={r * 1.8} ry={r * 0.5} fill="none" stroke="#a8e0e2" strokeOpacity={0.35} strokeWidth={1.6} />
          <ellipse rx={r * 1.35} ry={r * 0.36} fill="none" stroke="#a8e0e2" strokeOpacity={0.22} strokeWidth={1.1} />
        </g>
      )}

      {/* the Moon */}
      {p.hasMoon && (
        <>
          <circle r={14} fill="none" stroke="rgba(200,215,240,0.16)" strokeWidth={0.8} />
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite" />
            <circle cx={14} cy={0} r={2.3} fill="#c7d2e0" />
          </g>
        </>
      )}

      {/* hover / selection rings */}
      {hovered && !selected && <circle r={r + 6} fill="none" stroke={p.colors.base} strokeOpacity={0.65} strokeWidth={1.2} />}
      {selected && <circle className="select-ring" r={r + 8.5} stroke="#f2b544" />}
    </g>
  );
}

const OrreryScene = memo(function OrreryScene({
  selectedId,
  hoveredId,
  showOrbits,
  showLabels,
  onSelect,
  onHover,
  planetEls,
}: Props) {
  const sunActive = selectedId === "sun" || hoveredId === "sun";

  return (
    <svg
      viewBox="-530 -530 1060 1060"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Map of the solar system"
    >
      <defs>
        {PLANETS.map((p) => (
          <radialGradient key={p.id} id={`grad-${p.id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={p.colors.hi} />
            <stop offset="52%" stopColor={p.colors.base} />
            <stop offset="100%" stopColor={p.colors.lo} />
          </radialGradient>
        ))}
        <radialGradient id="grad-sun" cx="42%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#fffbe8" />
          <stop offset="38%" stopColor="#ffe08a" />
          <stop offset="72%" stopColor="#ffb63d" />
          <stop offset="100%" stopColor="#f98b2b" />
        </radialGradient>
        <radialGradient id="grad-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,190,80,0.5)" />
          <stop offset="45%" stopColor="rgba(255,150,50,0.18)" />
          <stop offset="100%" stopColor="rgba(255,140,40,0)" />
        </radialGradient>
        <radialGradient id="sphere-shade" cx="33%" cy="30%" r="80%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0)" />
          <stop offset="58%" stopColor="rgba(4,9,20,0)" />
          <stop offset="100%" stopColor="rgba(4,9,20,0.55)" />
        </radialGradient>
        {PLANETS.filter((p) => p.bands).map((p) => (
          <clipPath key={p.id} id={`clip-${p.id}`}>
            <circle r={p.visR} />
          </clipPath>
        ))}
      </defs>

      {/* instrument dial */}
      <circle r={505} fill="none" stroke="rgba(148,163,199,0.1)" strokeWidth={1} />
      {TICKS.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={t.major ? "tick" : "tick-minor"} strokeWidth={t.major ? 1.2 : 0.8} />
      ))}

      {/* orbit paths */}
      {PLANETS.map((p) => {
        const active = selectedId === p.id || hoveredId === p.id;
        return (
          <circle
            key={`orbit-${p.id}`}
            r={p.orbitR}
            className={`orbit${active ? " active warm" : ""}`}
            style={active ? { stroke: p.colors.base, opacity: 0.85 } : { opacity: showOrbits ? 1 : 0 }}
          />
        );
      })}

      <Belt />

      {/* the Sun */}
      <g
        className="planet"
        onClick={() => onSelect("sun")}
        onMouseEnter={() => onHover("sun")}
        onMouseLeave={() => onHover(null)}
        tabIndex={0}
        role="button"
        aria-label="The Sun — view details"
        onKeyDown={(e) => e.key === "Enter" && onSelect("sun")}
      >
        <circle className="sun-breathe" r={95} fill="url(#grad-corona)" />
        <circle className="sun-rays" r={58} fill="none" stroke="#ffd97a" strokeOpacity={0.3} strokeWidth={1.2} strokeDasharray="2 11" />
        <g className="planet-body">
          <circle className="sun-core" r={SUN.visR} fill="url(#grad-sun)" />
          {hoveredId === "sun" && selectedId !== "sun" && (
            <circle r={SUN.visR + 7} fill="none" stroke="#f2b544" strokeOpacity={0.65} strokeWidth={1.2} />
          )}
          {selectedId === "sun" && <circle className="select-ring" r={SUN.visR + 9} stroke="#f2b544" />}
        </g>
        {sunActive && (
          <text className="planet-label" y={SUN.visR + 34} style={{ fill: "#ffd98a" }}>
            SOL
          </text>
        )}
        <circle r={62} fill="none" pointerEvents="all" />
      </g>

      {/* planets */}
      {PLANETS.map((p) => {
        const { x, y } = planetPosition(p, 0);
        const selected = selectedId === p.id;
        const hovered = hoveredId === p.id;
        const labelOn = showLabels || selected || hovered;
        return (
          <g
            key={p.id}
            className="planet"
            ref={(el) => {
              planetEls.current[p.id] = el;
            }}
            transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}
            onClick={() => onSelect(p.id)}
            onMouseEnter={() => onHover(p.id)}
            onMouseLeave={() => onHover(null)}
            tabIndex={0}
            role="button"
            aria-label={`${p.name} — view details`}
            onKeyDown={(e) => e.key === "Enter" && onSelect(p.id)}
          >
            <PlanetGlyph p={p} selected={selected} hovered={hovered} />
            <text className="planet-label" y={-(p.visR + 15)} style={{ opacity: labelOn ? 1 : 0 }}>
              {p.name}
            </text>
            <circle r={Math.max(p.visR + 12, 20)} fill="none" pointerEvents="all" />
          </g>
        );
      })}
    </svg>
  );
});

export default OrreryScene;
