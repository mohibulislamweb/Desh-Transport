import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { LogOut, Truck, ClipboardList, History, MapPin, Phone, Scale, RefreshCw, Loader2, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";

import { publicApi, driverApi, getDriver, saveDriverSession, getDriverToken, clearDriverSession } from "./config";
import AppHeader from "./components/AppHeader";
import TripCard, { bodyLabel, taka } from "./components/TripCard";
import Tilt3D from "./components/Tilt3D";
import { notify, errorMessage } from "./components/Toast";
import { bn } from "./components/Counter";
import { getLocation } from "./utils/geo";
import LocationInfo from "./components/LocationInfo";

const STATUS = {
  pending: { label: "অপেক্ষমাণ", cls: "dt-badge-amber", icon: Clock },
  accepted: { label: "কনফার্ম হয়েছে", cls: "dt-badge-green", icon: CheckCircle2 },
  rejected: { label: "নির্বাচিত হয়নি", cls: "dt-badge-red", icon: XCircle }
};

// হিস্ট্রির ট্রিপের অবস্থা
const HSTATUS = {
  running: { label: "চলমান", cls: "dt-badge-amber" },
  completed: { label: "সম্পন্ন", cls: "dt-badge-green" },
  cancelled: { label: "বাতিল", cls: "dt-badge-red" }
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [driver, setDriver] = useState(getDriver);
  const [tab, setTab] = useState("active");
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [locating, setLocating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [active, history, apps, me] = await Promise.all([
        publicApi.get("/trips/active"),
        // শুধু নিজের হিস্ট্রি (আগে সবার হিস্ট্রি এনে ফিল্টার করা হতো)
        driverApi.get("/drivers/history"),
        driverApi.get("/trips/my-applications"),
        driverApi.get("/drivers/me")
      ]);
      setTrips(active.data || []);
      setMyTrips(history.data || []);
      setApplications(apps.data || []);
      if (me.data?.driver) {
        setDriver(me.data.driver);
        saveDriverSession(getDriverToken(), me.data.driver);
      }
    } catch (err) {
      if (err.response?.status !== 401) notify(errorMessage(err, "তথ্য লোড করা যায়নি"), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const appliedIds = useMemo(() => new Set(applications.map((a) => String(a.tripId))), [applications]);
  const tripById = useMemo(() => Object.fromEntries(trips.map((t) => [String(t._id), t])), [trips]);

  const applyTrip = async (tripId) => {
    setApplyingId(tripId);
    try {
      // 📍 সঠিক লোকেশন বাধ্যতামূলক
      const location = await getLocation();
      if (location.error) {
        notify(location.error, "error");
        return;
      }
      await driverApi.post("/trips/apply-trip", {
        tripId,
        currentLocation: location
      });
      notify("আপনার অনুরোধ লোকেশনসহ এডমিনের কাছে পাঠানো হয়েছে", "success");
      loadData();
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setApplyingId(null);
    }
  };

  const updateLocation = async () => {
    setLocating(true);
    const location = await getLocation();
    if (location.error) {
      setLocating(false);
      notify(location.error, "error");
      return;
    }
    try {
      const res = await driverApi.post("/drivers/location", location);
      const place = res.data?.location?.placeName;
      notify(place ? `লোকেশন আপডেট হয়েছে: ${place}` : "আপনার লোকেশন আপডেট হয়েছে", "success");
      if (res.data?.location) setDriver((d) => ({ ...d, currentLocation: res.data.location }));
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLocating(false);
    }
  };

  const logout = () => {
    clearDriverSession();
    navigate("/", { replace: true });
  };

  // শুধু সম্পন্ন ট্রিপের ভাড়া গোনা হবে (বাতিল বা চলমান নয়)
  const doneTrips = myTrips.filter((t) => (t.status || "completed") === "completed");
  const runningTrips = myTrips.filter((t) => t.status === "running");
  const earnings = doneTrips.reduce((sum, t) => sum + (Number(t.tripDetails?.fixedPrice) || 0), 0);

  const tabs = [
    { id: "active", label: "নতুন ট্রিপ", icon: Truck, count: trips.length },
    { id: "applied", label: "আমার আবেদন", icon: ClipboardList, count: applications.length },
    { id: "history", label: "আমার ট্রিপ", icon: History, count: myTrips.length }
  ];

  return (
    <div className="dt-dark" style={{ minHeight: "100svh", color: "#fff", background: "#0b1424" }}>
      <AppHeader
        right={
          <>
            <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={loadData} disabled={loading} aria-label="রিফ্রেশ">
              <RefreshCw size={16} className={loading ? "dt-spin" : undefined} />
            </button>
            <button className="dt-btn dt-btn-sm dt-btn-ghost" onClick={logout}>
              <LogOut size={16} /> লগআউট
            </button>
          </>
        }
      />

      <main className="dt-container" style={{ padding: "32px 20px 80px" }}>
        {/* প্রোফাইল কার্ড (3D) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, rotateX: 30, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 1200 }}
        >
          <Tilt3D max={5}>
            <section
              style={{
                borderRadius: 26,
                padding: "26px 26px",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.14)",
                display: "grid",
                gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)",
                gap: 22,
                alignItems: "center"
              }}
              className="dd-profile"
            >
              <style>{`@media (max-width: 760px){ .dd-profile{ grid-template-columns: 1fr !important; } }`}</style>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--brand)", color: "#fff", fontSize: 26, fontWeight: 700, transform: "translateZ(40px)", flexShrink: 0 }}>
                  {(driver?.driverName || "D").trim().charAt(0)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, color: "rgba(255,255,255,.7)", fontSize: 14 }}>স্বাগতম</p>
                  <h1 style={{ margin: "2px 0 8px", fontSize: 26 }}>{driver?.driverName || "ড্রাইভার"}</h1>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="dt-badge dt-badge-teal"><Truck size={14} /> {driver?.truckType || "-"}</span>
                    <span className="dt-badge dt-badge-green"><Scale size={14} /> {bn(driver?.truckCapacity || 0)} টন</span>
                    <span className="dt-badge dt-badge-amber">{bodyLabel(driver?.vehicleBody)}</span>
                    <span className="dt-badge" style={{ background: "rgba(255,255,255,.08)" }}><Phone size={14} /> {driver?.phone}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="dt-glass" style={{ padding: 16, borderRadius: 18 }}>
                  <small style={{ color: "rgba(255,255,255,.65)" }}>সম্পন্ন ট্রিপ{runningTrips.length ? ` · চলমান ${bn(runningTrips.length)}` : ""}</small>
                  <div className="dt-num" style={{ fontSize: 26, fontWeight: 700 }}>{bn(doneTrips.length)}</div>
                </div>
                <div className="dt-glass" style={{ padding: 16, borderRadius: 18 }}>
                  <small style={{ color: "rgba(255,255,255,.65)" }}>মোট ভাড়া</small>
                  <div className="dt-num" style={{ fontSize: 22, fontWeight: 700, color: "var(--teal-300)" }}>{taka(earnings)}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <LocationInfo location={driver?.currentLocation} label="আমার সর্বশেষ লোকেশন" />
                </div>
                <button className="dt-btn dt-btn-ghost dt-btn-sm" onClick={updateLocation} disabled={locating} style={{ gridColumn: "1 / -1" }}>
                  {locating ? <Loader2 size={16} className="dt-spin" /> : <MapPin size={16} />} আমার লোকেশন আপডেট করুন
                </button>
              </div>
            </section>
          </Tilt3D>
        </motion.div>

        {/* ট্যাব */}
        <div role="tablist" style={{ display: "flex", gap: 8, margin: "28px 0 22px", overflowX: "auto", paddingBottom: 4 }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className="dt-btn dt-btn-sm"
                style={{
                  background: on ? "#fff" : "rgba(255,255,255,.06)",
                  color: on ? "var(--ink)" : "#fff",
                  borderColor: on ? "transparent" : "rgba(255,255,255,.12)"
                }}
              >
                <Icon size={16} /> {t.label}
                <span className="dt-num" style={{ background: on ? "rgba(4,47,46,.15)" : "rgba(255,255,255,.1)", borderRadius: 99, padding: "0 8px", fontSize: 13 }}>{bn(t.count)}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 16, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            style={{ transformPerspective: 1000 }}
          >
            {loading && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 20 }}>{[0, 1, 2].map((i) => <div key={i} className="dt-skeleton" style={{ height: 220 }} />)}</div>}

            {!loading && tab === "active" && (
              trips.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 20 }}>
                  {trips.map((t) => (
                    <TripCard key={t._id} trip={t} onApply={applyTrip} applying={applyingId === t._id} applied={appliedIds.has(String(t._id))} />
                  ))}
                </div>
              ) : (
                <Empty text="এখন কোনো নতুন ট্রিপ নেই। একটু পর আবার দেখুন।" />
              )
            )}

            {!loading && tab === "applied" && (
              applications.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {applications.map((a) => {
                    const s = STATUS[a.status] || STATUS.pending;
                    const Icon = s.icon;
                    const t = tripById[String(a.tripId)];
                    return (
                      <div key={a._id} className="dt-glass" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <div>
                          <strong style={{ fontSize: 17 }}>
                            {t ? <>{t.from} <ArrowRight size={15} style={{ verticalAlign: -2 }} /> {t.to}</> : "ট্রিপ (আর তালিকায় নেই)"}
                          </strong>
                          <div style={{ color: "rgba(255,255,255,.6)", fontSize: 14, marginTop: 4 }}>
                            আবেদন: {new Date(a.appliedAt).toLocaleString("bn-BD", { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}
                            {t ? ` • ${taka(t.fixedPrice)}` : ""}
                          </div>
                        </div>
                        <span className={`dt-badge ${s.cls}`} style={{ padding: "7px 12px" }}>
                          <Icon size={15} /> {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty text="আপনি এখনো কোনো ট্রিপে আবেদন করেননি।" />
              )
            )}

            {!loading && tab === "history" && (
              myTrips.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {myTrips.map((h) => (
                    <div key={h._id} className="dt-glass" style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div>
                        <strong style={{ fontSize: 17 }}>
                          {h.tripDetails?.from} <ArrowRight size={15} style={{ verticalAlign: -2 }} /> {h.tripDetails?.to}
                        </strong>
                        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 14, marginTop: 4 }}>
                          {h.tripDetails?.cargoDetails} · {h.tripDetails?.pickupTime}
                        </div>
                        {h.status === "cancelled" && h.cancelReason && (
                          <div style={{ color: "#fca5a5", fontSize: 13, marginTop: 4 }}>বাতিলের কারণ: {h.cancelReason}</div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", display: "grid", gap: 4, justifyItems: "end" }}>
                        <span className={`dt-badge ${HSTATUS[h.status || "completed"].cls}`}>{HSTATUS[h.status || "completed"].label}</span>
                        <div className="dt-num" style={{ fontSize: 20, fontWeight: 700, color: "var(--teal-300)" }}>{taka(h.tripDetails?.fixedPrice)}</div>
                        <small style={{ color: "rgba(255,255,255,.55)" }}>{new Date(h.completedAt).toLocaleDateString("bn-BD")}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty text="এখনো কোনো ট্রিপ কনফার্ম হয়নি।" />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const Empty = ({ text }) => (
  <div className="dt-glass" style={{ padding: 40, textAlign: "center" }}>
    <Truck size={40} color="var(--teal-300)" />
    <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,.75)" }}>{text}</p>
  </div>
);

export default DriverDashboard;
