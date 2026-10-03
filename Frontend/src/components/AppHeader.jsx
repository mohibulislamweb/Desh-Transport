import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

// 🧭 ড্যাশবোর্ড/ট্রিপ পেজের উপরের বার
const AppHeader = ({ right, dark = true }) => (
  <header
    style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: dark ? "rgba(5,13,31,.82)" : "rgba(255,255,255,.86)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: `1px solid ${dark ? "rgba(255,255,255,.08)" : "var(--line)"}`
    }}
  >
    <div className="dt-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 20px" }}>
      <Link to="/" style={{ textDecoration: "none" }} aria-label="হোম পেজ">
        <Logo light={dark} size={38} subtitle={false} />
      </Link>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>{right}</div>
    </div>
  </header>
);

export default AppHeader;
