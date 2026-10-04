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
  Package,
  Ban,
  Navigation,
  User
} from "lucide-react";

import { adminApi, clearAdminSession } from "./config";
import Logo from "./components/Logo";
import LocationInfo, { timeAgo } from "./components/LocationInfo";
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

// 🚦 ট্রিপের অবস্থা
const HSTATUS = {
  running: { label: "চলমান", cls: "dt-badge-amber", color: "#f59e0b" },
  completed: { label: "সম্পন্ন", cls: "dt-badge-green", color: "#22c55e" },
  cancelled: { label: "বাতিল", cls: "dt-badge-red", color: "#ef4444" }
};
const statusOf = (h) => HSTATUS[h.status || "completed"];

// বাতিলের সাধারণ কারণ — এক ক্লিকে বেছে নেওয়া যায়
const QUICK_REASONS = ["গ্রাহক বাতিল করেছেন", "মাল প্রস্তুত নয়", "গাড়িতে সমস্যা", "ড্রাইভার আসতে পারেনি", "ভাড়া নিয়ে সমস্যা"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // Core Functional States
  const [trips, setTrips] = useState([]);
  const [running, setRunning] = useState([]);
  const [history, setHistory] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // UI Interaction States
  const [view, setView] = useState("overview");
  const [search, setSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);
  const [inputForm, setInputForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activeRes, runningRes, historyRes, driversRes] = await Promise.all([
        adminApi.get("/trips/active"),
        adminApi.get("/trips/running"),
        adminApi.get("/trips/history/last-7-days"),
        adminApi.get("/drivers/all")
      ]);
      setTrips(activeRes.data || []);
      setRunning(runningRes.data || []);
      setHistory((historyRes.data || []).filter((h) => h.status !== "running"));
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
    if (!window.confirm("ট্রিপটি স্থায়ীভাবে মুছে যাবে, হিস্ট্রিতেও থাকবে না। শুধু ভুল করে যোগ করলে মুছুন। নিশ্চিত?")) return;
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

  // ---------- বাতিল ----------
  const openCancel = (target) => {
    setCancelTarget(target);
    setCancelReason("");
  };

  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      notify("বাতিলের কারণ লিখুন বা বেছে নিন", "error");
      return;
    }
    setBusyId(cancelTarget.id);
    try {
      await adminApi.post(`/trips/${cancelTarget.id}/cancel`, { reason: cancelReason.trim() });
      notify("ট্রিপ বাতিল হয়েছে — হিস্ট্রিতে দেখা যাবে", "success");
      setCancelTarget(null);
      loadData();
    } catch (err) {
      notify(errorMessage(err, "বাতিল করা যায়নি"), "error");
    } finally {
      setBusyId(null);
    }
  };

  const completeTrip = async (tripId) => {
    if (!window.confirm("ট্রিপটি সম্পন্ন হিসেবে চিহ্নিত করবেন?")) return;
    setBusyId(tripId);
    try {
      await adminApi.post(`/trips/${tripId}/complete`);
      notify("ট্রিপ সম্পন্ন হয়েছে", "success");
      loadData();
    } catch (err) {
      notify(errorMessage(err), "error");
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
      notify("ড্রাইভার কনফার্ম হয়েছে — ট্রিপ এখন চলমান", "success");
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

  const filteredHistory = useMemo(
    () => (historyFilter === "all" ? history : history.filter((h) => (h.status || "completed") === historyFilter)),
    [history, historyFilter]
  );

  const weekRevenue = history
    .filter((h) => (h.status || "completed") === "completed")
    .reduce((s, h) => s + (Number(h.tripDetails?.fixedPrice) || 0), 0);

  const nav = [
    { id: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
    { id: "trips", label: "নতুন ট্রিপ", icon: Truck, count: trips.length },
    { id: "running", label: "চলমান ট্রিপ", icon: Navigation, count: running.length },
    { id: "history", label: "হিস্ট্রি", icon: History, count: history.length },
    { id: "drivers", label: "ড্রাইভার", icon: Users, count: drivers.length }
  ];

  const stats = [
    { label: "আবেদনের অপেক্ষায়", value: bn(trips.length), icon: Truck, tint: "#0f766e" },
    { label: "চলমান ট্রিপ", value: bn(running.length), icon: Navigation, tint: "#d97706" },
    { label: "নিবন্ধিত ড্রাইভার", value: bn(drivers.length), icon: Users, tint: "#1d4ed8" },
    { label: "সম্পন্ন ট্রিপের ভাড়া (৭ দিন)", value: taka(weekRevenue), icon: Wallet, tint: "#15803d" }
  ];

  // ---------------- UI পার্টস ----------------

  const TripForm = (
    <form onSubmit={addTrip} className="dt-glass ad-card" style={{ display: "grid", gap: 12 }}>
      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-lg)" }}>
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

  const TripMeta = ({ d }) => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <span className="dt-badge dt-badge-teal"><Truck size={13} /> {bodyLabel(d.requiredVehicleBody)}</span>
      {d.pickupTime && <span className="dt-badge dt-badge-amber"><CalendarClock size={13} /> {d.pickupTime}</span>}
      {d.requiredCapacity ? <span className="dt-badge dt-badge-green"><Scale size={13} /> {bn(d.requiredCapacity)} টন</span> : null}
    </div>
  );

  const RouteTitle = ({ d, price }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
      <strong style={{ fontSize: "var(--fs-lg)" }}>
        {d.from || "অজানা"} <ArrowRight size={16} style={{ verticalAlign: -2 }} color="var(--teal-300)" /> {d.to || "অজানা"}
      </strong>
      <span className="dt-num" style={{ fontSize: "var(--fs-lg)", fontWeight: 700, color: "var(--teal-300)" }}>{taka(price)}</span>
    </div>
  );

  const TripRow = ({ t }) => (
    <div className="dt-glass ad-card" style={{ display: "grid", gap: 10 }}>
      <RouteTitle d={t} price={t.fixedPrice} />
      <TripMeta d={t} />
      <p style={{ margin: 0, color: "rgba(255,255,255,.7)", display: "flex", gap: 6 }}>
        <Package size={16} style={{ marginTop: 3, flexShrink: 0 }} /> {t.cargoDetails || "বিবরণ নেই"}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => viewDrivers(t)}>
          <Eye size={16} /> ড্রাইভারদের আবেদন দেখুন
        </button>
        <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={() => openCancel({ id: t._id, title: `${t.from} → ${t.to}`, running: false })}>
          <Ban size={16} /> বাতিল
        </button>
        <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={() => deleteTrip(t._id)} disabled={busyId === t._id} title="ভুল করে যোগ করলে মুছুন" style={{ color: "#fca5a5" }}>
          {busyId === t._id ? <Loader2 size={16} className="dt-spin" /> : <Trash2 size={16} />} মুছুন
        </button>
      </div>
    </div>
  );

  const DriverLine = ({ a }) => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", fontSize: "var(--fs-sm)" }}>
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 600 }}><User size={15} /> {a?.driverName || "-"}</span>
      {a?.phone && (
        <a href={`tel:${a.phone}`} style={{ color: "var(--teal-300)", display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 600 }}>
          <Phone size={14} /> {a.phone}
        </a>
      )}
      {a?.truckType && <span className="dt-badge dt-badge-teal">{a.truckType}{a.truckCapacity ? ` · ${bn(a.truckCapacity)} টন` : ""}</span>}
    </div>
  );

  const RunningCard = ({ h }) => (
    <div className="dt-glass ad-card" style={{ display: "grid", gap: 10, borderLeft: "3px solid #f59e0b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span className="dt-badge dt-badge-amber">চলমান · {timeAgo(h.completedAt)} কনফার্ম</span>
      </div>
      <RouteTitle d={h.tripDetails || {}} price={h.tripDetails?.fixedPrice} />
      <TripMeta d={h.tripDetails || {}} />
      <DriverLine a={h.acceptedDriver} />
      <LocationInfo location={h.acceptedDriver?.location} label="আবেদনের সময় ড্রাইভারের লোকেশন" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => completeTrip(h.tripId)} disabled={!h.tripId || busyId === h.tripId}>
          {busyId === h.tripId ? <Loader2 size={16} className="dt-spin" /> : <CheckCircle2 size={16} />} সম্পন্ন
        </button>
        <button className="dt-btn dt-btn-sm dt-btn-danger" onClick={() => openCancel({ id: h.tripId, title: `${h.tripDetails?.from} → ${h.tripDetails?.to}`, running: true })} disabled={!h.tripId}>
          <Ban size={16} /> ট্রিপ বাতিল
        </button>
      </div>
    </div>
  );

  const HistoryList = ({ items }) =>
    items.length === 0 ? (
      <p style={{ color: "rgba(255,255,255,.6)" }}>গত ৭ দিনে কোনো রেকর্ড নেই।</p>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((h) => {
          const st = statusOf(h);
          return (
            <div key={h._id} className="dt-glass" style={{ padding: 16, display: "grid", gap: 8, borderLeft: `3px solid ${st.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <strong>
                  {h.tripDetails?.from || "অজানা"} <ArrowRight size={14} style={{ verticalAlign: -2 }} /> {h.tripDetails?.to || "অজানা"}
                </strong>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`dt-badge ${st.cls}`}>{st.label}</span>
                  <span className="dt-num" style={{ fontWeight: 700, color: "var(--teal-300)" }}>{taka(h.tripDetails?.fixedPrice)}</span>
                </span>
              </div>
              {h.acceptedDriver?.driverName ? <DriverLine a={h.acceptedDriver} /> : <small style={{ color: "rgba(255,255,255,.55)" }}>কোনো ড্রাইভার কনফার্ম হয়নি</small>}
              {h.status === "cancelled" && h.cancelReason && (
                <small style={{ color: "#fca5a5" }}>বাতিলের কারণ: {h.cancelReason}</small>
              )}
              <small style={{ color: "rgba(255,255,255,.5)" }}>{fmtDate(h.finishedAt || h.completedAt)}</small>
            </div>
          );
        })}
      </div>
    );

  return (
    <div className="ad-root dt-dark">
      <style>{`
        .ad-root { min-height: 100svh; display: grid; grid-template-columns: 260px 1fr; color: #fff; background: #0b1424; }
        .ad-side { position: sticky; top: 0; height: 100svh; padding: 20px 14px; border-right: 1px solid rgba(255,255,255,.08); background: #0a1220; display: flex; flex-direction: column; gap: 4px; }
        .ad-nav { display: flex; align-items: center; gap: 10px; width: 100%; border: none; cursor: pointer; font-family: inherit; font-size: var(--fs-sm); font-weight: 600; padding: 11px 12px; border-radius: var(--radius); color: rgba(255,255,255,.72); background: transparent; transition: background .2s, color .2s; text-align: left; }
        .ad-nav:hover { background: rgba(255,255,255,.05); color: #fff; }
        .ad-nav.on { background: rgba(15,118,110,.22); color: #fff; }
        .ad-count { margin-left: auto; font-size: var(--fs-xs); padding: 1px 8px; border-radius: var(--radius-sm); background: rgba(255,255,255,.08); }
        .ad-main { padding: 28px 28px 80px; min-width: 0; }
        .ad-card { padding: 18px; }
        .ad-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ad-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .ad-split { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 22px; align-items: start; }
        .ad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr)); gap: 14px; }
        .ad-mobile-nav { display: none; }
        .ad-mobile-only { display: none !important; }
        .ad-chip { border: 1px solid rgba(255,255,255,.18); background: transparent; color: rgba(255,255,255,.8); padding: 6px 12px; border-radius: var(--radius-sm); font-family: inherit; font-size: var(--fs-sm); cursor: pointer; }
        .ad-chip.on { background: #fff; color: var(--ink); border-color: #fff; }
        @media (max-width: 1100px) { .ad-stats { grid-template-columns: repeat(2, 1fr); } .ad-split { grid-template-columns: 1fr; } }
        @media (max-width: 860px) {
          .ad-root { grid-template-columns: 1fr; }
          .ad-side { display: none; }
          .ad-mobile-only { display: inline-flex !important; }
          .ad-main { padding: 18px 16px 100px; }
          .ad-mobile-nav { display: grid; grid-template-columns: repeat(5, 1fr); position: fixed; bottom: 0; left: 0; right: 0; z-index: 60; background: #0a1220; border-top: 1px solid rgba(255,255,255,.1); padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); }
          .ad-mobile-nav button { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; padding: 8px 2px; border: none; background: none; color: rgba(255,255,255,.6); font-family: inherit; font-weight: 600; border-radius: var(--radius-sm); }
          .ad-mobile-nav button.on { color: var(--teal-300); background: rgba(45,212,191,.08); }
        }
        @media (max-width: 480px) { .ad-2col { grid-template-columns: 1fr; } }
      `}</style>

      {/* LEFT MENU */}
      <aside className="ad-side">
        <div style={{ padding: "4px 6px 18px" }}>
          <Logo light size={38} />
        </div>
        <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "rgba(255,255,255,.4)", padding: "6px 12px" }}>এডমিন প্যানেল</span>
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <button key={n.id} className={`ad-nav ${view === n.id ? "on" : ""}`} onClick={() => setView(n.id)}>
              <Icon size={18} /> {n.label}
              {n.count !== undefined && <span className="ad-count dt-num">{bn(n.count)}</span>}
            </button>
          );
        })}
        <div style={{ marginTop: "auto", display: "grid", gap: 4 }}>
          <button className="ad-nav" onClick={() => navigate("/")}>
            <Home size={18} /> হোম পেজে ফিরুন
          </button>
          <button className="ad-nav" onClick={logout} style={{ color: "#fca5a5" }}>
            <LogOut size={18} /> লগআউট
          </button>
        </div>
      </aside>

      {/* MAIN SCREEN DISPLAY AREA */}
      <main className="ad-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-xl)" }}>{nav.find((n) => n.id === view)?.label}</h1>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.55)", fontSize: "var(--fs-sm)" }}>
              {new Date().toLocaleDateString("bn-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={loadData} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? "dt-spin" : undefined} /> রিফ্রেশ
            </button>
            <button className="dt-btn dt-btn-sm dt-btn-ghost ad-mobile-only" onClick={logout} aria-label="লগআউট">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {/* ---------- OVERVIEW ---------- */}
            {view === "overview" && (
              <div style={{ display: "grid", gap: 24 }}>
                <div className="ad-stats">
                  {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="dt-glass ad-card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <span style={{ width: 44, height: 44, borderRadius: "var(--radius)", display: "grid", placeItems: "center", background: s.tint, color: "#fff", flexShrink: 0 }}>
                          <Icon size={22} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div className="dt-num" style={{ fontSize: "var(--fs-lg)", fontWeight: 700, whiteSpace: "nowrap" }}>{isLoading && !trips.length ? "…" : s.value}</div>
                          <small style={{ color: "rgba(255,255,255,.6)" }}>{s.label}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {running.length > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: "var(--fs-lg)" }}>চলমান ট্রিপ ({bn(running.length)})</h3>
                      <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={() => setView("running")}>সব দেখুন <ArrowRight size={15} /></button>
                    </div>
                    <div className="ad-grid">{running.slice(0, 2).map((h) => <RunningCard key={h._id} h={h} />)}</div>
                  </div>
                )}

                <div className="ad-split">
                  {TripForm}
                  <div style={{ display: "grid", gap: 14 }}>
                    <h3 style={{ margin: 0, fontSize: "var(--fs-lg)" }}>আবেদনের অপেক্ষায় ({bn(trips.length)})</h3>
                    {trips.length === 0 && !isLoading && <p style={{ color: "rgba(255,255,255,.6)", margin: 0 }}>কোনো সক্রিয় ট্রিপ পাওয়া যায়নি।</p>}
                    {trips.slice(0, 4).map((t) => <TripRow key={t._id} t={t} />)}
                    {trips.length > 4 && (
                      <button className="dt-btn dt-btn-ghost" onClick={() => setView("trips")}>
                        সব ট্রিপ দেখুন <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---------- NEW TRIPS ---------- */}
            {view === "trips" && (
              <div className="ad-split">
                {TripForm}
                <div style={{ display: "grid", gap: 14 }}>
                  {trips.length === 0 && !isLoading && <p style={{ color: "rgba(255,255,255,.6)", margin: 0 }}>কোনো সক্রিয় ট্রিপ পাওয়া যায়নি।</p>}
                  {trips.map((t) => <TripRow key={t._id} t={t} />)}
                </div>
              </div>
            )}

            {/* ---------- RUNNING ---------- */}
            {view === "running" &&
              (running.length ? (
                <div className="ad-grid">{running.map((h) => <RunningCard key={h._id} h={h} />)}</div>
              ) : (
                <p style={{ color: "rgba(255,255,255,.6)" }}>এখন কোনো চলমান ট্রিপ নেই। ড্রাইভার কনফার্ম করলে ট্রিপ এখানে আসবে।</p>
              ))}

            {/* ---------- HISTORY ---------- */}
            {view === "history" && (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    ["all", "সব"],
                    ["completed", "সম্পন্ন"],
                    ["cancelled", "বাতিল"]
                  ].map(([id, label]) => (
                    <button key={id} className={`ad-chip ${historyFilter === id ? "on" : ""}`} onClick={() => setHistoryFilter(id)}>
                      {label} ({bn(id === "all" ? history.length : history.filter((h) => (h.status || "completed") === id).length)})
                    </button>
                  ))}
                </div>
                <HistoryList items={filteredHistory} />
              </div>
            )}

            {/* ---------- DRIVERS ---------- */}
            {view === "drivers" && (
              <div>
                <div style={{ position: "relative", marginBottom: 18 }}>
                  <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }} />
                  <input className="dt-input" placeholder="নাম অথবা ফোন দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
                </div>
                <div className="ad-grid">
                  {filteredDrivers.map((driver) => (
                    <div key={driver._id} className="dt-glass ad-card" style={{ display: "grid", gap: 10, height: "100%" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ width: 42, height: 42, borderRadius: "var(--radius)", display: "grid", placeItems: "center", background: "#1d4ed8", fontWeight: 700, fontSize: "var(--fs-lg)" }}>
                          {(driver.driverName || "?").trim().charAt(0)}
                        </span>
                        <div>
                          <strong>{driver.driverName || "নাম নেই"}</strong>
                          <div>
                            <a href={`tel:${driver.phone}`} style={{ color: "var(--teal-300)", fontSize: "var(--fs-sm)" }}>
                              {driver.phone || "ফোন নেই"}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="dt-badge dt-badge-teal">{driver.truckType || "-"}</span>
                        <span className="dt-badge dt-badge-amber">{driver.vehicleBody === "covered" ? "কভার্ড ভ্যান" : "খোলা ট্রাক"}</span>
                        <span className="dt-badge dt-badge-green">{bn(driver.truckCapacity || 0)} টন</span>
                      </div>
                      <LocationInfo location={driver.currentLocation} label="সর্বশেষ লোকেশন" />
                      <small style={{ color: "rgba(255,255,255,.5)" }}>নিবন্ধিত: {fmtDate(driver.createdAt)}</small>
                      <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={() => deleteDriver(driver._id)} disabled={busyId === driver._id} style={{ color: "#fca5a5" }}>
                        {busyId === driver._id ? <Loader2 size={16} className="dt-spin" /> : <Trash2 size={16} />} ড্রাইভার মুছে ফেলুন
                      </button>
                    </div>
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
              <Icon size={19} />
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
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", position: "sticky", top: 0, background: "var(--navy-900)", zIndex: 1 }}>
                <div>
                  <small style={{ color: "rgba(255,255,255,.55)" }}>ড্রাইভারদের আবেদন</small>
                  <h3 style={{ margin: "2px 0 0" }}>
                    {selectedTrip.from} <ArrowRight size={16} style={{ verticalAlign: -2 }} /> {selectedTrip.to}
                  </h3>
                  <small style={{ color: "var(--teal-300)" }}>
                    {selectedTrip.cargoDetails} · {taka(selectedTrip.fixedPrice)}
                  </small>
                </div>
                <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={handleCloseModal} aria-label="বন্ধ করুন">
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 18, display: "grid", gap: 12 }}>
                {appsLoading && [0, 1].map((i) => <div key={i} className="dt-skeleton" style={{ height: 140 }} />)}

                {!appsLoading && applications.length === 0 && (
                  <div style={{ textAlign: "center", padding: 24, color: "rgba(255,255,255,.7)" }}>
                    <ClipboardList size={34} color="var(--teal-300)" />
                    <p>এখনো কোনো ড্রাইভার এই ট্রিপ নিতে চায়নি।</p>
                  </div>
                )}

                {applications.map((d) => (
                  <div key={d._id} className="dt-glass" style={{ padding: 14, display: "grid", gap: 10 }}>
                    <DriverLine a={d} />
                    <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="dt-badge dt-badge-amber">{bodyLabel(d.vehicleBody)}</span>
                      <span className="dt-badge" style={{ background: "rgba(255,255,255,.06)" }}>আবেদন: {timeAgo(d.appliedAt)}</span>
                    </span>
                    <LocationInfo location={d.currentLocation} label="আবেদনের সময় ড্রাইভার যেখানে ছিলেন" />
                    <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => confirmDriver(d.driverId)} disabled={busyId !== null}>
                      {busyId === d.driverId ? <Loader2 size={16} className="dt-spin" /> : <CheckCircle2 size={16} />} এই ড্রাইভার কনফার্ম করুন
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCEL MODAL */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div className="dt-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCancelTarget(null)}>
            <motion.div
              className="dt-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              style={{ width: "min(480px, 100%)" }}
            >
              <div style={{ padding: 20, display: "grid", gap: 14 }}>
                <div>
                  <h3 style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}>
                    <Ban size={20} color="#fca5a5" /> ট্রিপ বাতিল করুন
                  </h3>
                  <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.7)" }}>
                    {cancelTarget.title}
                    {cancelTarget.running ? " — এই চলমান ট্রিপের ড্রাইভারকে ফোনে জানিয়ে দিন।" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {QUICK_REASONS.map((r) => (
                    <button key={r} type="button" className={`ad-chip ${cancelReason === r ? "on" : ""}`} onClick={() => setCancelReason(r)}>
                      {r}
                    </button>
                  ))}
                </div>
                <label className="dt-field">
                  <span className="dt-label">বাতিলের কারণ</span>
                  <textarea className="dt-input" rows={3} maxLength={300} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="কারণ লিখুন…" style={{ resize: "vertical" }} />
                </label>
                <small style={{ color: "rgba(255,255,255,.55)" }}>বাতিল ট্রিপ মুছে যাবে না — হিস্ট্রিতে "বাতিল" হিসেবে কারণসহ থাকবে।</small>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={() => setCancelTarget(null)}>ফিরে যান</button>
                  <button className="dt-btn dt-btn-sm dt-btn-danger" onClick={submitCancel} disabled={busyId === cancelTarget.id}>
                    {busyId === cancelTarget.id ? <Loader2 size={16} className="dt-spin" /> : <Ban size={16} />} বাতিল নিশ্চিত করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
