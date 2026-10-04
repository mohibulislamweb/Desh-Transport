import React, { useEffect, useState } from "react";
import { MapPin, ExternalLink, Crosshair } from "lucide-react";
import { bn } from "./Counter";

// 🗺️ পুরোনো রেকর্ডে জায়গার নাম না থাকলে ব্রাউজার থেকেই খুঁজে আনা (ক্যাশ + সেকেন্ডে ১টা)
const cache = new Map();
let queue = Promise.resolve();

const lookup = (lat, lng) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);
  const p = (queue = queue
    .then(() => new Promise((r) => setTimeout(r, 1100)))
    .then(() =>
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=bn`)
        .then((r) => r.json())
        .then((d) => {
          const a = d.address || {};
          const parts = [
            a.road || a.neighbourhood || a.suburb || a.hamlet,
            a.village || a.town || a.city || a.municipality,
            a.county,
            a.state_district
          ].filter(Boolean);
          return [...new Set(parts)].join(", ") || d.display_name || null;
        })
        .catch(() => null)
    ));
  cache.set(key, p);
  return p;
};

export const timeAgo = (date) => {
  if (!date) return "";
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "এইমাত্র";
  if (mins < 60) return `${bn(mins)} মিনিট আগে`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${bn(hrs)} ঘণ্টা আগে`;
  return `${bn(Math.round(hrs / 24))} দিন আগে`;
};

// 📍 লোকেশন দেখানো: জায়গার নাম + নির্ভুলতা + কখন + ম্যাপ লিংক
const LocationInfo = ({ location, dark = true, label = "লোকেশন" }) => {
  const has = location && location.lat != null && location.lng != null;
  const [name, setName] = useState(location?.placeName || null);

  useEffect(() => {
    let alive = true;
    if (has && !location.placeName) {
      lookup(Number(location.lat), Number(location.lng)).then((n) => alive && setName(n));
    } else {
      setName(location?.placeName || null);
    }
    return () => {
      alive = false;
    };
  }, [has, location?.lat, location?.lng, location?.placeName]);

  const muted = dark ? "rgba(255,255,255,.6)" : "var(--ink-soft)";

  if (!has) {
    return (
      <span style={{ color: muted, fontSize: "var(--fs-sm)", display: "inline-flex", gap: 6, alignItems: "center" }}>
        <MapPin size={14} /> লোকেশন পাওয়া যায়নি
      </span>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 4,
        padding: "10px 12px",
        borderRadius: "var(--radius)",
        background: dark ? "rgba(255,255,255,.04)" : "var(--surface-soft)",
        border: `1px solid ${dark ? "rgba(255,255,255,.1)" : "var(--line)"}`
      }}
    >
      <span style={{ fontSize: "var(--fs-xs)", color: muted }}>{label}</span>
      <strong style={{ display: "flex", gap: 6, alignItems: "flex-start", fontWeight: 600, lineHeight: 1.5 }}>
        <MapPin size={16} style={{ flexShrink: 0, marginTop: 3, color: "var(--teal-400)" }} />
        {name || "জায়গার নাম খোঁজা হচ্ছে…"}
      </strong>
      <span style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "var(--fs-xs)", color: muted, alignItems: "center" }}>
        {location.accuracy != null && (
          <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
            <Crosshair size={12} /> ±{bn(location.accuracy)} মিটার
          </span>
        )}
        {location.updatedAt && <span>{timeAgo(location.updatedAt)}</span>}
        <a
          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--teal-400)", display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 600 }}
        >
          ম্যাপে দেখুন <ExternalLink size={12} />
        </a>
      </span>
    </div>
  );
};

export default LocationInfo;
