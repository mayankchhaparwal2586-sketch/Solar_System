import type { ReactNode } from "react";
import { PLANETS, fmtKm, orbitFrac, periodLabel, type CelestialBody } from "../data/bodies";
import { useCountUp } from "../hooks/useCountUp";

interface Props {
  body: CelestialBody | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: "rotate(180deg)" } : undefined}>
    <path d="M6 3l5 5-5 5" />
  </svg>
);

function Stat({ label, value, sub, delay }: { label: string; value: ReactNode; sub?: ReactNode; delay: number }) {
  return (
    <div
      className="animate-rise rounded-lg border border-line-soft bg-[#0e1830]/70 px-3.5 py-3 transition-colors duration-200 hover:border-[#2c4070]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-[9.5px] font-semibold tracking-[0.22em] text-faint">{label}</div>
      <div className="tabular mt-1 text-[17px] font-semibold leading-tight text-ink">{value}</div>
      {sub && <div className="tabular mt-0.5 text-[11.5px] text-mute">{sub}</div>}
    </div>
  );
}

function Dossier({ body, onClose, onPrev, onNext }: { body: CelestialBody; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const isSun = body.id === "sun";
  const idx = isSun ? -1 : PLANETS.findIndex((p) => p.id === body.id);
  const diameter = useCountUp(body.diameterKm);
  const distance = useCountUp(body.distanceMkm);
  const period = useCountUp(body.periodDays);
  const earthRatio = body.diameterKm / 12742;
  const jupPct = Math.min(100, Math.max(1.8, (body.diameterKm / 139820) * 100));
  const frac = isSun ? 0 : orbitFrac(body.distanceAU);

  return (
    <div key={body.id} className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-display text-[12px] font-bold tracking-widest" style={{ color: body.colors.base }}>
              {isSun ? "STAR" : String(idx + 1).padStart(2, "0")}
            </span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[9.5px] font-semibold tracking-[0.18em] text-mute">
              {body.kind.toUpperCase()}
            </span>
          </div>
          <h2 className="font-display mt-2 text-[27px] font-bold leading-none tracking-tight text-ink">
            {body.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line text-mute transition-all duration-200 hover:border-[#2c4070] hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <CloseIcon />
        </button>
      </div>

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Stat label="DIAMETER" value={`${fmtKm(diameter)} km`} sub={`${earthRatio >= 1 ? earthRatio.toFixed(1) : earthRatio.toFixed(2)}× Earth`} delay={0} />
        {isSun ? (
          <Stat label="DISTANCE FROM SUN" value="0 km" sub="it is the Sun" delay={50} />
        ) : (
          <Stat label="DISTANCE FROM SUN" value={`${distance.toFixed(1)} M km`} sub={`${body.distanceAU.toFixed(2)} AU`} delay={50} />
        )}
        {isSun ? (
          <Stat label="ROTATION PERIOD" value="≈ 27 days" sub="at the equator" delay={100} />
        ) : (
          <Stat label="ORBITAL PERIOD" value={`${fmtKm(period)} days`} sub={body.periodDays >= 1000 ? `${(body.periodDays / 365.25).toFixed(1)} Earth years` : "one local year"} delay={100} />
        )}
        <Stat label="DAY LENGTH" value={body.dayLength} delay={150} />
        <Stat label={isSun ? "PLANETS" : "MOONS"} value={body.moons} delay={200} />
        <Stat label={isSun ? "SURFACE TEMP" : "MEAN TEMP"} value={body.temp} delay={250} />
      </div>

      {/* size scale */}
      <div className="animate-rise mt-5" style={{ animationDelay: "260ms" }}>
        <div className="flex items-baseline justify-between">
          <span className="text-[9.5px] font-semibold tracking-[0.22em] text-faint">SIZE · RELATIVE TO JUPITER</span>
          <span className="tabular text-[11px] text-mute">
            {isSun ? "9.95× Jupiter" : `${(body.diameterKm / 139820).toFixed(2)}× Jupiter`}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#101c38]">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${jupPct}%`,
              background: `linear-gradient(90deg, ${body.colors.base}, ${body.colors.hi})`,
              boxShadow: `0 0 12px ${body.colors.base}66`,
            }}
          />
        </div>
      </div>

      {/* distance track */}
      {!isSun && (
        <div className="animate-rise mt-5" style={{ animationDelay: "320ms" }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[9.5px] font-semibold tracking-[0.22em] text-faint">POSITION · SUN → NEPTUNE</span>
            <span className="tabular text-[11px] text-mute">{body.distanceAU.toFixed(2)} AU</span>
          </div>
          <div className="relative mt-4 h-6">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-gold/50 via-[#2c4070] to-[#2c4070]" />
            <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_8px_rgba(242,181,68,0.9)]" />
            {PLANETS.map((p) => (
              <span
                key={p.id}
                className="absolute top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a5c84]"
                style={{ left: `${orbitFrac(p.distanceAU) * 100}%` }}
              />
            ))}
            <span
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-700 ease-out"
              style={{
                left: `${frac * 100}%`,
                background: body.colors.base,
                boxShadow: `0 0 14px ${body.colors.base}`,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] font-semibold tracking-[0.2em] text-faint">
            <span>SUN</span>
            <span>NEPTUNE · 30 AU</span>
          </div>
        </div>
      )}

      {/* field note */}
      <div
        className="animate-rise mt-5 rounded-r-lg border-l-2 py-2.5 pl-3.5 pr-3"
        style={{ animationDelay: "380ms", borderColor: body.colors.base, background: `${body.colors.base}0d` }}
      >
        <div className="text-[9.5px] font-semibold tracking-[0.22em] text-faint">FIELD NOTE</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#c6d2e6]">{body.fact}</p>
      </div>

      {/* prev / next */}
      {!isSun && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
          <button
            onClick={onPrev}
            className="group flex items-center gap-2 rounded-md border border-line px-3 py-2 text-[12px] font-semibold text-mute transition-all duration-200 hover:border-[#2c4070] hover:text-ink"
          >
            <Chevron flip />
            <span>{PLANETS[(idx + PLANETS.length - 1) % PLANETS.length].name}</span>
          </button>
          <span className="tabular text-[11px] text-faint">
            {idx + 1} / {PLANETS.length}
          </span>
          <button
            onClick={onNext}
            className="group flex items-center gap-2 rounded-md border border-line px-3 py-2 text-[12px] font-semibold text-mute transition-all duration-200 hover:border-[#2c4070] hover:text-ink"
          >
            <span>{PLANETS[(idx + 1) % PLANETS.length].name}</span>
            <Chevron />
          </button>
        </div>
      )}
    </div>
  );
}

function Briefing({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="animate-rise">
        <div className="text-[10px] font-bold tracking-[0.3em] text-gold">MISSION BRIEF</div>
        <h2 className="font-display mt-3 text-[24px] font-bold leading-snug tracking-tight text-ink">
          Plot your course through the system
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-mute">
          The orrery is running at <span className="font-semibold text-gold-soft">×1.0</span> — every real second
          sweeps <span className="font-semibold text-ink">10 simulated days</span>. Click any world, or the Sun, to
          pull up its dossier; steer the clock from the deck above.
        </p>
      </div>

      <div className="mt-5 flex flex-col">
        {PLANETS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="animate-rise group flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all duration-200 hover:bg-white/[0.045] hover:pl-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            style={{ animationDelay: `${80 + i * 45}ms` }}
          >
            <span className="tabular w-5 text-[11px] font-semibold text-faint">{String(i + 1).padStart(2, "0")}</span>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
              style={{ background: p.colors.base, boxShadow: `0 0 8px ${p.colors.base}99` }}
            />
            <span className="flex-1 text-[13.5px] font-semibold text-[#c6d2e6] transition-colors group-hover:text-ink">
              {p.name}
            </span>
            <span className="tabular text-[11px] text-faint">{periodLabel(p.periodDays)}</span>
            <span className="text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Chevron />
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-2 pt-5 text-[11px] text-faint">
        <p className="flex items-center gap-1.5 flex-wrap">
          <kbd className="rounded border border-line bg-[#0e1830] px-1.5 py-0.5 text-[10px] font-semibold text-mute">SPACE</kbd>
          pause ·
          <kbd className="rounded border border-line bg-[#0e1830] px-1.5 py-0.5 text-[10px] font-semibold text-mute">← →</kbd>
          hop worlds ·
          <kbd className="rounded border border-line bg-[#0e1830] px-1.5 py-0.5 text-[10px] font-semibold text-mute">ESC</kbd>
          close
        </p>
        <p>Orbit radii are compressed so all eight fit on one dial; planet sizes are enlarged, but proportional.</p>
      </div>
    </div>
  );
}

export default function PlanetPanel({ body, onSelect, onClose, onPrev, onNext }: Props) {
  return (
    <div className="h-full overflow-y-auto p-5 lg:p-6">
      {body ? (
        <Dossier body={body} onClose={onClose} onPrev={onPrev} onNext={onNext} />
      ) : (
        <Briefing onSelect={onSelect} />
      )}
    </div>
  );
}
