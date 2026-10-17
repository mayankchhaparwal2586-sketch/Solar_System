import { useCallback, useEffect, useRef, useState } from "react";
import Starfield from "./components/Starfield";
import OrreryScene, { planetPosition } from "./components/OrreryScene";
import Controls from "./components/Controls";
import PlanetPanel from "./components/PlanetPanel";
import { PLANETS, SUN, speedLabel } from "./data/bodies";

const BASE_DAYS_PER_SEC = 10; // at ×1 speed

const BrandMark = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="5.5" fill="#f2b544" />
    <circle cx="16" cy="16" r="5.5" fill="url(#bm-glow)" opacity="0.6" />
    <ellipse
      cx="16"
      cy="16"
      rx="14"
      ry="5.6"
      stroke="#8fa0bd"
      strokeWidth="1.3"
      transform="rotate(-18 16 16)"
    />
    <circle cx="27.4" cy="10.4" r="2" fill="#4f74e8" />
    <defs>
      <radialGradient id="bm-glow">
        <stop offset="0%" stopColor="#fff3cf" />
        <stop offset="100%" stopColor="#f2b544" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const simTime = useRef(0);
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const planetEls = useRef<Record<string, SVGGElement | null>>({});
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // ---- simulation clock ----
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        simTime.current += dt * BASE_DAYS_PER_SEC * speedRef.current;
      }
      const t = simTime.current;
      for (const p of PLANETS) {
        const el = planetEls.current[p.id];
        if (!el) continue;
        const { x, y } = planetPosition(p, t);
        el.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
        );
      }
      if (timeRef.current) {
        const y = Math.floor(t / 365.25);
        const d = Math.floor(t - y * 365.25);
        timeRef.current.textContent = `${y}y ${String(d).padStart(3, "0")}d`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // let the speed slider / focused controls handle their own keys
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLButtonElement && e.key === " ") return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if (e.key === "ArrowRight") {
        step(1);
      } else if (e.key === "ArrowLeft") {
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const step = useCallback((dir: 1 | -1) => {
    setSelectedId((cur) => {
      const idx = cur ? PLANETS.findIndex((p) => p.id === cur) : -1;
      if (idx === -1) return PLANETS[dir === 1 ? 0 : PLANETS.length - 1].id;
      return PLANETS[(idx + dir + PLANETS.length) % PLANETS.length].id;
    });
  }, []);

  const handleReset = useCallback(() => {
    simTime.current = 0;
    setSpeed(1);
    setPlaying(true);
  }, []);

  const selected =
    selectedId === "sun"
      ? SUN
      : (PLANETS.find((p) => p.id === selectedId) ?? null);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-void font-body text-ink">
      <Starfield />

      {/* header / control deck */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line-soft bg-[#070d1a]/85 px-4 py-3 backdrop-blur-sm lg:px-6">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <div className="font-display text-[16px] font-extrabold leading-none tracking-[0.06em] text-ink">
              ORRERY
            </div>
            <div className="mt-1 text-[8.5px] font-semibold tracking-[0.32em] text-faint">
              SOLAR SYSTEM · INTERACTIVE ATLAS
            </div>
          </div>
        </div>

        <Controls
          playing={playing}
          speed={speed}
          showOrbits={showOrbits}
          showLabels={showLabels}
          onTogglePlay={() => setPlaying((p) => !p)}
          onSpeedChange={setSpeed}
          onToggleOrbits={() => setShowOrbits((v) => !v)}
          onToggleLabels={() => setShowLabels((v) => !v)}
          onReset={handleReset}
          timeRef={timeRef}
        />
      </header>

      {/* main */}
      <div className="relative z-10 flex min-h-0 flex-1">
        <section className="relative min-w-0 flex-1">
          <div className="absolute inset-0">
            <OrreryScene
              selectedId={selectedId}
              hoveredId={hoveredId}
              showOrbits={showOrbits}
              showLabels={showLabels}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              planetEls={planetEls}
            />
          </div>

          {/* hint */}
          <div
            className={`pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] transition-opacity duration-500 ${
              selectedId ? "opacity-30" : "opacity-80"
            } text-mute`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            CLICK A WORLD TO OPEN ITS DOSSIER
          </div>

          {/* scale note */}
          <div className="pointer-events-none absolute bottom-4 left-4 hidden text-[9px] font-semibold tracking-[0.22em] text-faint/80 sm:block">
            ORBIT RADII COMPRESSED · PLANET SIZES ENLARGED · {speedLabel(speed)}{" "}
            = {(BASE_DAYS_PER_SEC * speed).toFixed(0)} SIM-DAYS / S
          </div>

          {/* quick nav */}
          <nav
            className="absolute bottom-3 left-1/2 flex max-w-[96vw] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-line bg-[#070d1a]/90 px-2 py-1.5 backdrop-blur-sm"
            aria-label="Celestial bodies"
          >
            {[SUN, ...PLANETS].map((b) => {
              const active = selectedId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  onMouseEnter={() => setHoveredId(b.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.08em] transition-all duration-200 ${
                    active
                      ? "bg-white/[0.07] text-ink shadow-[inset_0_0_0_1px_rgba(242,181,68,0.5)]"
                      : "text-mute hover:-translate-y-0.5 hover:text-ink"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: b.colors.base,
                      boxShadow:
                        active || hoveredId === b.id
                          ? `0 0 8px ${b.colors.base}`
                          : "none",
                    }}
                  />
                  {b.id === "sun" ? "SUN" : b.name.toUpperCase()}
                </button>
              );
            })}
          </nav>
        </section>

        {/* dossier panel */}
        <aside
          className={`${
            selectedId
              ? "fixed inset-x-3 bottom-3 z-40 max-h-[56vh] rounded-xl border border-line bg-panel shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
              : "hidden"
          } lg:static lg:inset-x-auto lg:z-auto lg:block lg:h-auto lg:max-h-none lg:w-[380px] lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-l lg:border-r-0 lg:border-line-soft lg:bg-panel lg:shadow-none`}
        >
          <PlanetPanel
            body={selected}
            onSelect={setSelectedId}
            onClose={() => setSelectedId(null)}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        </aside>
      </div>
    </div>
  );
}
