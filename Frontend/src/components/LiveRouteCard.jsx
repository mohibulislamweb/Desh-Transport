import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Truck, Navigation, Clock } from "lucide-react";
import { DIVISIONS, HUB, CITIES, routePath } from "../mapData";
import { bn } from "./Counter";

// 🛰️ হিরোর "লাইভ রুট" প্যানেল — বাংলাদেশের ম্যাপে রুট আঁকা হয়, ট্রাক চলে, অগ্রগতি বাড়ে
// (রুটটা প্রতীকী — আসল GPS ট্র্যাক নয়; লেবেলে চালু ট্রিপের নাম দেখায়)

// ১. গন্তব্য "chittagong" থেকে পরিবর্তন করে "dhaka" করা হয়েছে
const DEST = CITIES.find((c) => c.id === "dhaka") || CITIES[0];
const PATH = routePath(DEST);

const LiveRouteCard = ({ trip }) => {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(reduce ? 64 : 8);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPct((p) => (p >= 96 ? 8 : p + 1)), 120);
    return () => clearInterval(t);
  }, [reduce]);

  // ২. ডিফল্ট "নরসিংদী" ও "চট্টগ্রাম" পরিবর্তন করে "কুমিল্লা" ও "ঢাকা" করা হয়েছে
  const from = trip?.from || "কুমিল্লা";
  const to = trip?.to || "ঢাকা";

  return (
    <motion.div
      className="lr-card"
      initial={reduce ? false : { opacity: 0, rotateY: -28, rotateX: 10, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, rotateY: -8, rotateX: 4, y: 0, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      whileHover={reduce ? undefined : { rotateY: 0, rotateX: 0, transition: { duration: 0.6 } }}
      style={{ transformPerspective: 1200 }}
    >
      <style>{`
        .lr-card { width: 100%; max-width: 420px; border-radius: 18px; background: rgba(10,18,32,.72); border: 1px solid rgba(255,255,255,.14); box-shadow: 0 40px 90px rgba(0,0,0,.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); overflow: hidden; color: #fff; }
        .lr-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: 13px; }
        .lr-map { position: relative; height: 280px; padding: 8px; background: radial-gradient(400px 220px at 60% 40%, rgba(15,118,110,.25), transparent 70%); }
        .lr-foot { padding: 14px 16px; display: grid; gap: 10px; }
        .lr-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,.1); overflow: hidden; }
        .lr-bar > div { height: 100%; background: linear-gradient(90deg, #0f766e, #2dd4bf); border-radius: 3px; transition: width .12s linear; }
        @media (max-width: 960px) { .lr-card { margin: 0 auto; } .lr-map { height: 200px; } }
      `}</style>

      <div className="lr-head">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
          <span className="dt-live-dot" /> লাইভ রুট ট্র্যাকিং
        </span>
        <span style={{ color: "rgba(255,255,255,.6)" }}>GPS</span>
      </div>

      <div className="lr-map">
        <svg viewBox="-6 -6 300 412" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%" }} aria-hidden="true">
          <defs>
            <filter id="lr-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {DIVISIONS.map((d) => (
            <path key={d.name} d={d.d} fill="rgba(148,163,184,.14)" stroke="rgba(148,163,184,.35)" strokeWidth="0.8" />
          ))}
          {/* অন্য রুটগুলো হালকা */}
          {CITIES.filter((c) => c.id !== DEST.id).map((c) => (
            <path key={c.id} d={routePath(c)} fill="none" stroke="rgba(45,212,191,.22)" strokeWidth="1" strokeDasharray="3 4" />
          ))}
          {/* মূল রুট আঁকা হচ্ছে */}
          <motion.path
            d={PATH}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="2.6"
            strokeLinecap="round"
            filter="url(#lr-glow)"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 1.1 }}
          />
          {!reduce && (
            <g filter="url(#lr-glow)">
              <circle r="5" fill="#fff" stroke="#0f766e" strokeWidth="2.5">
                <animateMotion dur="9s" repeatCount="indefinite" path={PATH} begin="3.3s" />
              </circle>
            </g>
          )}
          {/* হাব */}
          <circle cx={HUB.x} cy={HUB.y} r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
          {!reduce && (
            <circle cx={HUB.x} cy={HUB.y} r="5" fill="none" stroke="#ef4444" strokeWidth="1.5">
              <animate attributeName="r" values="5;22" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="2.2s" repeatCount="indefinite" />
            </circle>
          )}
          {/* গন্তব্য */}
          <circle cx={DEST.x} cy={DEST.y} r="5" fill="#2dd4bf" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="lr-foot">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <strong style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15 }}>
            <Truck size={17} color="#2dd4bf" /> {from} → {to}
          </strong>
          <span className="dt-num" style={{ color: "#2dd4bf", fontWeight: 700 }}>{bn(pct)}%</span>
        </div>
        <div className="lr-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "rgba(255,255,255,.65)" }}>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Navigation size={13} /> রিয়েল-টাইম আপডেট
          </span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Clock size={13} /> নির্ধারিত সময়ে পৌঁছানো
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveRouteCard;
