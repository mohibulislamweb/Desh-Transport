import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Tilt3D from "./Tilt3D";
import Logo from "./Logo";

// 🔐 লগইন/রেজিস্ট্রেশন পেজের কমন লেআউট — বামে 3D ছবি, ডানে ফর্ম
const AuthShell = ({ image, imageAlt, title, subtitle, points = [], children }) => {
  const reduce = useReducedMotion();
  return (
    <div className="as-root">
      <style>{`
        .as-root { min-height: 100svh; display: grid; grid-template-columns: 1.05fr 1fr; background: var(--navy-950); }
        @media (max-width: 900px) { .as-root { grid-template-columns: 1fr; } .as-art { display: none !important; } }
        .as-mlogo { display: none; margin-bottom: 14px; } @media (max-width: 900px) { .as-mlogo { display: block; } }
        .as-art { position: relative; overflow: hidden; color: #fff; padding: 48px; display: flex; flex-direction: column; justify-content: space-between;
          background: #0b1424; }
        .as-grid { display: none; position: absolute; inset: 0; background-image: linear-gradient(rgba(94,234,212,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,.08) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(circle at 50% 50%, #000, transparent 75%); -webkit-mask-image: radial-gradient(circle at 50% 50%, #000, transparent 75%); }
        .as-photo { border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 40px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.12); }
        .as-photo img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
        .as-form-side { display: flex; align-items: center; justify-content: center; padding: 32px 20px; background: var(--surface-soft); }
        .as-card { width: 100%; max-width: 460px; background: #fff; border-radius: var(--radius-lg); padding: 32px 28px; box-shadow: var(--shadow); border: 1px solid var(--line); }
        @media (max-width: 480px) { .as-card { padding: 26px 20px; border-radius: 22px; } }
      `}</style>

      <aside className="as-art">
        <div className="as-grid" />
        <Link to="/" style={{ position: "relative", textDecoration: "none" }}>
          <Logo light />
        </Link>

        <motion.div
          style={{ position: "relative", margin: "32px 0", transformPerspective: 1200 }}
          initial={reduce ? false : { opacity: 0, rotateY: -30, rotateX: 10, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tilt3D max={10}>
            <div className="as-photo">
              <img src={image} alt={imageAlt} />
            </div>
          </Tilt3D>
        </motion.div>

        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 30, margin: "0 0 10px", lineHeight: 1.3 }}>{title}</h2>
          <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,.72)", lineHeight: 1.8 }}>{subtitle}</p>
          <div style={{ display: "grid", gap: 10 }}>
            {points.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.text} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.88)", fontWeight: 600 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(45,212,191,.15)", color: "var(--teal-300)" }}>
                    <Icon size={18} />
                  </span>
                  {p.text}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="as-form-side">
        <motion.div
          className="as-card"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 18 }}>
            <ArrowLeft size={16} /> হোম পেজে ফিরুন
          </Link>
          <div className="as-mlogo"><Logo size={40} /></div>
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AuthShell;
