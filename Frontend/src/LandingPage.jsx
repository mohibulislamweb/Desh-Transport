import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import MapWatermark from "./MapWatermark";
import { useNavigate, Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence
} from "framer-motion";
import {
  Truck,
  Package,
  Container,
  Phone,
  MessageCircle,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  Lock,
  Navigation,
  ArrowRight,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Route,
  BadgeCheck,
  Wallet,
  Users,
  CalendarClock,
  Scale
} from "lucide-react";
import logoImg from "./desh logo.jpeg";
import fleetImg from "./assets/fleet-highway.jpg";
import openTruckImg from "./assets/open-truck-loading.jpg";
import trailerImg from "./assets/trailer-rain.jpg";
import driverPortraitImg from "./assets/driver-portrait.jpg";
import review1Img from "./assets/review-1.jpg";
import review2Img from "./assets/review-2.jpg";
import bannerImg from "./assets/banner.jpeg";
import routeVideo from "./assets/Same_shot_as_above_but_framed.mp4";

import Tilt3D from "./components/Tilt3D";
import Counter, { bn } from "./components/Counter";
import Logo from "./components/Logo";
import { publicApi } from "./config";

// ===============================
// 📞 যোগাযোগ
// ===============================
const PHONE_MAIN = "01853389495";
const PHONE_ALT = "01715708008";

const whatsappHref =
  "https://wa.me/8801853389495?text=" +
  encodeURIComponent(
    `আসসালামু আলাইকুম।\n\nআমি দেশ ট্রান্সপোর্ট থেকে গাড়ি নিতে চাই।\n\nলোকেশন:\nগন্তব্য:\nমালামালের ধরন:\nগাড়ির ধরন:\n\nদয়া করে আমাকে সহযোগিতা করুন।`
  );

const developerHref =
  "https://wa.me/8801853389495?text=" +
  encodeURIComponent(`আসসালামু আলাইকুম।\n\nআমি দেশ ট্রান্সপোর্ট ওয়েবসাইট সম্পর্কে যোগাযোগ করছি।`);

// ===============================
// 📋 কনটেন্ট
// ===============================
const trustStats = [
  { icon: Clock, to: 2018, suffix: "", label: "থেকে সেবায়", plain: true },
  { icon: Truck, to: 500, suffix: "+", label: "গাড়ির বহর" },
  { icon: Package, to: 1000, suffix: "+", label: "সফল ডেলিভারি" },
  { icon: ShieldCheck, text: "২৪/৭", label: "সাপোর্ট টিম" }
];

const valueProps = [
  {
    icon: ShieldCheck,
    title: "নিরাপদ ও যাচাইকৃত",
    desc: "প্রতিটি চালক যাচাই করা, প্রতিটি ট্রিপ ইন্স্যুরেন্স কাভারেজের আওতায়।",
    tint: "#14b8a6"
  },
  {
    icon: Clock,
    title: "নির্ধারিত সময়ে ডেলিভারি",
    desc: "নির্দিষ্ট ভাড়া ও সময়সূচি — কোনো লুকানো চার্জ বা দেরি নেই।",
    tint: "#f59e0b"
  },
  {
    icon: Navigation,
    title: "রিয়েল-টাইম ট্র্যাকিং",
    desc: "লাইভ ড্যাশবোর্ডে আপনার মালামাল কোথায় আছে দেখুন, যেকোনো সময়।",
    tint: "#6366f1"
  }
];

const vehicles = [
  {
    icon: Package,
    name: "কভার্ড ভ্যান",
    desc: "বৃষ্টি বা রোদ থেকে মালামাল সুরক্ষিত রাখতে ৫ থেকে ১৫ টনের কভার্ড ভ্যান।",
    tag: "৭ - ২৩ ফিট",
    image: fleetImg
  },
  {
    icon: Truck,
    name: "খোলা ট্রাক",
    desc: "রড, সিমেন্ট, শিল্প পণ্য ও ভারী মালামাল পরিবহনের জন্য উপযুক্ত।",
    tag: "ট্রাক ও পিকআপ",
    image: openTruckImg
  },
  {
    icon: Container,
    name: "ট্রেইলার ও লরি",
    desc: "বড় মেশিনারি ও ভারী কার্গো পরিবহনের জন্য বিশেষ গাড়ি।",
    tag: "হেভি ডিউটি",
    image: trailerImg
  }
];

const steps = [
  {
    number: "০১",
    icon: Phone,
    title: "বুকিং করুন",
    desc: "ফোন বা WhatsApp-এ লোকেশন, গন্তব্য ও মালামালের ধরন জানান।"
  },
  {
    number: "০২",
    icon: BadgeCheck,
    title: "চালক নিশ্চিত হবে",
    desc: "আপনার প্রয়োজন অনুযায়ী যাচাইকৃত চালক ও গাড়ি বরাদ্দ হবে।"
  },
  {
    number: "০৩",
    icon: Route,
    title: "লাইভ ট্র্যাক করুন",
    desc: "ড্যাশবোর্ডে গন্তব্য পর্যন্ত ট্রিপের অগ্রগতি দেখুন।"
  }
];

const reviews = [
  {
    name: "মো: রফিকুল ইসলাম",
    role: "কভার্ড ভ্যান চালক",
    text: "আগে ট্রিপের জন্য অপেক্ষা করতে হতো। এখন দেশ ট্রান্সপোর্ট থেকে নিয়মিত ট্রিপ পাচ্ছি।",
    photo: driverPortraitImg
  },
  {
    name: "আলমগীর হোসেন",
    role: "খোলা ট্রাক চালক",
    text: "ভাড়া নির্ধারিত থাকে এবং সময়মতো পেমেন্ট পাওয়া যায়।",
    photo: review1Img
  },
  {
    name: "সাজ্জাদ আলী",
    role: "ট্রেইলার চালক",
    text: "বড় কোম্পানির ভালো ট্রিপ পাওয়া সহজ হয়েছে।",
    photo: review2Img
  }
];

const driverPerks = [
  { icon: Wallet, text: "এডমিন নির্ধারিত ফিক্সড ভাড়া — দরদাম নেই" },
  { icon: CalendarClock, text: "প্রতিদিন নতুন ট্রিপ, মোবাইলেই আবেদন" },
  { icon: Users, text: "বড় কোম্পানির নিয়মিত কাজ" }
];

const navLinks = [
  { href: "#services", label: "সেবা" },
  { href: "#fleet", label: "গাড়ির বহর" },
  { href: "#live", label: "লাইভ ট্রিপ" },
  { href: "#how", label: "কীভাবে কাজ করে" },
  { href: "#reviews", label: "মতামত" },
  { href: "#contact", label: "যোগাযোগ" }
];

const ease = [0.22, 1, 0.36, 1];

// ===============================
// 🎬 সেকশন রিভিল অ্যানিমেশন
// ===============================
const Reveal = ({ children, delay = 0, y = 28, rotateX = 0, className, style }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1000, ...style }}
      initial={reduce ? false : { opacity: 0, y, rotateX }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
};

const SectionHead = ({ eyebrow, title, lead, center = true, dark = false }) => (
  <Reveal style={{ textAlign: center ? "center" : "left", maxWidth: center ? 720 : "none", margin: center ? "0 auto 56px" : "0 0 40px" }}>
    <span className="dt-eyebrow" style={dark ? { color: "var(--teal-300)", borderColor: "rgba(94,234,212,.3)", background: "rgba(94,234,212,.08)" } : undefined}>
      {eyebrow}
    </span>
    <h2 className="dt-h2" style={dark ? { color: "#fff" } : undefined}>{title}</h2>
    {lead && <p className="dt-lead" style={dark ? { color: "rgba(255,255,255,.7)" } : undefined}>{lead}</p>}
  </Reveal>
);

const bodyLabel = (b) => (b === "covered" ? "কভার্ড ভ্যান" : "খোলা ট্রাক");

const LandingPage = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [liveTrips, setLiveTrips] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const videoRef = useRef(null);
  const heroRef = useRef(null);

  // ---------- ভিডিও (reduced motion হলে বন্ধ) ----------
  useEffect(() => {
    if (!videoRef.current) return;
    if (reduceMotion) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [reduceMotion]);

  // ---------- স্ক্রলে ন্যাভবার সলিড ----------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- আসল লাইভ ট্রিপ ডাটা ----------
  useEffect(() => {
    let alive = true;
    publicApi
      .get("/trips/active")
      .then((res) => alive && setLiveTrips(Array.isArray(res.data) ? res.data : []))
      .catch(() => alive && setLiveTrips([]));
    return () => {
      alive = false;
    };
  }, []);

  // ---------- রিভিউ অটো-রোটেশন ----------
  useEffect(() => {
    if (reduceMotion) return;
    const t = setInterval(() => setReviewIndex((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, [reduceMotion]);

  // ---------- হিরো: স্ক্রল প্যারালাক্স + মাউস 3D ----------
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 120]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const bannerRotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -18]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.05, reduceMotion ? 1.05 : 1.25]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const orbX = useTransform(smx, (v) => v * 40);
  const orbY = useTransform(smy, (v) => v * 40);

  const onHeroMove = (e) => {
    if (reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const activeCount = liveTrips ? liveTrips.length : null;

  return (
    <div className="lp-root">
      <MapWatermark />
      {/* ম্যাপ ওয়াটারমার্ক হালকা করার জন্য উপরে একটা স্বচ্ছ স্তর */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, background: "rgba(244,247,251,.45)", pointerEvents: "none" }} />

      <style>{`
        .lp-root { min-height: 100vh; position: relative; z-index: 0; overflow-x: hidden; font-family: var(--font); }

        /* ---------- NAV ---------- */
        .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .35s, box-shadow .35s, padding .35s; padding: 16px 0; }
        .lp-nav.is-solid { background: rgba(255,255,255,.86); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 8px 30px rgba(10,26,58,.08); padding: 10px 0; }
        .lp-nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .lp-links { display: flex; gap: 4px; align-items: center; }
        .lp-links a { text-decoration: none; font-weight: 600; font-size: 15px; padding: 8px 12px; border-radius: 10px; color: rgba(255,255,255,.85); transition: background .2s, color .2s; }
        .lp-nav.is-solid .lp-links a { color: var(--ink-soft); }
        .lp-links a:hover { background: rgba(20,184,166,.12); color: var(--teal-500) !important; }
        .lp-actions { display: flex; gap: 8px; align-items: center; }
        .lp-burger { display: none; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #fff; border-radius: 12px; padding: 8px; cursor: pointer; }
        .lp-nav.is-solid .lp-burger { color: var(--ink); background: #fff; border-color: var(--line); }
        .lp-mobile { position: fixed; inset: 0; z-index: 99; background: rgba(5,13,31,.97); backdrop-filter: blur(10px); padding: 100px 24px 24px; display: flex; flex-direction: column; gap: 8px; }
        .lp-mobile a.lp-mlink { color: #fff; text-decoration: none; font-size: 22px; font-weight: 700; padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,.08); }
        @media (max-width: 1020px) { .lp-links { display: none; } }
        @media (max-width: 720px) { .lp-actions .lp-hide-sm { display: none; } .lp-burger { display: inline-flex; } }

        /* ---------- HERO ---------- */
        .lp-hero { position: relative; min-height: 100svh; background: var(--navy-950); color: #fff; overflow: hidden; display: flex; align-items: center; padding: 120px 0 140px; isolation: isolate; }
        .lp-hero-video { position: absolute; inset: 0; z-index: -3; }
        .lp-hero-video video { width: 100%; height: 100%; object-fit: cover; opacity: .38; }
        .lp-hero-shade { position: absolute; inset: 0; z-index: -2; background:
            radial-gradient(1200px 600px at 80% 20%, rgba(20,184,166,.28), transparent 60%),
            radial-gradient(900px 500px at 10% 90%, rgba(99,102,241,.25), transparent 60%),
            linear-gradient(180deg, rgba(5,13,31,.55) 0%, rgba(5,13,31,.85) 70%, var(--navy-950) 100%); }
        .lp-road { position: absolute; left: -50%; right: -50%; bottom: -8%; height: 55%; z-index: -1; transform: perspective(600px) rotateX(72deg); transform-origin: bottom center;
          background-image: linear-gradient(rgba(94,234,212,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,.25) 1px, transparent 1px);
          background-size: 64px 64px; animation: lp-road 2.4s linear infinite; mask-image: linear-gradient(to top, #000 10%, transparent 90%); -webkit-mask-image: linear-gradient(to top, #000 10%, transparent 90%); }
        @keyframes lp-road { to { background-position: 0 64px; } }
        .lp-orb { position: absolute; border-radius: 50%; filter: blur(60px); z-index: -1; pointer-events: none; }
        .lp-hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 56px; align-items: center; }
        @media (max-width: 960px) { .lp-hero-grid { grid-template-columns: 1fr; gap: 48px; text-align: center; } .lp-hero-copy { align-items: center; } }
        .lp-hero-copy { display: flex; flex-direction: column; align-items: flex-start; }
        .lp-h1 { font-size: clamp(30px, 4.4vw, 54px); line-height: 1.18; font-weight: 700; margin: 18px 0 0; letter-spacing: -.01em; }
        .lp-h1 .lp-grad { background: linear-gradient(90deg, var(--teal-300), #a5b4fc, var(--teal-300)); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: lp-shine 5s linear infinite; }
        @keyframes lp-shine { to { background-position: 200% center; } }
        .lp-hero-p { color: rgba(255,255,255,.78); font-size: 17px; line-height: 1.85; max-width: 540px; margin: 0 0 32px; }
        .lp-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 960px) { .lp-cta-row { justify-content: center; } }
        .route-line { position: relative; height: 3px; border-radius: 2px; background: repeating-linear-gradient(90deg, var(--teal-400) 0 14px, transparent 14px 24px); background-size: 200% 100%; animation: route-travel 3.2s linear infinite; }
        .route-line-marker { position: absolute; top: 50%; left: 0; transform: translate(-50%, -50%); color: var(--teal-300); animation: route-marker 3.2s linear infinite; }
        @keyframes route-travel { to { background-position: -48px 0; } }
        @keyframes route-marker { 0% { left: 0 } 100% { left: 100% } }

        .lp-banner-wrap { position: relative; }
        .lp-banner-card { border-radius: 26px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.12); background: #0b1b36; }
        .lp-banner-card img { width: 100%; height: auto; aspect-ratio: 16 / 9.4; object-fit: cover; transform: translateZ(0) scale(1.02); }
        .lp-chip { position: absolute; display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 14px; font-weight: 700; font-size: 14px; color: #fff;
          background: rgba(10,26,58,.72); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(12px); box-shadow: 0 18px 40px rgba(0,0,0,.35); white-space: nowrap; }
        .lp-float { animation: lp-float 6s ease-in-out infinite; }
        .lp-float.d2 { animation-delay: -2s; } .lp-float.d3 { animation-delay: -4s; }
        @keyframes lp-float { 50% { translate: 0 -10px; } }
        @media (max-width: 560px) { .lp-chip { font-size: 12px; padding: 8px 10px; } }

        /* ---------- STATS ---------- */
        .lp-stats { position: relative; z-index: 3; margin-top: -84px; }
        .lp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 860px) { .lp-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .lp-stat { padding: 22px; border-radius: 20px; background: rgba(255,255,255,.92); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.7); box-shadow: var(--shadow); display: flex; align-items: center; gap: 14px; height: 100%; }
        .lp-stat-icon { width: 50px; height: 50px; border-radius: 14px; display: grid; place-items: center; color: #fff; background: linear-gradient(135deg, var(--navy-700), var(--navy-900)); box-shadow: 0 10px 24px rgba(15,41,87,.35); flex-shrink: 0; transform: translateZ(30px); }
        .lp-stat strong { display: block; font-size: 26px; color: var(--navy-800); line-height: 1.1; }
        .lp-stat span.lbl { color: var(--ink-soft); font-size: 14px; font-weight: 600; }

        /* ---------- VALUE ---------- */
        .lp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .lp-grid-3 { grid-template-columns: 1fr; } }
        .lp-value { padding: 34px 30px; border-radius: 24px; background: #fff; border: 1px solid var(--line); box-shadow: var(--shadow-sm); height: 100%; overflow: hidden; position: relative; }
        .lp-value-icon { width: 64px; height: 64px; border-radius: 18px; display: grid; place-items: center; color: #fff; margin-bottom: 22px; transform: translateZ(50px); }
        .lp-value h3 { font-size: 21px; margin: 0 0 10px; transform: translateZ(30px); }
        .lp-value p { margin: 0; color: var(--ink-soft); line-height: 1.8; transform: translateZ(20px); }
        .lp-value .lp-corner { position: absolute; width: 180px; height: 180px; border-radius: 50%; right: -60px; top: -60px; opacity: .12; }

        /* ---------- FLEET ---------- */
        .lp-fleet { border-radius: 26px; overflow: hidden; position: relative; min-height: 440px; height: 100%; background: #0b1b36; color: #fff; box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: flex-end; }
        .lp-fleet-img { position: absolute; inset: 0; }
        .lp-fleet-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
        .lp-fleet:hover .lp-fleet-img img { transform: scale(1.08); }
        .lp-fleet::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,13,31,0) 30%, rgba(5,13,31,.92) 85%); }
        .lp-fleet-body { position: relative; z-index: 1; padding: 26px; transform: translateZ(60px); }
        .lp-fleet-body h3 { font-size: 24px; margin: 12px 0 6px; }
        .lp-fleet-body p { margin: 0 0 18px; color: rgba(255,255,255,.78); line-height: 1.7; }
        .lp-fleet-tag { position: absolute; z-index: 1; top: 18px; left: 18px; transform: translateZ(70px); }

        /* ---------- LIVE ---------- */
        .lp-dark { background: radial-gradient(900px 500px at 90% 0%, rgba(20,184,166,.18), transparent 60%), linear-gradient(180deg, var(--navy-900), var(--navy-950)); color: #fff; overflow: hidden; }
        .lp-trip { padding: 24px; border-radius: 22px; height: 100%; display: flex; flex-direction: column; gap: 14px; }
        .lp-trip-route { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; flex-wrap: wrap; }
        .lp-trip-meta { display: flex; flex-wrap: wrap; gap: 8px; }
        .lp-trip-price { font-size: 26px; font-weight: 700; color: var(--teal-300); }

        /* ---------- STEPS ---------- */
        .lp-steps { position: relative; }
        .lp-steps-line { position: absolute; top: 56px; left: 16%; right: 16%; }
        @media (max-width: 900px) { .lp-steps-line { display: none; } }
        .lp-step { text-align: center; padding: 10px 18px; }
        .lp-step-cube { width: 112px; height: 112px; margin: 0 auto 22px; border-radius: 30px; display: grid; place-items: center; position: relative; color: #fff;
          background: linear-gradient(145deg, var(--navy-700), var(--navy-950)); box-shadow: 0 24px 50px rgba(15,41,87,.35), inset 0 1px 0 rgba(255,255,255,.2); transform: rotateX(14deg) rotateY(-14deg); transition: transform .6s var(--ease); }
        .lp-step:hover .lp-step-cube { transform: rotateX(0) rotateY(0) translateY(-6px); }
        .lp-step-num { position: absolute; top: -12px; right: -12px; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: linear-gradient(135deg, var(--teal-400), var(--teal-500)); color: #042f2e; font-weight: 700; box-shadow: 0 10px 20px rgba(20,184,166,.4); }
        .lp-step h3 { font-size: 21px; margin: 0 0 8px; }
        .lp-step p { margin: 0 auto; color: var(--ink-soft); line-height: 1.8; max-width: 300px; }

        /* ---------- DRIVER JOIN ---------- */
        .lp-join { display: grid; grid-template-columns: 1fr 1.1fr; gap: 56px; align-items: center; }
        @media (max-width: 900px) { .lp-join { grid-template-columns: 1fr; } }
        .lp-join-photo { border-radius: 28px; overflow: hidden; box-shadow: var(--shadow-lg); aspect-ratio: 4 / 4.4; }
        .lp-join-photo img { width: 100%; height: 100%; object-fit: cover; }

        /* ---------- REVIEWS 3D COVERFLOW ---------- */
        .lp-flow { position: relative; height: 480px; perspective: 1400px; }
        .lp-flow-card { position: absolute; top: 0; left: 50%; width: min(360px, 78vw); height: 440px; margin-left: calc(min(360px, 78vw) / -2); border-radius: 26px; overflow: hidden; cursor: pointer; background: #0b1b36; box-shadow: var(--shadow-lg); }
        .lp-flow-card img { width: 100%; height: 100%; object-fit: cover; }
        .lp-flow-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 35%, rgba(5,13,31,.94) 88%); }
        .lp-flow-body { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1; padding: 22px; color: #fff; }
        .lp-flow-body p { margin: 10px 0 0; line-height: 1.7; color: rgba(255,255,255,.88); }
        .lp-flow-ctrl { display: flex; justify-content: center; gap: 12px; align-items: center; margin-top: 8px; }
        .lp-round { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; border: 1px solid var(--line); background: #fff; color: var(--navy-800); box-shadow: var(--shadow-sm); transition: transform .2s; }
        .lp-round:hover { transform: scale(1.08); }
        .lp-dot { width: 10px; height: 10px; border-radius: 99px; border: none; background: rgba(15,41,87,.2); cursor: pointer; transition: width .3s, background .3s; padding: 0; }
        .lp-dot.on { width: 28px; background: var(--teal-500); }

        /* ---------- CTA ---------- */
        .lp-cta { border-radius: 30px; padding: 56px 48px; color: #fff; position: relative; overflow: hidden;
          background: radial-gradient(700px 300px at 100% 0%, rgba(45,212,191,.35), transparent 60%), linear-gradient(135deg, var(--navy-800), var(--navy-950)); box-shadow: var(--shadow-lg); }
        .lp-cta-ring { position: absolute; right: -80px; top: 50%; width: 360px; height: 360px; margin-top: -180px; border-radius: 50%; border: 2px dashed rgba(94,234,212,.35); animation: lp-spin3d 18s linear infinite; }
        .lp-cta-ring.r2 { width: 240px; height: 240px; margin-top: -120px; right: 0; animation-duration: 12s; animation-direction: reverse; border-style: solid; border-color: rgba(165,180,252,.25); }
        @keyframes lp-spin3d { from { transform: rotateX(62deg) rotateZ(0); } to { transform: rotateX(62deg) rotateZ(360deg); } }
        @media (max-width: 720px) { .lp-cta { padding: 40px 24px; text-align: center; } .lp-cta .lp-cta-row { justify-content: center; } }

        /* ---------- FOOTER ---------- */
        .lp-footer { background: var(--navy-950); color: rgba(255,255,255,.72); border-radius: 32px 32px 0 0; padding: 72px 0 28px; margin-top: 96px; }
        .lp-foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1.1fr 1.1fr; gap: 36px; }
        @media (max-width: 960px) { .lp-foot-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .lp-foot-grid { grid-template-columns: 1fr; } }
        .lp-footer h4 { color: #fff; font-size: 16px; margin: 0 0 16px; }
        .lp-footer ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .lp-footer li { display: flex; align-items: center; gap: 8px; }
        .lp-hotline { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-radius: 14px; text-decoration: none; color: #fff; font-weight: 700; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); transition: background .2s, transform .2s; }
        .lp-hotline:hover { background: rgba(20,184,166,.15); transform: translateY(-2px); }
        .lp-foot-bottom { margin-top: 48px; padding-top: 22px; border-top: 1px solid rgba(255,255,255,.08); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 14px; }

        /* ---------- Floating call (mobile) ---------- */
        .lp-fab { position: fixed; right: 16px; bottom: 18px; z-index: 90; display: none; gap: 10px; flex-direction: column; }
        .lp-fab a { width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; color: #fff; box-shadow: 0 14px 30px rgba(0,0,0,.3); }
        @media (max-width: 720px) { .lp-fab { display: flex; } }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <nav className={`lp-nav ${scrolled || mobileMenuOpen ? "is-solid" : ""}`} aria-label="প্রধান মেনু">
        <div className="dt-container lp-nav-inner">
          <a href="#top" style={{ textDecoration: "none" }} aria-label="দেশ ট্রান্সপোর্ট হোম">
            <Logo light={!(scrolled || mobileMenuOpen)} size={42} />
          </a>

          <div className="lp-links">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="lp-actions">
            <button className="dt-btn dt-btn-sm dt-btn-primary lp-hide-sm" onClick={() => navigate("/trips")}>
              <Truck size={16} /> লাইভ ট্রিপস
            </button>
            <button
              className={`dt-btn dt-btn-sm lp-hide-sm ${scrolled ? "dt-btn-navy" : "dt-btn-ghost"}`}
              onClick={() => navigate("/login")}
            >
              <Users size={16} /> ড্রাইভার লগইন
            </button>
            <button
              className={`dt-btn dt-btn-sm lp-hide-sm ${scrolled ? "dt-btn-outline" : "dt-btn-ghost"}`}
              onClick={() => navigate("/admin-login")}
              aria-label="এডমিন লগইন"
            >
              <Lock size={15} /> এডমিন
            </button>
            <button className="lp-burger" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="মেনু খুলুন" aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div className="lp-mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {navLinks.map((l, i) => (
              <motion.a
                key={l.href}
                className="lp-mlink"
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                {l.label}
              </motion.a>
            ))}
            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              <button className="dt-btn dt-btn-primary dt-btn-block" onClick={() => navigate("/trips")}>
                <Truck size={18} /> লাইভ ট্রিপস
              </button>
              <button className="dt-btn dt-btn-ghost dt-btn-block" onClick={() => navigate("/login")}>
                <Users size={18} /> ড্রাইভার লগইন / রেজিস্ট্রেশন
              </button>
              <button className="dt-btn dt-btn-ghost dt-btn-block" onClick={() => navigate("/admin-login")}>
                <Lock size={18} /> এডমিন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HERO ================= */}
      <header id="top" className="lp-hero" ref={heroRef} onPointerMove={onHeroMove}>
        <motion.div className="lp-hero-video" style={{ scale: videoScale }}>
          <video ref={videoRef} src={routeVideo} poster={fleetImg} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        </motion.div>
        <div className="lp-hero-shade" />
        <div className="lp-road" aria-hidden="true" />
        <motion.div className="lp-orb" style={{ width: 380, height: 380, background: "rgba(20,184,166,.35)", top: "8%", right: "6%", x: orbX, y: orbY }} />
        <motion.div className="lp-orb" style={{ width: 300, height: 300, background: "rgba(99,102,241,.3)", bottom: "10%", left: "4%", x: orbY, y: orbX }} />

        <div className="dt-container lp-hero-grid">
          <motion.div className="lp-hero-copy" style={{ y: heroTextY, opacity: heroFade }}>
            <motion.span
              className="dt-eyebrow"
              style={{ color: "var(--teal-300)", background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.2)" }}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="dt-live-dot" />
              {activeCount === null
                ? "লাইভ ট্রিপ ট্র্যাকিং চালু আছে"
                : activeCount > 0
                  ? `এই মুহূর্তে ${bn(activeCount)}টি ট্রিপ চালকের অপেক্ষায়`
                  : "লাইভ ট্রিপ ট্র্যাকিং চালু আছে"}
            </motion.span>

            <motion.h1
              className="lp-h1"
              initial={reduceMotion ? false : { opacity: 0, y: 30, rotateX: 40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.1 }}
              style={{ transformPerspective: 800 }}
            >
              দেশ ট্রান্সপোর্ট থাকলে পরিবহন নিয়ে
              <br />
              <span className="lp-grad">আর কোনো দুশ্চিন্তা নেই!</span>
            </motion.h1>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, ease, delay: 0.35 }}
              style={{ position: "relative", width: 200, margin: "26px 0 24px", transformOrigin: "left" }}
            >
              <div className="route-line" />
              <span className="route-line-marker">
                <Truck size={18} />
              </span>
            </motion.div>

            <motion.p
              className="lp-hero-p"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.4 }}
            >
              সারাদেশে কভার্ড ভ্যান, খোলা ট্রাক ও ট্রেইলার সার্ভিস — নির্ধারিত ভাড়া, যাচাইকৃত চালক ও রিয়েল-টাইম ট্রিপ আপডেট সহ।
            </motion.p>

            <motion.div
              className="lp-cta-row"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.5 }}
            >
              <button className="dt-btn dt-btn-primary" onClick={() => navigate("/trips")}>
                <Truck size={18} /> লাইভ ট্রিপস ড্যাশবোর্ড
              </button>
              <a className="dt-btn dt-btn-danger" href={`tel:${PHONE_MAIN}`}>
                <Phone size={18} /> সরাসরি কল করুন
              </a>
              <a className="dt-btn dt-btn-wa" href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> WhatsApp করুন
              </a>
            </motion.div>
          </motion.div>

          {/* 3D ব্যানার কার্ড */}
          <motion.div
            className="lp-banner-wrap"
            initial={reduceMotion ? false : { opacity: 0, rotateY: -35, rotateX: 12, scale: 0.85 }}
            animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.2, ease, delay: 0.25 }}
            style={{ transformPerspective: 1200, rotateX: bannerRotate }}
          >
           <Tilt3D max={10}>
              <div className="lp-banner-card" style={{ maxWidth: "600px", width: "200%" }}>
  <img src={bannerImg} alt="দেশ ট্রান্সপোর্ট ব্যানার – ট্রিপ নিয়ে দুশ্চিন্তা? দেশ ট্রান্সপোর্ট থাকলে আর না" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
</div>
              <span className="lp-chip lp-float" style={{ top: -35, left: -14, transform: "translateZ(90px)" }}>
  <ShieldCheck size={18} color="var(--teal-300)" /> যাচাইকৃত চালক
</span>
              <span className="lp-chip lp-float d2" style={{ bottom: 70, right: -130, transform: "translateZ(110px)" }}>
                <Clock size={18} color="var(--amber-400)" /> ২৪/৭ সাপোর্ট
              </span>
              <span className="lp-chip lp-float d3" style={{ bottom: -40, left: -5, transform: "translateZ(70px)" }}>
                <MapPin size={18} color="#fca5a5" /> সারা দেশে সার্ভিস
              </span>
            </Tilt3D>
          </motion.div>
        </div>
      </header>

      {/* ================= TRUST STATS ================= */}
      <section className="lp-stats">
        <div className="dt-container lp-stats-grid">
          {trustStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.label} delay={i * 0.08} rotateX={25}>
                <Tilt3D max={14} glare={false}>
                  <div className="lp-stat">
                    <span className="lp-stat-icon">
                      <Icon size={24} />
                    </span>
                    <div>
                      <strong>{s.text ? <span className="dt-num">{s.text}</span> : <Counter to={s.to} suffix={s.suffix} />}</strong>
                      <span className="lbl">{s.label}</span>
                    </div>
                  </div>
                </Tilt3D>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section id="services" className="dt-section">
        <div className="dt-container">
          <SectionHead
            eyebrow={<><ShieldCheck size={15} /> কেন আমরা</>}
            title="কেন দেশ ট্রান্সপোর্ট বেছে নেবেন"
            lead="প্রতিটি ট্রিপে নিরাপত্তা, স্বচ্ছ ভাড়া আর সময়ের নিশ্চয়তা — ব্যবসার পরিবহন এখন ঝামেলাহীন।"
          />
          <div className="lp-grid-3">
            {valueProps.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 0.12} rotateX={30}>
                  <Tilt3D max={12}>
                    <div className="lp-value">
                      <span className="lp-corner" style={{ background: v.tint }} />
                      <span className="lp-value-icon" style={{ background: `linear-gradient(135deg, ${v.tint}, ${v.tint}cc)`, boxShadow: `0 16px 34px ${v.tint}55` }}>
                        <Icon size={30} />
                      </span>
                      <h3>{v.title}</h3>
                      <p>{v.desc}</p>
                    </div>
                  </Tilt3D>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FLEET ================= */}
      <section id="fleet" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="dt-container">
          <SectionHead
            eyebrow={<><Truck size={15} /> গাড়ির বহর</>}
            title="আমাদের যানবাহনের ধরণ সমূহ"
            lead="আপনার মালামালের সুরক্ষায় আমাদের সুসজ্জিত ও আধুনিক যানবাহনের বহর।"
          />
          <div className="lp-grid-3">
            {vehicles.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.name} delay={i * 0.12} y={50}>
                  <Tilt3D max={9}>
                    <article className="lp-fleet">
                      <div className="lp-fleet-img">
                        <img src={v.image} alt={v.name} loading="lazy" />
                      </div>
                      <span className="lp-fleet-tag dt-badge" style={{ background: "rgba(10,26,58,.75)", color: "var(--teal-300)", backdropFilter: "blur(8px)", padding: "7px 12px" }}>
                        {v.tag}
                      </span>
                      <div className="lp-fleet-body">
                        <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(20,184,166,.9)", color: "#042f2e" }}>
                          <Icon size={24} />
                        </span>
                        <h3>{v.name}</h3>
                        <p>{v.desc}</p>
                        <a className="dt-btn dt-btn-sm dt-btn-wa" href={whatsappHref} target="_blank" rel="noreferrer">
                          <MessageCircle size={16} /> এই গাড়ি বুক করুন
                        </a>
                      </div>
                    </article>
                  </Tilt3D>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= LIVE TRIPS (আসল ডাটা) ================= */}
      <section id="live" className="dt-section lp-dark dt-dark">
        <div className="dt-container">
          <SectionHead
            dark
            eyebrow={<><span className="dt-live-dot" /> লাইভ</>}
            title="এই মুহূর্তে চালু ট্রিপগুলো"
            lead="চালক ভাইয়েরা — পছন্দের ট্রিপে এখনই আবেদন করুন। এডমিন যাচাই করে কনফার্ম করবেন।"
          />

          <div className="lp-grid-3">
            {liveTrips === null &&
              [0, 1, 2].map((i) => <div key={i} className="dt-skeleton" style={{ height: 230 }} />)}

            {liveTrips &&
              liveTrips.slice(0, 3).map((t, i) => (
                <Reveal key={t._id} delay={i * 0.1} rotateX={20}>
                  <Tilt3D max={8}>
                    <div className="lp-trip dt-glass">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <span className="dt-badge dt-badge-teal">
                          <Truck size={14} /> {bodyLabel(t.requiredVehicleBody)}
                        </span>
                        <span className="dt-badge dt-badge-amber">
                          <CalendarClock size={14} /> {t.pickupTime}
                        </span>
                      </div>
                      <div className="lp-trip-route">
                        <span>{t.from}</span>
                        <ArrowRight size={20} color="var(--teal-300)" />
                        <span>{t.to}</span>
                      </div>
                      <div style={{ color: "rgba(255,255,255,.7)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <Package size={16} style={{ marginTop: 4, flexShrink: 0 }} /> {t.cargoDetails}
                      </div>
                      <div className="lp-trip-meta">
                        {t.requiredCapacity ? (
                          <span className="dt-badge dt-badge-green">
                            <Scale size={14} /> {bn(t.requiredCapacity)} টন
                          </span>
                        ) : null}
                      </div>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <span className="lp-trip-price dt-num">৳ {Number(t.fixedPrice || 0).toLocaleString("bn-BD")}</span>
                        <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => navigate("/trips")}>
                          ট্রিপ নিন <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </Tilt3D>
                </Reveal>
              ))}
          </div>

          {liveTrips && liveTrips.length === 0 && (
            <Reveal>
              <div className="dt-glass" style={{ padding: 36, textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
                <Truck size={40} color="var(--teal-300)" />
                <h3 style={{ margin: "12px 0 6px" }}>এই মুহূর্তে কোনো খালি ট্রিপ নেই</h3>
                <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,.7)" }}>নতুন ট্রিপ যোগ হলেই এখানে দেখা যাবে। ড্রাইভার হিসেবে রেজিস্ট্রেশন করে রাখুন।</p>
                <button className="dt-btn dt-btn-primary" onClick={() => navigate("/login?mode=signup")}>
                  ড্রাইভার রেজিস্ট্রেশন <ArrowRight size={16} />
                </button>
              </div>
            </Reveal>
          )}

          {liveTrips && liveTrips.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button className="dt-btn dt-btn-ghost" onClick={() => navigate("/trips")}>
                সব {bn(liveTrips.length)}টি ট্রিপ দেখুন <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="dt-section">
        <div className="dt-container">
          <SectionHead eyebrow={<><Route size={15} /> প্রক্রিয়া</>} title="কীভাবে কাজ করে" lead="মাত্র তিন ধাপে আপনার মালামাল পৌঁছে যাবে গন্তব্যে।" />
          <div className="lp-steps">
            <div className="lp-steps-line">
              <div className="route-line" />
              <span className="route-line-marker" style={{ color: "var(--navy-800)" }}>
                <Truck size={20} />
              </span>
            </div>
            <div className="lp-grid-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Reveal key={s.number} delay={i * 0.15} rotateX={50} y={40}>
                    <div className="lp-step dt-3d-scene">
                      <div className="lp-step-cube dt-3d">
                        <Icon size={40} />
                        <span className="lp-step-num dt-num">{s.number}</span>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= DRIVER JOIN ================= */}
      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="dt-container lp-join">
          <Reveal y={40} rotateX={10}>
            <Tilt3D max={8}>
              <div className="lp-join-photo">
                <img src={driverPortraitImg} alt="দেশ ট্রান্সপোর্টের একজন চালক" loading="lazy" />
              </div>
              <span className="lp-chip lp-float" style={{ bottom: 28, left: -12, transform: "translateZ(80px)" }}>
                <BadgeCheck size={18} color="var(--teal-300)" /> যাচাইকৃত চালক নেটওয়ার্ক
              </span>
            </Tilt3D>
          </Reveal>
          <div>
            <SectionHead
              center={false}
              eyebrow={<><Users size={15} /> চালকদের জন্য</>}
              title="আপনি কি ট্রাক বা কভার্ড ভ্যানের চালক?"
              lead="দেশ ট্রান্সপোর্টে রেজিস্ট্রেশন করুন — মোবাইল থেকেই নতুন ট্রিপ দেখুন, এক ক্লিকে আবেদন করুন।"
            />
            <div style={{ display: "grid", gap: 14, marginBottom: 30 }}>
              {driverPerks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <Reveal key={p.text} delay={i * 0.1} y={16}>
                    <div className="dt-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16 }}>
                      <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(20,184,166,.12)", color: "var(--teal-500)", flexShrink: 0 }}>
                        <Icon size={20} />
                      </span>
                      <strong style={{ fontWeight: 600 }}>{p.text}</strong>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <div className="lp-cta-row" style={{ justifyContent: "flex-start" }}>
              <button className="dt-btn dt-btn-navy" onClick={() => navigate("/login?mode=signup")}>
                ড্রাইভার হিসেবে যুক্ত হোন <ArrowRight size={18} />
              </button>
              <button className="dt-btn dt-btn-outline" onClick={() => navigate("/login")}>
                আগে থেকে অ্যাকাউন্ট আছে? লগইন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS (3D COVERFLOW) ================= */}
      <section id="reviews" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="dt-container">
          <SectionHead
            eyebrow={<><Star size={15} /> মতামত</>}
            title="আমাদের চালকদের মতামত"
            lead="অভিজ্ঞ চালকদের বাস্তব অভিজ্ঞতা ও দেশ ট্রান্সপোর্টের প্রতি তাদের আস্থা।"
          />
          <div className="lp-flow" aria-roledescription="carousel">
            {reviews.map((r, i) => {
              let offset = i - reviewIndex;
              if (offset > reviews.length / 2) offset -= reviews.length;
              if (offset < -reviews.length / 2) offset += reviews.length;
              const abs = Math.abs(offset);
              return (
                <motion.div
                  key={r.name}
                  className="lp-flow-card"
                  onClick={() => setReviewIndex(i)}
                  animate={{
                    x: offset * (typeof window !== "undefined" && window.innerWidth < 640 ? 150 : 300),
                    rotateY: offset * -38,
                    z: -abs * 180,
                    scale: offset === 0 ? 1 : 0.86,
                    opacity: abs > 1 ? 0 : offset === 0 ? 1 : 0.62
                  }}
                  transition={{ duration: 0.8, ease }}
                  style={{ zIndex: 10 - abs, transformStyle: "preserve-3d" }}
                  aria-hidden={offset !== 0}
                >
                  <img src={r.photo} alt={r.name} loading="lazy" />
                  <div className="lp-flow-body">
                    <div style={{ display: "flex", gap: 3, color: "var(--amber-400)" }}>
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <h3 style={{ margin: "8px 0 0", fontSize: 20 }}>{r.name}</h3>
                    <span style={{ color: "var(--teal-300)", fontWeight: 600, fontSize: 14 }}>{r.role}</span>
                    <p>"{r.text}"</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="lp-flow-ctrl">
            <button className="lp-round" onClick={() => setReviewIndex((i) => (i - 1 + reviews.length) % reviews.length)} aria-label="আগের মতামত">
              <ChevronLeft size={20} />
            </button>
            {reviews.map((r, i) => (
              <button key={r.name} className={`lp-dot ${i === reviewIndex ? "on" : ""}`} onClick={() => setReviewIndex(i)} aria-label={`${r.name} এর মতামত`} />
            ))}
            <button className="lp-round" onClick={() => setReviewIndex((i) => (i + 1) % reviews.length)} aria-label="পরের মতামত">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="contact" className="dt-container">
        <Reveal rotateX={20} y={40}>
          <div className="lp-cta">
            <span className="lp-cta-ring" />
            <span className="lp-cta-ring r2" />
            <div style={{ position: "relative", maxWidth: 640 }}>
              <span className="dt-eyebrow" style={{ color: "var(--teal-300)", background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.2)" }}>
                <Truck size={15} /> দ্রুততম ট্রাক বুকিং সার্ভিস
              </span>
              <h2 className="dt-h2" style={{ color: "#fff" }}>আজই আপনার প্রয়োজনীয় গাড়ি বুক করুন</h2>
              <p className="dt-lead" style={{ color: "rgba(255,255,255,.75)", marginBottom: 28 }}>
                সরাসরি কল করুন অথবা WhatsApp-এ মেসেজ পাঠান — কয়েক মিনিটেই নিশ্চিত হবে আপনার ট্রিপ।
              </p>
              <div className="lp-cta-row">
                <a className="dt-btn dt-btn-danger" href={`tel:${PHONE_MAIN}`}>
                  <Phone size={18} /> সরাসরি কল করুন
                </a>
                <a className="dt-btn dt-btn-wa" href={whatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle size={18} /> WhatsApp বুকিং
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="lp-footer">
        <div className="dt-container">
          <div className="lp-foot-grid">
            {/* Col 1: Brand Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <img src={logoImg} alt="দেশ ট্রান্সপোর্ট" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,.6)" }} />
                <div>
                  <h3 style={{ color: "white", margin: 0, fontSize: 17, fontWeight: 700 }}>মেসার্স দেশ ট্রান্সপোর্ট এজেন্সি</h3>
                  <p style={{ margin: 0, color: "var(--teal-400)", fontSize: 12, fontWeight: 600 }}>নিরাপদ পরিবহন, আপনার বিশ্বাসের সঙ্গী</p>
                </div>
              </div>
              <p style={{ lineHeight: 1.8, margin: "0 0 16px", fontSize: 14.5 }}>
                আমরা আধুনিক প্রযুক্তি ও দেশের শীর্ষ যাচাইকৃত চালকদের মাধ্যমে সারাদেশে বিশ্বস্ত ট্রাক, পিকআপ ও ট্রেইলার লজিস্টিক সার্ভিস প্রদান করে আসছি।
              </p>
              <span className="dt-badge dt-badge-teal" style={{ color: "var(--teal-300)" }}>
                <ShieldCheck size={14} /> নিবন্ধিত ও অনুমোদিত এজেন্সি
              </span>
            </div>

            {/* Col 2: Services */}
            <div>
              <h4>প্রধান সেবাসমূহ</h4>
              <ul>
                <li><Truck size={15} color="var(--teal-500)" /> কভার্ড ভ্যান (৭ - ২৩ ফিট)</li>
                <li><Truck size={15} color="var(--teal-500)" /> খোলা ট্রাক ও পিকআপ সার্ভিস</li>
                <li><Truck size={15} color="var(--teal-500)" /> হেভি ডিউটি ট্রেইলার ও লরি</li>
                <li><MapPin size={15} color="var(--teal-500)" /> রিয়েল-টাইম জিপিএস ট্র্যাকিং</li>
              </ul>
            </div>

            {/* Col 3: Head Office */}
            <div>
              <h4>প্রধান কার্যালয়</h4>
              <p style={{ display: "flex", gap: 8, lineHeight: 1.8, margin: "0 0 14px" }}>
                <MapPin size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 4 }} />
                <span>
                   মাদানী এবিনিউ ১০০ ফিট,<br />
                   ঢাকা,বাংলাদেশ। 
                </span>
              </p>
              <span className="dt-badge" style={{ background: "rgba(255,255,255,.06)", color: "#fff" }}>
                <Clock size={14} color="var(--teal-500)" /> ২৪ ঘণ্টা সার্ভিস খোলা
              </span>
            </div>

            {/* Col 4: Hotline Cards */}
            <div>
              <h4>জরুরি হটলাইন</h4>
              <div style={{ display: "grid", gap: 10 }}>
                <a className="lp-hotline" href={`tel:${PHONE_MAIN}`}>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }} className="dt-num">
      <Phone size={16} color="var(--teal-400)" />
      {PHONE_MAIN}
    </span>
    <span className="dt-badge dt-badge-teal" style={{ color: "var(--teal-300)" }}>
      কল করুন
    </span>
  </a>

  <a className="lp-hotline" href={`tel:${PHONE_ALT}`}>
    <span style={{ display: "flex", alignItems: "center", gap: 8 }} className="dt-num">
      <Phone size={16} color="var(--teal-400)" />
      {PHONE_ALT}
    </span>
    <span className="dt-badge dt-badge-teal" style={{ color: "var(--teal-300)" }}>
      কল করুন
    </span>
  </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Credit Bar */}
          <div className="lp-foot-bottom">
            <p style={{ margin: 0 }}>© {bn(new Date().getFullYear())} মেসার্স দেশ ট্রান্সপোর্ট এজেন্সি. সর্বস্বত্ব সংরক্ষিত।</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span>
                Developed by <span style={{ color: "var(--teal-400)", fontWeight: 700, whiteSpace: "nowrap" }}>Engr. Mohibul Islam</span>
              </span>
             <a 
  className="dt-btn dt-btn-sm" 
  href={developerHref} 
  target="_blank" 
  rel="noreferrer" 
  style={{ 
    backgroundColor: "#25D366", 
    color: "#ffffff", 
    display: "inline-flex", 
    alignItems: "center", 
    gap: "6px",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: "600",
    textDecoration: "none"
  }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99 0-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
  Contact Developer
</a>
              <Link to="/admin-login" style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>
                এডমিন
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* মোবাইলে ভাসমান কল/WhatsApp বাটন */}
      <div className="lp-fab">
        <a href={whatsappHref} target="_blank" rel="noreferrer" style={{ background: "var(--wa)" }} aria-label="WhatsApp">
          <MessageCircle size={24} />
        </a>
        <a href={`tel:${PHONE_MAIN}`} style={{ background: "var(--red-500)" }} aria-label="কল করুন">
          <Phone size={24} />
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
