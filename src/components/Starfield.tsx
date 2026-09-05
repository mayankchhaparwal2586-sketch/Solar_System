import { memo, useMemo } from "react";

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

interface Star {
  left: number;
  top: number;
  size: number;
  delay: number;
  dur: number;
  warm: boolean;
}

const Starfield = memo(function Starfield() {
  const stars = useMemo<Star[]>(() => {
    const rnd = mulberry32(42);
    return Array.from({ length: 150 }, () => ({
      left: rnd() * 100,
      top: rnd() * 100,
      size: 0.8 + rnd() * 1.8,
      delay: rnd() * 6,
      dur: 2.6 + rnd() * 5,
      warm: rnd() > 0.82,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* deep space washes */}
      <div
        className="nebula nebula-a"
        style={{
          width: "85vmax",
          height: "85vmax",
          left: "-20vmax",
          top: "-30vmax",
          background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 62%)",
        }}
      />
      <div
        className="nebula nebula-b"
        style={{
          width: "70vmax",
          height: "70vmax",
          right: "-25vmax",
          bottom: "-25vmax",
          background: "radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 60%)",
        }}
      />
      <div
        className="nebula nebula-c"
        style={{
          width: "60vmax",
          height: "60vmax",
          left: "28%",
          top: "22%",
          background: "radial-gradient(circle, rgba(242,181,68,0.055) 0%, transparent 55%)",
        }}
      />

      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.warm ? "#ffe3b3" : "#dfe9ff",
            ["--delay" as string]: `${s.delay}s`,
            ["--dur" as string]: `${s.dur}s`,
          }}
        />
      ))}

      <span
        className="shooting"
        style={{ top: "16%", left: "78%", ["--cycle" as string]: "11s", ["--delay" as string]: "3s" }}
      />
      <span
        className="shooting"
        style={{ top: "58%", left: "94%", ["--cycle" as string]: "17s", ["--delay" as string]: "9s" }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(3,5,10,0.55) 100%)" }}
      />
    </div>
  );
});

export default Starfield;
