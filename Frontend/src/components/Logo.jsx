import React from "react";
import logoImg from "../desh logo.jpeg";

// 🏷️ লোগো + নাম (সব পেজে একই)
const Logo = ({ light = false, size = 44, subtitle = true }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
    <img
      src={logoImg}
      alt="দেশ ট্রান্সপোর্ট লোগো"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", boxShadow: "0 6px 18px rgba(0,0,0,.25)", border: "2px solid rgba(255,255,255,.7)" }}
    />
    <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
      <strong style={{ fontSize: 17, color: light ? "#fff" : "var(--ink)" }}>দেশ ট্রান্সপোর্ট</strong>
      {subtitle && (
        <small style={{ fontSize: 11.5, fontWeight: 600, color: light ? "var(--teal-300)" : "var(--teal-500)" }}>
          নিরাপদ পরিবহন, আপনার বিশ্বাসের সঙ্গী
        </small>
      )}
    </span>
  </span>
);

export default Logo;
