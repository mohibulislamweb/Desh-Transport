import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { DIVISIONS, HUB, CITIES, routePath } from "./mapData";

/*
  Persistent, colourful, low-key-animated Bangladesh map that sits behind
  the entire site (position: fixed, negative z-index). Routes radiate
  continuously from the Narsingdi hub out to the major coverage cities.
  Purely decorative: pointer-events disabled, aria-hidden.

  🗺️ 3D আপগ্রেড:
  - ম্যাপটা 3D তে কাত করা, নিচে "পুরুত্ব" (extrude) স্তর দিয়ে ভাসমান দেখায়
  - স্ক্রল করলে ধীরে ঘোরে ও সরে, মাউস নাড়ালে হালকা হেলে যায়
  - হাব থেকে প্রতিটি শহরে আলো-জ্বলা রুট, রুট ধরে ছোট ট্রাক চলে
  - শহরগুলোর নাম ও পালস মার্কার
*/

// A distinct, muted-but-colourful tone per division so it reads like a
// real administrative map rather than a flat silhouette.
const DIVISION_COLORS = {
  Dhaka: "#f4c66b",
  Chittagong: "#5fb894",
  Sylhet: "#a3d977",
  Khulna: "#7ec8d8",
  Barishal: "#7fd0a4",
  Rajshahi: "#f0a860",
  Rangpur: "#93cf9a"
};

// নিচের পুরুত্বের স্তর কতগুলো
const EXTRUDE_LAYERS = 6;

const MapWatermark = () => {
  const reduceMotion = useReducedMotion();
  const groupRef = useRef(null);
  // Fallback to the full original canvas until the real bounds are measured
  const [viewBox, setViewBox] = useState("0 0 435 600");

  useEffect(() => {
    if (!groupRef.current) return;
    try {
      const box = groupRef.current.getBBox();
      const pad = Math.max(box.width, box.height) * 0.06;
      setViewBox(
        `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`
      );
    } catch {
      // getBBox can fail on some browsers before layout is ready — keep fallback
    }
  }, []);

  // ---------- স্ক্রল অনুযায়ী 3D ঘোরা ----------
  const { scrollYProgress } = useScroll();
  const rotZ = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-8, 10]);
  const rotX = useTransform(scrollYProgress, [0, 0.5, 1], reduceMotion ? [30, 30, 30] : [34, 22, 34]);
  const shiftY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-2%", "6%"]);

  // ---------- মাউস অনুযায়ী হালকা হেলানো ----------
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 40, damping: 20 });
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduceMotion) return;
    const move = (e) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduceMotion, mx, my]);

  const rotateX = useTransform([rotX, tiltX], ([a, b]) => a + b);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: "radial-gradient(1200px 800px at 50% 40%, #f7fbfa 0%, #eef4f6 60%, #e6eef3 100%)",
        perspective: "1400px"
      }}
    >
      <style>{`
        @keyframes mw-dash { to { stroke-dashoffset: -40; } }
        @keyframes mw-glow { 50% { opacity: .35; } }
        .mw-route-glow { animation: mw-glow 3.2s ease-in-out infinite; }
        .mw-route-flow { animation: mw-dash 1.6s linear infinite; }
      `}</style>

      <motion.div
        style={{
          position: "absolute",
          inset: "-6% -4%",
          rotateX,
          rotateY: tiltY,
          rotateZ: rotZ,
          y: shiftY,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 55%"
        }}
      >
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="mw-route" x1="0" x2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="mw-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* মাটিতে পড়া ছায়া */}
          <g transform="translate(6 22)" filter="url(#mw-soft)" opacity="0.22">
            {DIVISIONS.map((div) => (
              <path key={`sh-${div.name}`} d={div.d} fill="#0f2957" />
            ))}
          </g>

          {/* পুরুত্ব (extrude) — নিচ থেকে উপরে স্তর */}
          {Array.from({ length: EXTRUDE_LAYERS }).map((_, i) => (
            <g key={`ex-${i}`} transform={`translate(0 ${(EXTRUDE_LAYERS - i) * 1.4})`}>
              {DIVISIONS.map((div) => (
                <path key={div.name} d={div.d} fill="#0f2957" fillOpacity={0.1 + i * 0.02} />
              ))}
            </g>
          ))}

          {/* colourful land divisions (measured for the tight viewBox above) */}
          <g ref={groupRef}>
            {DIVISIONS.map((div) => (
              <path
                key={div.name}
                d={div.d}
                fill={DIVISION_COLORS[div.name] || "#9fd3ab"}
                fillOpacity="0.62"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* routes radiating from the Narsingdi hub — নরম আলো + চলমান ড্যাশ */}
          {CITIES.map((city) => (
            <g key={`bg-route-${city.id}`}>
              <path
                className={reduceMotion ? undefined : "mw-route-glow"}
                d={routePath(city)}
                fill="none"
                stroke="#14b8a6"
                strokeOpacity="0.35"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#mw-soft)"
              />
              <path
                className={reduceMotion ? undefined : "mw-route-flow"}
                d={routePath(city)}
                fill="none"
                stroke="url(#mw-route)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 4"
              />
            </g>
          ))}

          {/* রুট ধরে চলমান ছোট ট্রাক */}
          {!reduceMotion &&
            CITIES.map((city, i) => (
              <g key={`bg-truck-${city.id}`}>
                <g>
                  <rect x="-6" y="-3.5" width="8" height="7" rx="1.2" fill="#0f2957" />
                  <rect x="2" y="-2.5" width="4.5" height="6" rx="1.2" fill="#14b8a6" />
                  <circle cx="-3.5" cy="4" r="1.4" fill="#0b1b36" />
                  <circle cx="3.5" cy="4" r="1.4" fill="#0b1b36" />
                  <animateMotion dur={`${5 + i * 0.6}s`} begin={`${i * 0.7}s`} repeatCount="indefinite" rotate="auto" path={routePath(city)} />
                </g>
                <circle r="2.4" fill="#fbbf24">
                  <animateMotion dur={`${3.5 + i * 0.4}s`} begin={`${i * 0.5 + 1.5}s`} repeatCount="indefinite" path={routePath(city)} />
                </circle>
              </g>
            ))}

          {/* শহরের মার্কার + নাম */}
          {CITIES.map((city, i) => (
            <g key={`city-${city.id}`} transform={`translate(${city.x} ${city.y})`}>
              {!reduceMotion && (
                <circle r="4" fill="none" stroke="#14b8a6" strokeWidth="1.5">
                  <animate attributeName="r" values="4;14" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                </circle>
              )}
              <circle r="4" fill="#ffffff" stroke="#0f2957" strokeWidth="2" />
              <text
                y="-9"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#0f2957"
                fillOpacity="0.75"
                stroke="#ffffff"
                strokeWidth="3"
                paintOrder="stroke"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {city.name}
              </text>
            </g>
          ))}

          {/* radar pings spreading out from the hub */}
          {!reduceMotion &&
            [0, 1, 2].map((i) => (
              <circle key={`bg-ping-${i}`} cx={HUB.x} cy={HUB.y} r="6" fill="none" stroke="#ef4444" strokeWidth="2">
                <animate attributeName="r" values="6;46" dur="3s" begin={`${i * 1}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="3s" begin={`${i * 1}s`} repeatCount="indefinite" />
              </circle>
            ))}

          {/* hub marker (উঁচু পিন) */}
          <g transform={`translate(${HUB.x} ${HUB.y})`}>
            <ellipse cx="0" cy="2" rx="7" ry="2.5" fill="#0f2957" opacity="0.25" />
            <path d="M0 0 C-7 -10 -7 -20 0 -22 C7 -20 7 -10 0 0 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="0" cy="-15" r="3" fill="#ffffff" />
            <text
              y="-28"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#b91c1c"
              stroke="#ffffff"
              strokeWidth="3"
              paintOrder="stroke"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {HUB.name}
            </text>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default MapWatermark;
