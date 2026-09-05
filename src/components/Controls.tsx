import type { RefObject } from "react";
import { speedLabel, speedToSlider, sliderToSpeed } from "../data/bodies";

interface Props {
  playing: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  onTogglePlay: () => void;
  onSpeedChange: (s: number) => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onReset: () => void;
  timeRef: RefObject<HTMLSpanElement>;
}

const PRESETS = [0.5, 1, 5, 10];

const PlayIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4.5 2.2c0-.8.9-1.3 1.6-.9l8 5.1c.6.4.6 1.4 0 1.8l-8 5.1c-.7.4-1.6-.1-1.6-.9V2.2z" transform="translate(-1.2 -0.4) scale(0.95)" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="2.6" y="2" width="4" height="12" rx="1.2" />
    <rect x="9.4" y="2" width="4" height="12" rx="1.2" />
  </svg>
);

const ResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`Toggle ${label.toLowerCase()}`}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] transition-all duration-200 ${
        on
          ? "border-line bg-[#14213c] text-ink hover:border-[#2c4070]"
          : "border-transparent text-faint hover:text-mute"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
          on ? "bg-gold shadow-[0_0_8px_rgba(242,181,68,0.8)]" : "bg-[#33415e]"
        }`}
      />
      {label}
    </button>
  );
}

export default function Controls({
  playing,
  speed,
  showOrbits,
  showLabels,
  onTogglePlay,
  onSpeedChange,
  onToggleOrbits,
  onToggleLabels,
  onReset,
  timeRef,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* elapsed sim time */}
      <div className="flex items-baseline gap-2 rounded-md border border-line bg-[#0d1730]/80 px-3 py-1.5">
        <span className="text-[10px] font-semibold tracking-[0.22em] text-faint">ELAPSED</span>
        <span ref={timeRef} className="tabular min-w-[74px] text-[13px] font-semibold text-gold-soft">
          0y 000d
        </span>
      </div>

      {/* transport */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          title={playing ? "Pause simulation (Space)" : "Play simulation (Space)"}
          className={`group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${
            playing
              ? "bg-gold text-[#1a1204] shadow-[0_0_22px_rgba(242,181,68,0.4)] hover:shadow-[0_0_30px_rgba(242,181,68,0.6)] hover:scale-105"
              : "border border-gold/60 bg-transparent text-gold hover:bg-gold/10 hover:scale-105"
          }`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={onReset}
          title="Reset clock and speed"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-mute transition-all duration-200 hover:rotate-[-40deg] hover:border-[#2c4070] hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <ResetIcon />
        </button>
      </div>

      {/* speed */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1000}
            value={speedToSlider(speed)}
            onChange={(e) => onSpeedChange(sliderToSpeed(Number(e.target.value)))}
            className="speed-range w-28 sm:w-36"
            aria-label="Simulation speed"
          />
          <span className="tabular w-12 rounded border border-line bg-[#0d1730]/80 px-1.5 py-1 text-center text-[12px] font-semibold text-ink">
            {speedLabel(speed)}
          </span>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          {PRESETS.map((p) => {
            const active = Math.abs(speed - p) < 0.06;
            return (
              <button
                key={p}
                onClick={() => onSpeedChange(p)}
                className={`tabular rounded px-2 py-1 text-[11px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gold/15 text-gold-soft shadow-[inset_0_0_0_1px_rgba(242,181,68,0.45)]"
                    : "text-faint hover:bg-white/5 hover:text-mute"
                }`}
              >
                {p}×
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden h-6 w-px bg-line sm:block" />

      <div className="flex items-center gap-1">
        <Toggle label="ORBITS" on={showOrbits} onClick={onToggleOrbits} />
        <Toggle label="LABELS" on={showLabels} onClick={onToggleLabels} />
      </div>
    </div>
  );
}
