import React from "react";
import { ArrowRight, CalendarClock, Package, Scale, Truck, Loader2, CheckCircle2 } from "lucide-react";
import Tilt3D from "./Tilt3D";
import { bn } from "./Counter";

export const bodyLabel = (b) => (b === "covered" ? "কভার্ড ভ্যান" : "খোলা ট্রাক");
export const taka = (n) => `৳ ${Number(n || 0).toLocaleString("bn-BD")}`;

// 🚚 একটি ট্রিপের 3D কার্ড (ড্রাইভার ও পাবলিক পেজে একই)
const TripCard = ({ trip, onApply, applying = false, applied = false, actionLabel = "ট্রিপটি নিতে চাই" }) => (
  <Tilt3D max={7}>
    <article className="dt-glass" style={{ padding: 22, height: "100%", display: "flex", flexDirection: "column", gap: 14, color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span className="dt-badge dt-badge-teal">
          <Truck size={14} /> {bodyLabel(trip.requiredVehicleBody)}
        </span>
        <span className="dt-badge dt-badge-amber">
          <CalendarClock size={14} /> {trip.pickupTime}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 21, fontWeight: 700, flexWrap: "wrap", transform: "translateZ(30px)" }}>
        <span>{trip.from}</span>
        <ArrowRight size={20} color="var(--teal-300)" />
        <span>{trip.to}</span>
      </div>

      <div style={{ color: "rgba(255,255,255,.72)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.6 }}>
        <Package size={16} style={{ marginTop: 4, flexShrink: 0 }} /> {trip.cargoDetails || "বিবরণ নেই"}
      </div>

      {trip.requiredCapacity ? (
        <span className="dt-badge dt-badge-green" style={{ alignSelf: "flex-start" }}>
          <Scale size={14} /> {bn(trip.requiredCapacity)} টন লাগবে
        </span>
      ) : null}

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="dt-num" style={{ fontSize: 26, fontWeight: 700, color: "var(--teal-300)" }}>{taka(trip.fixedPrice)}</span>
        {onApply &&
          (applied ? (
            <span className="dt-badge dt-badge-green" style={{ padding: "8px 12px" }}>
              <CheckCircle2 size={15} /> আবেদন করা হয়েছে
            </span>
          ) : (
            <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => onApply(trip._id)} disabled={applying}>
              {applying ? <Loader2 size={16} className="dt-spin" /> : null}
              {actionLabel}
            </button>
          ))}
      </div>
    </article>
  </Tilt3D>
);

export default TripCard;
