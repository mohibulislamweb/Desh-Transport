import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Phone, LayoutDashboard, Users, ShieldCheck } from "lucide-react";

import { publicApi, getAdminToken } from "./config";
import AuthShell from "./components/AuthShell";
import { notify, errorMessage } from "./components/Toast";
import trailerImg from "./assets/trailer-rain.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    password: ""
  });

  // আগে থেকে লগইন থাকলে সরাসরি প্যানেলে
  useEffect(() => {
    if (getAdminToken()) navigate("/admin", { replace: true });
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await publicApi.post("/admin/login", {
        phone: form.phone,
        password: form.password
      });

      localStorage.setItem("adminToken", res.data.token);

      notify("এডমিন লগইন সফল হয়েছে", "success");
      navigate("/admin");
    } catch (error) {
      notify(errorMessage(error, "এডমিন তথ্য ভুল হয়েছে"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image={trailerImg}
      imageAlt="দেশ ট্রান্সপোর্টের ট্রেইলার"
      title="এডমিন কন্ট্রোল প্যানেল"
      subtitle="ট্রিপ যোগ করুন, ড্রাইভারদের আবেদন দেখুন এবং এক ক্লিকে কনফার্ম করুন।"
      points={[
        { icon: LayoutDashboard, text: "লাইভ ট্রিপ ম্যানেজমেন্ট" },
        { icon: Users, text: "ড্রাইভার তালিকা ও আবেদন" },
        { icon: ShieldCheck, text: "সুরক্ষিত এডমিন অ্যাক্সেস" }
      ]}
    >
      <span className="dt-eyebrow" style={{ marginBottom: 12 }}>
        <Lock size={14} /> শুধুমাত্র এডমিন
      </span>
      <h1 style={{ fontSize: 26, margin: "12px 0 6px" }}>এডমিন লগইন</h1>
      <p style={{ margin: "0 0 24px", color: "var(--ink-soft)" }}>আপনার এডমিন মোবাইল নাম্বার ও পাসওয়ার্ড দিন</p>

      <form onSubmit={login} style={{ display: "grid", gap: 14 }}>
        <label className="dt-field">
          <span className="dt-label"><Phone size={14} style={{ verticalAlign: -2 }} /> মোবাইল নাম্বার</span>
          <input
            className="dt-input"
            type="tel"
            inputMode="numeric"
            placeholder="এডমিন মোবাইল নাম্বার"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            autoComplete="username"
          />
        </label>

        <label className="dt-field">
          <span className="dt-label"><Lock size={14} style={{ verticalAlign: -2 }} /> পাসওয়ার্ড</span>
          <span style={{ position: "relative" }}>
            <input
              className="dt-input"
              type={showPass ? "text" : "password"}
              placeholder="পাসওয়ার্ড"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
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
          লগইন করুন
        </button>
      </form>
    </AuthShell>
  );
};

export default AdminLogin;
