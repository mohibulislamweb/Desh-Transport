import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Users,
  History,
  LogOut,
  Home,
  Plus,
  Trash2,
  Eye,
  X,
  MapPin,
  Phone,
  Scale,
  CheckCircle2,
  RefreshCw,
  Search,
  Loader2,
  ArrowRight,
  Wallet,
  ClipboardList,
  CalendarClock,
  Package
} from "lucide-react";

import { adminApi, clearAdminSession } from "./config";
import Logo from "./components/Logo";
import Tilt3D from "./components/Tilt3D";
import { notify, errorMessage } from "./components/Toast";
import { bn } from "./components/Counter";
import { bodyLabel, taka } from "./components/TripCard";

const emptyForm = {
  from: "",
  to: "",
  cargoDetails: "",
  requiredVehicleBody: "covered",
  requiredCapacity: "",
  fixedPrice: "",
  pickupAt: ""
};

// datetime-local এর মান থেকে সুন্দর বাংলা সময়
// যেমন: "২ অক্টোবর (শুক্রবার), দুপুর ২:০০"
const formatPickup = (value) => {
  const d = new Date(value);
  const date = d.toLocaleDateString("bn-BD", { day: "numeric", month: "long" });
  const weekday = d.toLocaleDateString("bn-BD", { weekday: "long" });
  const h = d.getHours();
  const period = h < 5 ? "রাত" : h < 12 ? "সকাল" : h < 15 ? "দুপুর" : h < 18 ? "বিকাল" : h < 20 ? "সন্ধ্যা" : "রাত";
  const time = `${bn(h % 12 || 12)}:${bn(String(d.getMinutes()).padStart(2, "0"))}`;
  return `${date} (${weekday}), ${period} ${time}`;
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" }) : "-");

const AdminDashboard = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // Core Functional States
  const [trips, setTrips] = useState([]);
  const [history, setHistory] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // UI Interaction States
  const [view, setView] = useState("overview");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [inputForm, setInputForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeRes, historyRes, driversRes] = await Promise.all([
        adminApi.get("/trips/active"),
        adminApi.get("/trips/history/last-7-days"),
        adminApi.get("/drivers/all")
      ]);
      setTrips(activeRes.data || []);
      setHistory(historyRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (err) {
      if (err.response?.status !== 401) notify(errorMessage(err, "সার্ভার থেকে ডাটা লোড করতে সমস্যা হয়েছে।"), "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setField = (key) => (e) => setInputForm({ ...inputForm, [key]: e.target.value });

  const addTrip = async (e) => {
    e.preventDefault();
    const f = inputForm;
    if (!f.from.trim() || !f.to.trim() || !f.cargoDetails.trim() || !f.fixedPrice || !f.pickupAt) {
      notify("সব তথ্য পূরণ করুন (কোথা থেকে, কোথায়, মালামাল, ভাড়া, পিকআপের সময়)", "error");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/trips/add", {
        from: f.from,
        to: f.to,
        cargoDetails: f.cargoDetails,
        requiredVehicleBody: f.requiredVehicleBody,
        requiredCapacity: f.requiredCapacity === "" ? null : Number(f.requiredCapacity),
        fixedPrice: Number(f.fixedPrice),
        pickupTime: formatPickup(f.pickupAt),
        pickupAt: new Date(f.pickupAt).toISOString()
      });
      notify("ট্রিপ সফলভাবে যুক্ত হয়েছে", "success");
      setInputForm(emptyForm);
      loadData();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteTrip = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই ট্রিপটি মুছে ফেলতে চান?")) return;
    setBusyId(id);
    try {
      await adminApi.delete(`/trips/${id}`);
      notify("ট্রিপ মুছে ফেলা হয়েছে", "success");
      loadData();
    } catch (err) {
      notify(errorMessage(err, "মুছে ফেলা সম্ভব হয়নি।"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const viewDrivers = async (trip) => {
    setSelectedTrip(trip);
    setApplications([]);
    setAppsLoading(true);
    try {
      const res = await adminApi.get(`/trips/applications/${trip._id}`);
      setApplications(res.data || []);
    } catch (err) {
      notify(errorMessage(err, "ড্রাইভারের তালিকা পাওয়া যায়নি"), "error");
    } finally {
      setAppsLoading(false);
    }
  };

  const confirmDriver = async (driverId) => {
    setBusyId(driverId);
    try {
      await adminApi.post("/trips/confirm-driver", {
        tripId: selectedTrip._id,
        driverId
      });
      notify("ড্রাইভার কনফার্ম হয়েছে", "success");
      handleCloseModal();
      loadData();
    } catch (err) {
      notify(errorMessage(err, "ড্রাইভার নিশ্চিতকরণে সমস্যা হয়েছে"), "error");
      if (err.response?.status === 409 || err.response?.status === 404) {
        handleCloseModal();
        loadData();
      }
    } finally {
      setBusyId(null);
    }
  };

  const deleteDriver = async (id) => {
    if (!window.confirm("ড্রাইভার মুছে ফেলবেন? তার অপেক্ষমাণ আবেদনগুলোও মুছে যাবে।")) return;
    setBusyId(id);
    try {
      await adminApi.delete(`/drivers/${id}`);
      notify("ড্রাইভার মুছে ফেলা হয়েছে", "success");
      loadData();
    } catch (err) {
      notify(errorMessage(err, "ডিলিট করা যায়নি"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedTrip(null);
    setApplications([]);
  };

  const logout = () => {
    clearAdminSession();
    navigate("/admin-login", { replace: true });
  };

  const filteredDrivers = useMemo(() => {
    const keyword = search.toLowerCase();
    return drivers.filter((d) => {
      const name = (d.driverName || "").toLowerCase();
      const phone = String(d.phone || "");
      return name.includes(keyword) || phone.includes(keyword);
    });
  }, [drivers, search]);

  const weekRevenue = history.reduce((s, h) => s + (Number(h.tripDetails?.fixedPrice) || 0), 0);

  const nav = [
    { id: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
    { id: "trips", label: "ট্রিপ ম্যানেজ", icon: Truck, count: trips.length },
    { id: "history", label: "সফল ট্রিপ", icon: History, count: history.length },
    { id: "drivers", label: "ড্রাইভার", icon: Users, count: drivers.length }
  ];

  const stats = [
    { label: "সক্রিয় ট্রিপ", value: bn(trips.length), icon: Truck, tint: "#14b8a6" },
    { label: "সফল ট্রিপ (৭ দিন)", value: bn(history.length), icon: CheckCircle2, tint: "#22c55e" },
    { label: "নিবন্ধিত ড্রাইভার", value: bn(drivers.length), icon: Users, tint: "#6366f1" },
    { label: "মোট ভাড়া (৭ দিন)", value: taka(weekRevenue), icon: Wallet, tint: "#f59e0b" }
  ];

  // ---------------- UI পার্টস ----------------

  const TripForm = (
    <form onSubmit={addTrip} className="dt-glass ad-card" style={{ display: "grid", gap: 12 }}>
      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <Plus size={20} color="var(--teal-300)" /> নতুন ট্রিপ অ্যাড করুন
      </h3>
      <div className="ad-2col">
        <label className="dt-field"><span className="dt-label">কোথা থেকে যাবে</span><input className="dt-input" placeholder="যেমন: ঘোড়াশাল" value={inputForm.from} onChange={setField("from")} /></label>
        <label className="dt-field"><span className="dt-label">কোথায় যাবে</span><input className="dt-input" placeholder="যেমন: চট্টগ্রাম" value={inputForm.to} onChange={setField("to")} /></label>
      </div>
      <label className="dt-field"><span className="dt-label">মালামালের বিবরণ</span><input className="dt-input" placeholder="যেমন: সিমেন্ট ৩০০ ব্যাগ" value={inputForm.cargoDetails} onChange={setField("cargoDetails")} /></label>
      <div className="ad-2col">
        <label className="dt-field">
          <span className="dt-label">গাড়ির ধরন</span>
          <select className="dt-input" value={inputForm.requiredVehicleBody} onChange={setField("requiredVehicleBody")}>
            <option value="covered">কভার্ড ভ্যান</option>
            <option value="open">খোলা ট্রাক</option>
          </select>
        </label>
        <label className="dt-field"><span className="dt-label">কত টনের গাড়ি লাগবে</span><input className="dt-input" type="number" min="0" step="0.1" placeholder="ঐচ্ছিক" value={inputForm.requiredCapacity} onChange={setField("requiredCapacity")} /></label>
      </div>
      <div className="ad-2col">
        <label className="dt-field"><span className="dt-label">ভাড়া (টাকা)</span><input className="dt-input" type="number" min="1" placeholder="ভাড়া নির্ধারণ করুন" value={inputForm.fixedPrice} onChange={setField("fixedPrice")} /></label>
        <label className="dt-field"><span className="dt-label">পিকআপের তারিখ ও সময়</span><input className="dt-input" type="datetime-local" value={inputForm.pickupAt} onChange={setField("pickupAt")} /></label>
      </div>
      <button className="dt-btn dt-btn-primary dt-btn-block" type="submit" disabled={saving} style={{ marginTop: 4 }}>
        {saving ? <Loader2 size={18} className="dt-spin" /> : <Plus size={18} />} ঠিক আছে অ্যাড করুন
      </button>
    </form>
  );

  const TripRow = ({ t }) => (
    <Tilt3D max={4} glare={false}>
      <div className="dt-glass ad-card" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 19 }}>
            {t.from} <ArrowRight size={16} style={{ verticalAlign: -2 }} color="var(--teal-300)" /> {t.to}
          </strong>
          <span className="dt-num" style={{ fontSize: 20, fontWeight: 700, color: "var(--teal-300)" }}>{taka(t.fixedPrice)}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="dt-badge dt-badge-teal"><Truck size={13} /> {bodyLabel(t.requiredVehicleBody)}</span>
          <span className="dt-badge dt-badge-amber"><CalendarClock size={13} /> {t.pickupTime}</span>
          {t.requiredCapacity ? <span className="dt-badge dt-badge-green"><Scale size={13} /> {bn(t.requiredCapacity)} টন</span> : null}
        </div>
        <p style={{ margin: 0, color: "rgba(255,255,255,.7)" }}>📦 {t.cargoDetails || "বিবরণ নেই"}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="dt-btn dt-btn-sm" style={{ background: "#f59e0b", color: "#1f1300" }} onClick={() => viewDrivers(t)}>
            <Eye size={16} /> ড্রাইভারদের আবেদন দেখুন
          </button>
          <button className="dt-btn dt-btn-sm dt-btn-danger" onClick={() => deleteTrip(t._id)} disabled={busyId === t._id}>
            {busyId === t._id ? <Loader2 size={16} className="dt-spin" /> : <Trash2 size={16} />} মুছে ফেলুন
          </button>
        </div>
      </div>
    </Tilt3D>
  );

  const HistoryList = ({ items }) =>
    items.length === 0 ? (
      <p style={{ color: "rgba(255,255,255,.6)" }}>গত ৭ দিনে কোনো সম্পন্ন ট্রিপ নেই।</p>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((h) => (
          <div key={h._id} className="dt-glass" style={{ padding: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", borderLeft: "3px solid var(--green-500)" }}>
            <div>
              <strong>{h.tripDetails?.from || "অজানা"} ➜ {h.tripDetails?.to || "অজানা"}</strong>
              <div style={{ color: "rgba(255,255,255,.65)", fontSize: 14, marginTop: 4 }}>
                👤 {h.acceptedDriver?.driverName} • 📞 <a href={`tel:${h.acceptedDriver?.phone}`} style={{ color: "var(--teal-300)" }}>{h.acceptedDriver?.phone}</a> • 🚚 {h.acceptedDriver?.truckType}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="dt-num" style={{ fontWeight: 700, color: "var(--teal-300)" }}>{taka(h.tripDetails?.fixedPrice)}</div>
              <small style={{ color: "rgba(255,255,255,.5)" }}>{fmtDate(h.completedAt)}</small>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="ad-root dt-dark">
      <style>{`
        .ad-root { min-height: 100svh; display: grid; grid-template-columns: 270px 1fr; color: #fff;
          background: radial-gradient(900px 500px at 100% 0%, rgba(20,184,166,.14), transparent 60%), radial-gradient(700px 400px at 0% 100%, rgba(99,102,241,.14), transparent 60%), var(--navy-950); }
        .ad-side { position: sticky; top: 0; height: 100svh; padding: 22px 16px; border-right: 1px solid rgba(255,255,255,.08); background: rgba(10,26,58,.6); backdrop-filter: blur(16px); display: flex; flex-direction: column; gap: 6px; }
        .ad-nav { display: flex; align-items: center; gap: 10px; width: 100%; border: none; cursor: pointer; font-family: inherit; font-size: 15.5px; font-weight: 600; padding: 12px 14px; border-radius: 12px; color: rgba(255,255,255,.75); background: transparent; transition: background .2s, color .2s; text-align: left; }
        .ad-nav:hover { background: rgba(255,255,255,.06); color: #fff; }
        .ad-nav.on { background: linear-gradient(135deg, rgba(45,212,191,.22), rgba(20,184,166,.1)); color: #fff; box-shadow: inset 0 0 0 1px rgba(45,212,191,.35); }
        .ad-count { margin-left: auto; font-size: 12.5px; padding: 1px 8px; border-radius: 99px; background: rgba(255,255,255,.1); }
        .ad-main { padding: 28px 28px 80px; min-width: 0; }
        .ad-card { padding: 20px; }
        .ad-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ad-split { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 22px; align-items: start; }
        .ad-mobile-nav { display: none; }
        .ad-mobile-only { display: none !important; }
        @media (max-width: 1100px) { .ad-stats { grid-template-columns: repeat(2, 1fr); } .ad-split { grid-template-columns: 1fr; } }
        @media (max-width: 860px) {
          .ad-root { grid-template-columns: 1fr; }
          .ad-side { display: none; }
          .ad-mobile-only { display: inline-flex !important; }
          .ad-main { padding: 18px 16px 100px; }
          .ad-mobile-nav { display: grid; grid-template-columns: repeat(4, 1fr); position: fixed; bottom: 0; left: 0; right: 0; z-index: 60; background: rgba(5,13,31,.95); backdrop-filter: blur(14px); border-top: 1px solid rgba(255,255,255,.1); padding: 6px 6px calc(6px + env(safe-area-inset-bottom)); }
          .ad-mobile-nav button { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11.5px; padding: 8px 2px; border: none; background: none; color: rgba(255,255,255,.6); font-family: inherit; font-weight: 600; border-radius: 10px; }
          .ad-mobile-nav button.on { color: var(--teal-300); background: rgba(45,212,191,.1); }
        }
        @media (max-width: 480px) { .ad-2col { grid-template-columns: 1fr; } }
      `}</style>

      {/* LEFT MENU */}
      <aside className="ad-side">
        <div style={{ padding: "4px 6px 18px" }}>
          <Logo light size={40} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.45)", padding: "6px 14px" }}>🚚 এডমিন প্যানেল</span>
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <button key={n.id} className={`ad-nav ${view === n.id ? "on" : ""}`} onClick={() => setView(n.id)}>
              <Icon size={19} /> {n.label}
              {n.count !== undefined && <span className="ad-count dt-num">{bn(n.count)}</span>}
            </button>
          );
        })}
        <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
          <button className="ad-nav" onClick={() => navigate("/")}>
            <Home size={19} /> 🏠 হোম পেজে ফিরুন
          </button>
          <button className="ad-nav" onClick={logout} style={{ color: "#fca5a5" }}>
            <LogOut size={19} /> লগআউট
          </button>
        </div>
      </aside>

      {/* MAIN SCREEN DISPLAY AREA */}
      <main className="ad-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(22px, 3vw, 30px)" }}>{nav.find((n) => n.id === view)?.label}</h1>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.55)" }}>
              {new Date().toLocaleDateString("bn-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={loadData} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? "dt-spin" : undefined} /> রিফ্রেশ
            </button>
            <button className="dt-btn dt-btn-sm dt-btn-danger ad-mobile-only" onClick={logout} aria-label="লগআউট">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={reduce ? false : { opacity: 0, y: 16, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            style={{ transformPerspective: 1200 }}
          >
            {/* ---------- OVERVIEW ---------- */}
            {view === "overview" && (
              <div style={{ display: "grid", gap: 24 }}>
                <div className="ad-stats">
                  {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div key={s.label} initial={reduce ? false : { opacity: 0, rotateY: -30 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ delay: i * 0.08, duration: 0.6 }} style={{ transformPerspective: 900 }}>
                        <Tilt3D max={10}>
                          <div className="dt-glass ad-card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <span style={{ width: 50, height: 50, borderRadius: 14, display: "grid", placeItems: "center", background: s.tint, color: "#fff", boxShadow: `0 12px 26px ${s.tint}55`, transform: "translateZ(30px)", flexShrink: 0 }}>
                              <Icon size={24} />
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div className="dt-num" style={{ fontSize: 24, fontWeight: 700, whiteSpace: "nowrap" }}>{isLoading && !trips.length ? "…" : s.value}</div>
                              <small style={{ color: "rgba(255,255,255,.6)" }}>{s.label}</small>
                            </div>
                          </div>
                        </Tilt3D>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="ad-split">
                  {TripForm}
                  <div style={{ display: "grid", gap: 14 }}>
                    <h3 style={{ margin: 0 }}>আজকের এড করা ট্রিপগুলো ({bn(trips.length)})</h3>
                    {trips.length === 0 && !isLoading && <p style={{ color: "rgba(255,255,255,.6)", margin: 0 }}>কোনো সক্রিয় ট্রিপ পাওয়া যায়নি।</p>}
                    {trips.slice(0, 4).map((t) => <TripRow key={t._id} t={t} />)}
                    {trips.length > 4 && (
                      <button className="dt-btn dt-btn-ghost" onClick={() => setView("trips")}>
                        সব ট্রিপ দেখুন <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 14px" }}>✅ সফল ট্রিপ (শেষ ৭ দিন)</h3>
                  <HistoryList items={history.slice(0, 5)} />
                </div>
              </div>
            )}

            {/* ---------- TRIPS ---------- */}
            {view === "trips" && (
              <div className="ad-split">
                {TripForm}
                <div style={{ display: "grid", gap: 14 }}>
                  {trips.length === 0 && !isLoading && <p style={{ color: "rgba(255,255,255,.6)", margin: 0 }}>কোনো সক্রিয় ট্রিপ পাওয়া যায়নি।</p>}
                  {trips.map((t) => <TripRow key={t._id} t={t} />)}
                </div>
              </div>
            )}

            {/* ---------- HISTORY ---------- */}
            {view === "history" && <HistoryList items={history} />}

            {/* ---------- DRIVERS ---------- */}
            {view === "drivers" && (
              <div>
                <div style={{ position: "relative", marginBottom: 18 }}>
                  <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
                  <input className="dt-input" placeholder="নাম অথবা ফোন দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
                  {filteredDrivers.map((driver) => (
                    <Tilt3D key={driver._id} max={8}>
                      <div className="dt-glass ad-card" style={{ display: "grid", gap: 8, height: "100%" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(135deg, #6366f1, #4338ca)", fontWeight: 700, fontSize: 20, transform: "translateZ(25px)" }}>
                            {(driver.driverName || "?").trim().charAt(0)}
                          </span>
                          <div>
                            <strong style={{ fontSize: 17 }}>👤 {driver.driverName || "নাম নেই"}</strong>
                            <div><a href={`tel:${driver.phone}`} style={{ color: "var(--teal-300)", fontSize: 14 }}>📞 {driver.phone || "ফোন নেই"}</a></div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span className="dt-badge dt-badge-teal">🚚 {driver.truckType || "-"}</span>
                          <span className="dt-badge dt-badge-amber">{driver.vehicleBody === "covered" ? "কভার্ড ভ্যান" : "খোলা ট্রাক"}</span>
                          <span className="dt-badge dt-badge-green">⚖️ {bn(driver.truckCapacity || 0)} টন</span>
                        </div>
                        <small style={{ color: "rgba(255,255,255,.55)" }}>
                          📅 নিবন্ধিত: {fmtDate(driver.createdAt)}
                          {driver.currentLocation?.lat != null && (
                            <>
                              {" • "}
                              <a href={`https://maps.google.com/?q=${driver.currentLocation.lat},${driver.currentLocation.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--teal-300)" }}>
                                📍 সর্বশেষ লোকেশন
                              </a>
                            </>
                          )}
                        </small>
                        <button className="dt-btn dt-btn-sm dt-btn-danger" onClick={() => deleteDriver(driver._id)} disabled={busyId === driver._id} style={{ marginTop: 4 }}>
                          {busyId === driver._id ? <Loader2 size={16} className="dt-spin" /> : <Trash2 size={16} />} ❌ ড্রাইভার মুছে ফেলুন
                        </button>
                      </div>
                    </Tilt3D>
                  ))}
                </div>
                {filteredDrivers.length === 0 && !isLoading && <p style={{ color: "rgba(255,255,255,.6)" }}>কোনো ড্রাইভার পাওয়া যায়নি।</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* মোবাইলের নিচের মেনু */}
      <nav className="ad-mobile-nav" aria-label="এডমিন মেনু">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <button key={n.id} className={view === n.id ? "on" : ""} onClick={() => setView(n.id)}>
              <Icon size={20} />
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* DRIVER RESPONSE POPUP MODAL */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div className="dt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
            <motion.div
              className="dt-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { opacity: 0, rotateX: -25, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1000 }}
            >
              <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", position: "sticky", top: 0, background: "var(--navy-900)", zIndex: 1 }}>
                <div>
                  <small style={{ color: "rgba(255,255,255,.55)" }}>ড্রাইভারদের আবেদন</small>
                  <h3 style={{ margin: "2px 0 0" }}>
                    {selectedTrip.from} ➜ {selectedTrip.to}
                  </h3>
                  <small style={{ color: "var(--teal-300)" }}>
                    <Package size={13} style={{ verticalAlign: -2 }} /> {selectedTrip.cargoDetails} • {taka(selectedTrip.fixedPrice)}
                  </small>
                </div>
                <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={handleCloseModal} aria-label="বন্ধ করুন">
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 20, display: "grid", gap: 12 }}>
                {appsLoading && [0, 1].map((i) => <div key={i} className="dt-skeleton" style={{ height: 120 }} />)}

                {!appsLoading && applications.length === 0 && (
                  <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,.7)" }}>
                    <ClipboardList size={36} color="var(--teal-300)" />
                    <p>এখনো কোনো ড্রাইভার এই ট্রিপ নিতে চায়নি।</p>
                  </div>
                )}

                {applications.map((d) => (
                  <div key={d._id} className="dt-glass" style={{ padding: 16, display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 17 }}>👤 {d.driverName}</strong>
                      <a href={`tel:${d.phone}`} style={{ color: "var(--teal-300)", fontWeight: 700 }}>
                        <Phone size={14} style={{ verticalAlign: -2 }} /> {d.phone}
                      </a>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="dt-badge dt-badge-teal">🚚 {d.truckType}</span>
                      <span className="dt-badge dt-badge-green">⚖️ {bn(d.truckCapacity)} টন</span>
                      <span className="dt-badge dt-badge-amber">{bodyLabel(d.vehicleBody)}</span>
                    </div>
                    <small style={{ color: "rgba(255,255,255,.6)" }}>
                      <MapPin size={13} style={{ verticalAlign: -2 }} />{" "}
                      {d.currentLocation?.lat != null ? (
                        <a href={`https://maps.google.com/?q=${d.currentLocation.lat},${d.currentLocation.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--teal-300)" }}>
                          ম্যাপে লোকেশন দেখুন
                        </a>
                      ) : (
                        "লোকেশন পাওয়া যায়নি"
                      )}
                      {" • "}আবেদন: {new Date(d.appliedAt).toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </small>
                    <button className="dt-btn dt-btn-sm" style={{ background: "var(--green-500)", color: "#052e16", marginTop: 6 }} onClick={() => confirmDriver(d.driverId)} disabled={busyId !== null}>
                      {busyId === d.driverId ? <Loader2 size={16} className="dt-spin" /> : <CheckCircle2 size={16} />} এই ড্রাইভার কনফার্ম করুন
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
