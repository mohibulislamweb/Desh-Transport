import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Phone, Lock, User, Truck, Scale, Wallet, CalendarClock, ShieldCheck } from "lucide-react";

import { publicApi, saveDriverSession, getDriver, getDriverToken } from "./config";
import AuthShell from "./components/AuthShell";
import { notify, errorMessage } from "./components/Toast";
import fleetImg from "./assets/fleet-highway.jpg";

const AuthPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const API = "/drivers";

  // ?mode=signup হলে সরাসরি রেজিস্ট্রেশন ফর্ম
  const [login, setLogin] = useState(params.get("mode") !== "signup");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    driverName: "",
    phone: "",
    password: "",
    truckType: "",
    truckCapacity: "",
    vehicleBody: "covered"
  });

  // আগে থেকে লগইন থাকলে সরাসরি ড্যাশবোর্ড
  useEffect(() => {
    if (getDriverToken() && getDriver()) navigate("/driver", { replace: true });
  }, [navigate]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const switchMode = (toLogin) => {
    setLogin(toLogin);
    setParams(toLogin ? {} : { mode: "signup" }, { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (login) {
        const res = await publicApi.post(`${API}/login`, {
          phone: form.phone,
          password: form.password
        });

        // Token Save + Full Driver Save
        // (Trip apply এর জন্য driverId, driverName, driverPhone ও সেভ হয়)
        saveDriverSession(res.data.token, res.data.driver);

        notify("লগইন সফল হয়েছে", "success");
        navigate("/driver");
      } else {
        await publicApi.post(`${API}/signup`, {
          driverName: form.driverName,
          phone: form.phone,
          password: form.password,
          truckType: form.truckType,
          truckCapacity: Number(form.truckCapacity),
          vehicleBody: form.vehicleBody
        });

        notify("রেজিস্ট্রেশন সফল হয়েছে, এখন লগইন করুন", "success");
        setForm({ ...form, password: "" });
        switchMode(true);
      }
    } catch (err) {
      notify(errorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image={fleetImg}
      imageAlt="দেশ ট্রান্সপোর্টের গাড়ির বহর"
      title="চালকদের জন্য দেশ ট্রান্সপোর্ট"
      subtitle="রেজিস্ট্রেশন করুন, মোবাইলেই নতুন ট্রিপ দেখুন এবং এক ক্লিকে আবেদন করুন।"
      points={[
        { icon: Wallet, text: "এডমিন নির্ধারিত ফিক্সড ভাড়া" },
        { icon: CalendarClock, text: "প্রতিদিন নতুন ট্রিপ" },
        { icon: ShieldCheck, text: "নিরাপদ অ্যাকাউন্ট ও তথ্য" }
      ]}
    >
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>{login ? "ড্রাইভার লগইন" : "ড্রাইভার রেজিস্ট্রেশন"}</h1>
      <p style={{ margin: "0 0 22px", color: "var(--ink-soft)" }}>
        {login ? "মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে প্রবেশ করুন" : "আপনার ও গাড়ির তথ্য দিয়ে অ্যাকাউন্ট খুলুন"}
      </p>

      {/* লগইন / রেজিস্ট্রেশন ট্যাব */}
      <div role="tablist" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-soft)", borderRadius: 14, padding: 4, marginBottom: 22 }}>
        {[
          ["লগইন", true],
          ["রেজিস্ট্রেশন", false]
        ].map(([label, val]) => (
          <button
            key={label}
            role="tab"
            aria-selected={login === val}
            type="button"
            onClick={() => switchMode(val)}
            style={{
              border: "none",
              borderRadius: 11,
              padding: "10px",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              background: login === val ? "#fff" : "transparent",
              color: login === val ? "var(--navy-800)" : "var(--ink-soft)",
              boxShadow: login === val ? "var(--shadow-sm)" : "none",
              transition: "all .25s"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        {!login && (
          <>
            <label className="dt-field">
              <span className="dt-label"><User size={14} style={{ verticalAlign: -2 }} /> চালকের নাম</span>
              <input className="dt-input" placeholder="চালকের নাম" value={form.driverName} onChange={set("driverName")} required autoComplete="name" />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label className="dt-field">
                <span className="dt-label"><Truck size={14} style={{ verticalAlign: -2 }} /> গাড়ির ধরন</span>
                <select className="dt-input" value={form.truckType} onChange={set("truckType")} required>
                  <option value="">বেছে নিন</option>
                  <option value="পিকআপ">পিকআপ</option>
                  <option value="কভার্ড ভ্যান">কভার্ড ভ্যান</option>
                  <option value="ট্রাক">ট্রাক</option>
                  <option value="ট্রেইলার">ট্রেইলার</option>
                </select>
              </label>
              <label className="dt-field">
                <span className="dt-label"><Scale size={14} style={{ verticalAlign: -2 }} /> ধারণক্ষমতা</span>
                <input className="dt-input" type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="গাড়ি কত টন" value={form.truckCapacity} onChange={set("truckCapacity")} required />
              </label>
            </div>

            <label className="dt-field">
              <span className="dt-label">গাড়ির বডি</span>
              <select className="dt-input" value={form.vehicleBody} onChange={set("vehicleBody")}>
                <option value="covered">কভার্ড (ঢাকা গাড়ি)</option>
                <option value="open">খোলা গাড়ি</option>
              </select>
            </label>
          </>
        )}

        <label className="dt-field">
          <span className="dt-label"><Phone size={14} style={{ verticalAlign: -2 }} /> মোবাইল নাম্বার</span>
          <input className="dt-input" type="tel" inputMode="numeric" placeholder="01XXXXXXXXX" value={form.phone} onChange={set("phone")} required autoComplete="tel" />
        </label>

        <label className="dt-field">
          <span className="dt-label"><Lock size={14} style={{ verticalAlign: -2 }} /> পাসওয়ার্ড</span>
          <span style={{ position: "relative" }}>
            <input
              className="dt-input"
              type={showPass ? "text" : "password"}
              placeholder={login ? "পাসওয়ার্ড" : "কমপক্ষে ৬ অক্ষর"}
              value={form.password}
              onChange={set("password")}
              required
              minLength={login ? undefined : 6}
              autoComplete={login ? "current-password" : "new-password"}
              style={{ paddingRight: 46 }}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-soft)", padding: 6 }}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        <button className="dt-btn dt-btn-navy dt-btn-block" type="submit" disabled={loading} style={{ marginTop: 6, padding: "14px" }}>
          {loading && <Loader2 size={18} className="dt-spin" />}
          {login ? "লগইন করুন" : "রেজিস্ট্রেশন করুন"}
        </button>

        {loading && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-soft)", textAlign: "center" }}>
            সার্ভার চালু হতে প্রথমবার কিছুক্ষণ সময় লাগতে পারে…
          </p>
        )}
      </form>

      <p style={{ textAlign: "center", margin: "20px 0 0", color: "var(--ink-soft)" }}>
        {login ? "অ্যাকাউন্ট নেই? " : "আগে থেকে অ্যাকাউন্ট আছে? "}
        <button type="button" onClick={() => switchMode(!login)} style={{ border: "none", background: "none", color: "var(--teal-500)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 15 }}>
          {login ? "রেজিস্ট্রেশন করুন" : "লগইন করুন"}
        </button>
      </p>
    </AuthShell>
  );
};

export default AuthPage;
