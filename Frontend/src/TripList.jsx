import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Search, RefreshCw, Truck, LogIn, LayoutDashboard } from "lucide-react";

import { publicApi, driverApi, getDriver, getDriverToken } from "./config";
import AppHeader from "./components/AppHeader";
import TripCard from "./components/TripCard";
import { notify, errorMessage } from "./components/Toast";
import { bn } from "./components/Counter";
import { getLocation } from "./utils/geo";

// 🚚 সবার জন্য খোলা লাইভ ট্রিপ তালিকা — লগইন করা ড্রাইভার এখান থেকেই আবেদন করতে পারবে
const TripList = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const API = "/trips";

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("all");

  const loggedIn = Boolean(getDriverToken() && getDriver());

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await publicApi.get(`${API}/active`);
      setTrips(Array.isArray(res.data) ? res.data : []);

      // লগইন থাকলে কোন ট্রিপে আগে আবেদন করেছে সেটা চিহ্নিত
      if (getDriverToken()) {
        const mine = await driverApi.get(`${API}/my-applications`).catch(() => ({ data: [] }));
        setAppliedIds(new Set((mine.data || []).map((a) => String(a.tripId))));
      }
    } catch (err) {
      notify(errorMessage(err, "ট্রিপ লোড করা যায়নি"), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const takeTrip = async (tripId) => {
    // LOGIN CHECK FIRST
    if (!getDriverToken() || !getDriver()) {
      notify("এই ট্রিপটি নিতে হলে প্রথমে ফোন নাম্বার ও পাসওয়ার্ড দিয়ে ড্রাইভার লগইন করুন", "info");
      navigate("/login");
      return;
    }

    setApplyingId(tripId);
    try {
      // 📍 সঠিক লোকেশন বাধ্যতামূলক — এডমিন দেখবে ড্রাইভার কোথায় আছে
      const location = await getLocation();
      if (location.error) {
        notify(location.error, "error");
        return;
      }
      await driverApi.post(`${API}/apply-trip`, {
        tripId,
        currentLocation: location
      });
      notify("আপনার অনুরোধ লোকেশনসহ এডমিনের কাছে পাঠানো হয়েছে", "success");
      setAppliedIds((s) => new Set(s).add(String(tripId)));
    } catch (error) {
      notify(errorMessage(error), "error");
      if (error.response?.status === 404) loadTrips();
    } finally {
      setApplyingId(null);
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trips.filter(
      (t) =>
        (body === "all" || t.requiredVehicleBody === body) &&
        (!q || `${t.from} ${t.to} ${t.cargoDetails}`.toLowerCase().includes(q))
    );
  }, [trips, search, body]);

  return (
    <div className="dt-dark" style={{ minHeight: "100svh", background: "#0b1424", color: "#fff" }}>
      <AppHeader
        right={
          loggedIn ? (
            <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => navigate("/driver")}>
              <LayoutDashboard size={16} /> আমার ড্যাশবোর্ড
            </button>
          ) : (
            <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => navigate("/login")}>
              <LogIn size={16} /> ড্রাইভার লগইন
            </button>
          )
        }
      />

      <main className="dt-container" style={{ padding: "40px 20px 80px" }}>
        <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="dt-eyebrow" style={{ color: "var(--teal-300)", background: "rgba(94,234,212,.08)", borderColor: "rgba(94,234,212,.3)" }}>
            <span className="dt-live-dot" /> লাইভ
          </span>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", margin: "12px 0 6px" }}>লাইভ ট্রিপ তালিকা</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,.7)" }}>
            {loading ? "ট্রিপ লোড হচ্ছে…" : `এই মুহূর্তে ${bn(trips.length)}টি ট্রিপ চালকের অপেক্ষায়`}
          </p>
        </motion.div>

        {/* সার্চ ও ফিল্টার */}
        <div style={{ display: "flex", gap: 10, margin: "26px 0", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
            <input className="dt-input" placeholder="জায়গা বা মালামাল দিয়ে খুঁজুন…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          </div>
          <select className="dt-input" value={body} onChange={(e) => setBody(e.target.value)} style={{ flex: "0 0 180px" }} aria-label="গাড়ির ধরন">
            <option value="all">সব গাড়ি</option>
            <option value="covered">কভার্ড ভ্যান</option>
            <option value="open">খোলা ট্রাক</option>
          </select>
          <button className="dt-btn dt-btn-ghost" onClick={loadTrips} disabled={loading} aria-label="রিফ্রেশ">
            <RefreshCw size={18} className={loading ? "dt-spin" : undefined} /> রিফ্রেশ
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 20 }}>
          {loading && trips.length === 0 && [0, 1, 2].map((i) => <div key={i} className="dt-skeleton" style={{ height: 240 }} />)}

          {visible.map((t, i) => (
            <motion.div
              key={t._id}
              initial={reduce ? false : { opacity: 0, y: 30, rotateX: 25 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.06 }}
              style={{ transformPerspective: 1000 }}
            >
              <TripCard trip={t} onApply={takeTrip} applying={applyingId === t._id} applied={appliedIds.has(String(t._id))} />
            </motion.div>
          ))}
        </div>

        {!loading && visible.length === 0 && (
          <div className="dt-glass" style={{ padding: 40, textAlign: "center", maxWidth: 560, margin: "20px auto 0" }}>
            <Truck size={42} color="var(--teal-300)" />
            <h3 style={{ margin: "12px 0 6px" }}>{trips.length ? "এই খোঁজে কোনো ট্রিপ মেলেনি" : "এখন কোনো ট্রিপ নেই"}</h3>
            <p style={{ margin: 0, color: "rgba(255,255,255,.7)" }}>নতুন ট্রিপ যোগ হলেই এখানে দেখা যাবে।</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TripList;
