import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import MapWatermark from "./MapWatermark";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Truck,
  Package,
  Phone,
  MessageCircle,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  Navigation,
  ArrowRight,
  Menu,
  X,
  Wallet,
  Users,
  CalendarClock,
  Scale,
  CheckCircle2,
  Lock
} from "lucide-react";
import logoImg from "./desh logo.jpeg";
import { IMG } from "./assets/images";
import heroPoster from "./assets/opt/fleet-highway-960.webp";
import heroVideoDesktop from "./assets/opt/hero-desktop.mp4";
import heroVideoMobile from "./assets/opt/hero-mobile.mp4";

import Tilt3D from "./components/Tilt3D";
import { ScrollTilt, ParallaxImage } from "./components/ScrollTilt";
import { CurtainImage, WordReveal, FlipIn } from "./components/Cinematic";
import LiveRouteCard from "./components/LiveRouteCard";
import SmoothScroll from "./components/SmoothScroll";
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
  { to: 2018, label: "থেকে সেবায়" },
  { to: 500, suffix: "+", label: "গাড়ির বহর" },
  { to: 1000, suffix: "+", label: "সফল ডেলিভারি" },
  { text: "২৪/৭", label: "সাপোর্ট টিম" }
];

const valueProps = [
  {
    icon: ShieldCheck,
    title: "নিরাপদ ও যাচাইকৃত",
    desc: "প্রতিটি চালক যাচাই করা, প্রতিটি ট্রিপ ইন্স্যুরেন্স কাভারেজের আওতায়।"
  },
  {
    icon: Clock,
    title: "নির্ধারিত সময়ে ডেলিভারি",
    desc: "নির্দিষ্ট ভাড়া ও সময়সূচি — কোনো লুকানো চার্জ বা দেরি নেই।"
  },
  {
    icon: Navigation,
    title: "রিয়েল-টাইম ট্র্যাকিং",
    desc: "লাইভ ড্যাশবোর্ডে আপনার মালামাল কোথায় আছে দেখুন, যেকোনো সময়।"
  }
];

// প্রতিটি কার্ডে একই ধরনের তথ্য: বডি ও কোন মালের জন্য উপযুক্ত
const vehicles = [
  {
    name: "কভার্ড ভ্যান",
    desc: "বৃষ্টি বা রোদ থেকে মালামাল সুরক্ষিত রাখতে ৫ থেকে ১৫ টনের কভার্ড ভ্যান।",
    body: "ঢাকা বডি",
    image: IMG.fleet
  },
  {
    name: "খোলা ট্রাক",
    desc: "রড, সিমেন্ট, শিল্প পণ্য ও ভারী মালামাল পরিবহনের জন্য উপযুক্ত।",
    body: "খোলা বডি",
    image: IMG.open
  },
  {
    name: "ট্রেইলার ও লরি",
    desc: "বড় মেশিনারি ও ভারী কার্গো পরিবহনের জন্য বিশেষ গাড়ি।",
    body: "ফ্ল্যাটবেড / হেভি ডিউটি",
    image: IMG.trailer
  }
];

const steps = [
  {
    number: "০১",
    title: "বুকিং করুন",
    desc: "ফোন বা WhatsApp-এ লোকেশন, গন্তব্য ও মালামালের ধরন জানান।"
  },
  {
    number: "০২",
    title: "চালক নিশ্চিত হবে",
    desc: "আপনার প্রয়োজন অনুযায়ী যাচাইকৃত চালক ও গাড়ি বরাদ্দ হবে।"
  },
  {
    number: "০৩",
    title: "লাইভ ট্র্যাক করুন",
    desc: "ড্যাশবোর্ডে গন্তব্য পর্যন্ত ট্রিপের অগ্রগতি দেখুন।"
  }
];

const reviews = [
  {
    name: "মো: রফিকুল ইসলাম",
    role: "কভার্ড ভ্যান চালক",
    text: "আগে ট্রিপের জন্য অপেক্ষা করতে হতো। এখন দেশ ট্রান্সপোর্ট থেকে নিয়মিত ট্রিপ পাচ্ছি।",
    photo: IMG.driverCard
  },
  {
    name: "আলমগীর হোসেন",
    role: "খোলা ট্রাক চালক",
    text: "ভাড়া নির্ধারিত থাকে এবং সময়মতো পেমেন্ট পাওয়া যায়।",
    photo: IMG.review1
  },
  {
    name: "সাজ্জাদ আলী",
    role: "ট্রেইলার চালক",
    text: "বড় কোম্পানির ভালো ট্রিপ পাওয়া সহজ হয়েছে।",
    photo: IMG.review2
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

// 🛣️ সার্ভিস এলাকা (চলমান স্ট্রিপে দেখায়)
const coverage = ["ঢাকা", "চট্টগ্রাম", "সিলেট", "খুলনা", "রাজশাহী", "রংপুর", "বরিশাল", "ময়মনসিংহ", "নরসিংদী", "গাজীপুর", "নারায়ণগঞ্জ", "কুমিল্লা", "বগুড়া", "যশোর"];

const ease = [0.22, 1, 0.36, 1];

// ===============================
// 🚚 "কীভাবে কাজ করে" — স্ক্রলের সাথে রুট লাইন ভরে ওঠে, ট্রাক এগিয়ে চলে
// ডেস্কটপে আড়াআড়ি, মোবাইলে খাড়া
// ===============================
const StepsTimeline = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const progress = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]);
  const truckLeft = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <div ref={ref} className="lp-steps">
      <div className="lp-steps-track" aria-hidden="true">
        <motion.div className="lp-steps-fill" style={{ scaleX: progress }} />
        <motion.span className="lp-steps-truck" style={{ left: truckLeft }}>
          <Truck size={18} />
        </motion.span>
      </div>
      <div className="lp-steps-vtrack" aria-hidden="true">
        <motion.div className="lp-steps-vfill" style={{ scaleY: progress }} />
      </div>
      <div className="lp-grid-3 lp-steps-grid">
        {steps.map((st, i) => (
          <Reveal key={st.number} delay={i * 0.12}>
            <div className="lp-step">
              <div className="lp-step-num dt-num">{st.number}</div>
              <h3>{st.title}</h3>
              <p>{st.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

// ===============================
// 🎬 সংযত রিভিল অ্যানিমেশন (হালকা 3D কাত থেকে সোজা হয়)
// ===============================
const Reveal = ({ children, delay = 0, y = 24, className, style }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1200, ...style }}
      initial={reduce ? false : { opacity: 0, y, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
};

const SectionHead = ({ eyebrow, title, lead, center = true, dark = false }) => (
  <Reveal style={{ textAlign: center ? "center" : "left", maxWidth: center ? 680 : "none", margin: center ? "0 auto 48px" : "0 0 32px" }}>
    <span className="dt-eyebrow" style={dark ? { color: "var(--teal-300)" } : undefined}>
      {eyebrow}
    </span>
    <WordReveal as="h2" className="dt-h2" style={dark ? { color: "#fff" } : undefined} text={title} />
    {lead && <p className="dt-lead" style={dark ? { color: "rgba(255,255,255,.72)" } : undefined}>{lead}</p>}
  </Reveal>
);

const bodyLabel = (b) => (b === "covered" ? "কভার্ড ভ্যান" : "খোলা ট্রাক");

const LandingPage = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [liveTrips, setLiveTrips] = useState(null);
  const videoRef = useRef(null);
  // 🎥 চলন্ত ট্রাকের ভিডিও — মোবাইলে আলাদা হালকা ভার্সন (২১৭KB), পিসিতে ৫১১KB
  // শুধু ফোনে "Data Saver" চালু থাকলে ভিডিওর বদলে ছবি দেখায়
  const [useVideo] = useState(() => typeof window !== "undefined" && !(navigator.connection && navigator.connection.saveData));
  const [heroVideo] = useState(() => (typeof window !== "undefined" && window.innerWidth < 720 ? heroVideoMobile : heroVideoDesktop));
  const heroRef = useRef(null);

  // ---------- ভিডিও (reduced motion হলে বন্ধ) ----------
  useEffect(() => {
    if (!videoRef.current) return;
    if (reduceMotion) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [reduceMotion]);

  // ---------- স্ক্রলে ন্যাভবার সলিড, হিরো পার হলে ভাসমান কল বাটন ----------
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
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

  // ---------- হিরো: স্ক্রলে হালকা প্যারালাক্স ----------
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 80]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.02, reduceMotion ? 1.02 : 1.12]);

  return (
    <div className="lp-root">
      <SmoothScroll />
      <MapWatermark />
      {/* ম্যাপ ওয়াটারমার্ক হালকা করার জন্য উপরে একটা স্বচ্ছ স্তর */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: -1, background: "rgba(243,246,249,.7)", pointerEvents: "none" }} />

      <style>{`
        .lp-root { min-height: 100vh; position: relative; z-index: 0; overflow-x: hidden; font-family: var(--font); }

        /* ---------- NAV ---------- */
        .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background .3s, box-shadow .3s, padding .3s; padding: 14px 0; }
        .lp-nav.is-solid { background: rgba(255,255,255,.96); box-shadow: 0 1px 0 var(--line); padding: 10px 0; }
        .lp-nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .lp-links { display: flex; gap: 2px; align-items: center; }
        .lp-links a { text-decoration: none; font-weight: 500; font-size: var(--fs-sm); padding: 8px 12px; border-radius: var(--radius-sm); color: rgba(255,255,255,.88); transition: color .2s, background .2s; }
        .lp-nav.is-solid .lp-links a { color: var(--ink-soft); }
        .lp-links a:hover { color: var(--brand) !important; background: rgba(15,118,110,.06); }
        .lp-actions { display: flex; gap: 8px; align-items: center; }
        .lp-burger { display: none; background: transparent; border: 1px solid rgba(255,255,255,.4); color: #fff; border-radius: var(--radius); padding: 8px; cursor: pointer; }
        .lp-nav.is-solid .lp-burger { color: var(--ink); border-color: var(--line); }
        .lp-mobile { position: fixed; inset: 0; z-index: 99; background: #fff; padding: 88px 20px 24px; display: flex; flex-direction: column; gap: 4px; }
        .lp-mobile a.lp-mlink { color: var(--ink); text-decoration: none; font-size: var(--fs-lg); font-weight: 600; padding: 14px 4px; border-bottom: 1px solid var(--line); }
        @media (max-width: 1020px) { .lp-links { display: none; } }
        @media (max-width: 720px) { .lp-actions .lp-hide-sm { display: none; } .lp-burger { display: inline-flex; } }

        /* ---------- HERO (বাস্তব ভিডিও + গাঢ় ওভারলে) ---------- */
        .lp-hero { position: relative; min-height: 92svh; background: #0b1424; color: #fff; overflow: hidden; display: flex; align-items: center; padding: 120px 0 120px; isolation: isolate; }
        .lp-hero-video { position: absolute; inset: 0; z-index: -2; }
        .lp-hero-video video { width: 100%; height: 100%; object-fit: cover; }
        .lp-hero-shade { position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(8,15,30,.92) 0%, rgba(8,15,30,.78) 45%, rgba(8,15,30,.35) 100%), linear-gradient(0deg, rgba(8,15,30,.6) 0%, transparent 40%); }
        @media (max-width: 760px) { .lp-hero-shade { background: linear-gradient(180deg, rgba(8,15,30,.7), rgba(8,15,30,.88)); } }
        .lp-hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 48px; align-items: center; }
        @media (max-width: 960px) { .lp-hero-grid { grid-template-columns: 1fr; gap: 40px; } }
        .lp-hero-copy { max-width: 640px; }
        .lp-h1 { font-size: clamp(32px, 4.6vw, 52px); line-height: 1.2; font-weight: 700; margin: 14px 0 18px; letter-spacing: -.01em; }
        .lp-hero-p { color: rgba(255,255,255,.82); font-size: var(--fs-lg); line-height: 1.7; margin: 0 0 30px; max-width: 560px; }
        @media (max-width: 560px) { .lp-hero-p { font-size: var(--fs-md); } }
        .lp-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .lp-checks { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 30px; color: rgba(255,255,255,.85); font-size: var(--fs-sm); }
        .lp-checks span { display: inline-flex; align-items: center; gap: 6px; }

        /* ---------- STATS ---------- */
        .lp-stats { position: relative; z-index: 3; margin-top: -56px; }
        .lp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--line); }
        .lp-stat { padding: 26px 24px; text-align: center; }
        .lp-stat + .lp-stat { border-left: 1px solid var(--line); }
        .lp-stat strong { display: block; font-size: var(--fs-xl); color: var(--navy-800); line-height: 1.1; }
        .lp-stat span { color: var(--ink-soft); font-size: var(--fs-sm); }
        @media (max-width: 760px) { .lp-stats-grid { grid-template-columns: repeat(2, 1fr); } .lp-stat:nth-child(3) { border-left: none; } .lp-stat:nth-child(n+3) { border-top: 1px solid var(--line); } }

        /* ---------- PROMISE (ব্যানার + কেন আমরা) ---------- */
        .lp-promise { display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; align-items: center; }
        @media (max-width: 920px) { .lp-promise { grid-template-columns: 1fr; gap: 32px; } }
        .lp-banner { border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); background: #0b1b36; }
        .lp-banner { aspect-ratio: 3 / 2; }
        .lp-value { display: flex; gap: 16px; padding: 18px 0; }
        .lp-value + .lp-value { border-top: 1px solid var(--line); }
        .lp-value-icon { width: 44px; height: 44px; border-radius: var(--radius); display: grid; place-items: center; color: var(--brand); background: rgba(15,118,110,.08); flex-shrink: 0; }
        .lp-value h3 { font-size: var(--fs-lg); margin: 0 0 4px; }
        .lp-value p { margin: 0; color: var(--ink-soft); line-height: 1.7; }

        /* ---------- FLEET ---------- */
        .lp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .lp-grid-3 { grid-template-columns: 1fr; } }
        .lp-fleet { background: #fff; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); height: 100%; display: flex; flex-direction: column; transition: box-shadow .3s; }
        .lp-fleet:hover { box-shadow: var(--shadow); }
        .lp-fleet-img { aspect-ratio: 4 / 3; overflow: hidden; }
        .lp-fleet-img img { will-change: transform; }
        .lp-fleet-body { padding: 22px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .lp-fleet-body h3 { font-size: var(--fs-lg); margin: 0; }
        .lp-fleet-body p { margin: 0; color: var(--ink-soft); line-height: 1.7; flex: 1; }
        .lp-spec { display: flex; justify-content: space-between; font-size: var(--fs-sm); padding: 10px 0; border-top: 1px solid var(--line); color: var(--ink-soft); }
        .lp-spec strong { color: var(--ink); }

        /* ---------- LIVE ---------- */
        .lp-dark { background: #0b1424; color: #fff; }
        .lp-trip { padding: 22px; border-radius: var(--radius-lg); height: 100%; display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); }
        .lp-trip-route { display: flex; align-items: center; gap: 10px; font-size: var(--fs-lg); font-weight: 700; flex-wrap: wrap; }

        /* ---------- COVERAGE MARQUEE ---------- */
        .lp-marquee { overflow: hidden; border-block: 1px solid var(--line); background: rgba(255,255,255,.75); margin-top: 56px; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
        .lp-marquee-track { display: flex; width: max-content; animation: lp-marquee 40s linear infinite; }
        .lp-marquee-track span { display: inline-flex; align-items: center; gap: 10px; padding: 14px 22px; font-weight: 600; color: var(--ink-soft); white-space: nowrap; font-size: var(--fs-sm); }
        .lp-marquee-track span::after { content: ""; width: 5px; height: 5px; border-radius: 50%; background: var(--brand); margin-left: 22px; }
        @keyframes lp-marquee { to { transform: translateX(-50%); } }
        @media (hover: hover) { .lp-marquee:hover .lp-marquee-track { animation-play-state: paused; } }

        /* ---------- HERO extras ---------- */
        .lp-line { display: block; overflow: hidden; padding-bottom: .08em; }
        .lp-line > span { display: block; }
        .lp-scroll-cue { position: absolute; left: 50%; bottom: 84px; transform: translateX(-50%); width: 26px; height: 42px; border: 2px solid rgba(255,255,255,.5); border-radius: 14px; display: flex; justify-content: center; padding-top: 7px; }
        .lp-scroll-cue i { width: 4px; height: 8px; border-radius: 2px; background: #fff; animation: lp-cue 1.8s ease-in-out infinite; }
        @keyframes lp-cue { 0% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(12px); } }
        @media (max-width: 720px) { .lp-scroll-cue { display: none; } }

        /* ---------- STEPS (স্ক্রল-চালিত রুট) ---------- */
        .lp-steps { position: relative; }
        .lp-steps-track { position: relative; height: 3px; background: var(--line); border-radius: 2px; margin: 0 0 36px; }
        .lp-steps-fill { position: absolute; inset: 0; background: var(--brand); border-radius: 2px; transform-origin: left; }
        .lp-steps-truck { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 36px; height: 36px; border-radius: 50%; background: #fff; border: 2px solid var(--brand); color: var(--brand); display: grid; place-items: center; box-shadow: var(--shadow-sm); }
        .lp-steps-vtrack { display: none; }
        .lp-step { padding-top: 4px; }
        @media (max-width: 900px) {
          .lp-steps-track { display: none; }
          .lp-steps-vtrack { display: block; position: absolute; left: 15px; top: 8px; bottom: 8px; width: 3px; background: var(--line); border-radius: 2px; }
          .lp-steps-vfill { position: absolute; inset: 0; background: var(--brand); border-radius: 2px; transform-origin: top; }
          .lp-steps-grid { gap: 28px !important; }
          .lp-step { padding-left: 48px; position: relative; }
          .lp-step-num { font-size: var(--fs-xl) !important; }
        }
        .lp-step-num { font-size: var(--fs-2xl); font-weight: 700; color: var(--brand); line-height: 1; }
        .lp-step h3 { font-size: var(--fs-lg); margin: 14px 0 6px; }
        .lp-step p { margin: 0; color: var(--ink-soft); line-height: 1.7; }

        /* ---------- DRIVER JOIN ---------- */
        .lp-join { display: grid; grid-template-columns: 1fr 1.1fr; gap: 56px; align-items: center; }
        @media (max-width: 900px) { .lp-join { grid-template-columns: 1fr; gap: 32px; } }
        .lp-join-photo { border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); aspect-ratio: 4 / 4.2; }
        .lp-join-photo img { width: 100%; height: 100%; object-fit: cover; }

        /* ---------- REVIEWS (সাধারণ গ্রিড, মোবাইলে সোয়াইপ) ---------- */
        .lp-reviews { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .lp-reviews { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 82%; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; } .lp-reviews > * { scroll-snap-align: start; } }
        .lp-review { background: #fff; border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); height: 100%; display: flex; flex-direction: column; }
        .lp-review-photo { aspect-ratio: 4 / 3; overflow: hidden; }
        .lp-review-photo img { object-position: center 25%; }
        .lp-review-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .lp-review-body blockquote { margin: 0; color: var(--ink); line-height: 1.7; flex: 1; }

        /* ---------- CTA ---------- */
        .lp-cta { border-radius: var(--radius-lg); padding: 48px; color: #fff; background: var(--navy-800); display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap; }
        @media (max-width: 720px) { .lp-cta { padding: 32px 22px; } }

        /* ---------- FOOTER ---------- */
        .lp-footer { background: #0b1424; color: rgba(255,255,255,.72); padding: 64px 0 24px; margin-top: 96px; }
        .lp-foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1.1fr 1.1fr; gap: 36px; }
        @media (max-width: 960px) { .lp-foot-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 600px) { .lp-foot-grid { grid-template-columns: 1fr; } }
        .lp-footer h4 { color: #fff; font-size: var(--fs-md); margin: 0 0 16px; }
        .lp-footer ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; font-size: var(--fs-sm); }
        .lp-footer li { display: flex; align-items: center; gap: 8px; }
        .lp-hotline { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 10px 10px 14px; border-radius: var(--radius); text-decoration: none; color: #fff; font-weight: 600; border: 1px solid rgba(255,255,255,.14); }
        .lp-hotline .lp-call { background: var(--brand); color: #fff; padding: 6px 12px; border-radius: var(--radius-sm); font-size: var(--fs-sm); display: inline-flex; align-items: center; gap: 6px; }
        .lp-hotline:hover .lp-call { background: var(--brand-hover); }
        .lp-foot-bottom { margin-top: 44px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.08); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; font-size: var(--fs-xs); color: rgba(255,255,255,.5); }
        .lp-foot-bottom a { color: rgba(255,255,255,.6); text-decoration: none; }
        .lp-foot-bottom a:hover { color: #fff; text-decoration: underline; }
        .lp-site-info { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

        /* ---------- মোবাইলের নিচের অ্যাকশন বার (হিরো পার হলে) ---------- */
        .lp-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 90; display: none; gap: 10px; padding: 10px 14px calc(10px + env(safe-area-inset-bottom)); background: rgba(255,255,255,.97); border-top: 1px solid var(--line); box-shadow: 0 -8px 24px rgba(10,26,58,.08); }
        .lp-bar a { flex: 1; min-height: 48px; }
        @media (max-width: 720px) { .lp-bar { display: flex; } .lp-footer { padding-bottom: 96px; } }

        /* ---------- মোবাইল টিউনিং ---------- */
        @media (max-width: 560px) {
          .dt-section { padding: 56px 0; }
          .lp-hero { min-height: 88svh; padding: 104px 0 96px; }
          .lp-hero .lp-cta-row .dt-btn { flex: 1 1 100%; min-height: 50px; }
          .lp-checks { gap: 10px 16px; margin-top: 22px; }
          .lp-stats { margin-top: -40px; }
          .lp-stat { padding: 18px 12px; }
          .lp-cta .lp-cta-row, .lp-join .lp-cta-row { width: 100%; }
          .lp-cta .lp-cta-row .dt-btn, .lp-join .lp-cta-row .dt-btn { flex: 1 1 100%; min-height: 48px; }
          .lp-fleet-body .dt-btn { min-height: 44px; }
          .lp-marquee { margin-top: 36px; }
        }
        @media (max-width: 380px) { .lp-nav small { display: none; } .lp-h1 { font-size: 26px; } }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <nav className={`lp-nav ${scrolled || mobileMenuOpen ? "is-solid" : ""}`} aria-label="প্রধান মেনু">
        <div className="dt-container lp-nav-inner">
          <a href="#top" style={{ textDecoration: "none" }} aria-label="দেশ ট্রান্সপোর্ট হোম">
            <Logo light={!(scrolled || mobileMenuOpen)} size={40} />
          </a>

          <div className="lp-links">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="lp-actions">
            <button className={`dt-btn dt-btn-sm lp-hide-sm ${scrolled ? "dt-btn-outline" : "dt-btn-ghost"}`} onClick={() => navigate("/trips")}>
              <Truck size={16} /> লাইভ ট্রিপস
            </button>
            <button className="dt-btn dt-btn-sm dt-btn-primary lp-hide-sm" onClick={() => navigate("/login")}>
              <Users size={16} /> ড্রাইভার লগইন
            </button>
            {/* 🔐 এডমিন প্যানেলে যাওয়ার বাটন (হালকা স্টাইলে, যাতে গ্রাহকের নজর না কাড়ে) */}
            <button
              className={`dt-btn dt-btn-sm lp-hide-sm ${scrolled ? "dt-btn-outline" : "dt-btn-ghost"}`}
              onClick={() => navigate("/admin-login")}
              aria-label="এডমিন প্যানেল"
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
            {navLinks.map((l) => (
              <a key={l.href} className="lp-mlink" href={l.href} onClick={() => setMobileMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              <button className="dt-btn dt-btn-primary dt-btn-block" onClick={() => navigate("/login")}>
                <Users size={18} /> ড্রাইভার লগইন / রেজিস্ট্রেশন
              </button>
              <button className="dt-btn dt-btn-outline dt-btn-block" onClick={() => navigate("/trips")}>
                <Truck size={18} /> লাইভ ট্রিপস
              </button>
              <button className="dt-btn dt-btn-outline dt-btn-block" onClick={() => navigate("/admin-login")}>
                <Lock size={18} /> এডমিন প্যানেল
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HERO ================= */}
      <header id="top" className="lp-hero" ref={heroRef}>
        <motion.div className="lp-hero-video" style={{ scale: videoScale }}>
          <motion.div
            style={{ width: "100%", height: "100%" }}
            initial={reduceMotion ? false : { scale: 1.28, filter: "brightness(.4)" }}
            animate={{ scale: 1, filter: "brightness(1)" }}
            transition={{ duration: 2.6, ease }}
          >
            {useVideo ? (
              <video ref={videoRef} src={heroVideo} poster={heroPoster} autoPlay muted loop playsInline preload="auto" disablePictureInPicture aria-hidden="true" />
            ) : (
              <img src={heroPoster} alt="" aria-hidden="true" fetchpriority="high" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </motion.div>
        </motion.div>
        <div className="lp-hero-shade" />

        <div className="dt-container lp-hero-grid">
          <motion.div className="lp-hero-copy" style={{ y: heroTextY }}>
            <motion.span
              className="dt-eyebrow"
              style={{ color: "var(--teal-300)" }}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              মেসার্স দেশ ট্রান্সপোর্ট এজেন্সি · ২০১৮ থেকে
            </motion.span>

            {/* শিরোনামের প্রতিটি লাইন নিচ থেকে উঠে আসে (মাস্ক রিভিল) */}
            <h1 className="lp-h1">
              {["দেশ ট্রান্সপোর্ট থাকলে পরিবহন নিয়ে", "আর কোনো দুশ্চিন্তা নেই!"].map((line, i) => (
                <span key={line} className="lp-line">
                  <motion.span
                    initial={reduceMotion ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.12 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="lp-hero-p"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.25 }}
            >
              সারাদেশে কভার্ড ভ্যান, খোলা ট্রাক ও ট্রেইলার সার্ভিস — নির্ধারিত ভাড়া, যাচাইকৃত চালক ও রিয়েল-টাইম ট্রিপ আপডেট সহ।
            </motion.p>

            {/* শুধু দুটো বাটন: মূল কাজ (কল) + বিকল্প (WhatsApp) */}
            <motion.div
              className="lp-cta-row"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.35 }}
            >
              <a className="dt-btn dt-btn-primary" href={`tel:${PHONE_MAIN}`}>
                <Phone size={18} /> কল করুন: <span className="dt-num">01853-389495</span>
              </a>
              <a className="dt-btn dt-btn-ghost" href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> WhatsApp-এ বুক করুন
              </a>
            </motion.div>

            <motion.div className="lp-checks" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <span><CheckCircle2 size={16} color="var(--teal-300)" /> যাচাইকৃত চালক</span>
              <span><CheckCircle2 size={16} color="var(--teal-300)" /> নির্ধারিত ভাড়া</span>
              <span><CheckCircle2 size={16} color="var(--teal-300)" /> সারা দেশে সার্ভিস</span>
            </motion.div>
          </motion.div>

          {/* 🛰️ লাইভ রুট প্যানেল (3D) */}
          <LiveRouteCard trip={liveTrips && liveTrips[0]} />
        </div>
        {!reduceMotion && (
          <a href="#services" className="lp-scroll-cue" aria-label="নিচে স্ক্রল করুন">
            <i />
          </a>
        )}
      </header>

      {/* ================= TRUST STATS ================= */}
      <section className="lp-stats">
        <div className="dt-container">
          <Reveal y={50}>
            <div className="lp-stats-grid">
              {trustStats.map((s) => (
                <div key={s.label} className="lp-stat">
                  <strong>{s.text ? <span className="dt-num">{s.text}</span> : <Counter to={s.to} suffix={s.suffix || ""} />}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= COVERAGE MARQUEE ================= */}
      <div className="lp-marquee" aria-label="সার্ভিস এলাকা">
        <div className="lp-marquee-track">
          {[...coverage, ...coverage].map((c, i) => (
            <span key={i} aria-hidden={i >= coverage.length}>
              <MapPin size={15} color="var(--brand)" /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* ================= PROMISE: ব্যানার + কেন আমরা ================= */}
      <section id="services" className="dt-section">
        <div className="dt-container lp-promise">
          <ScrollTilt>
            <Tilt3D max={3}>
              <CurtainImage className="lp-banner" image={IMG.banner} alt="দেশ ট্রান্সপোর্ট ব্যানার — ট্রিপ নিয়ে দুশ্চিন্তা? দেশ ট্রান্সপোর্ট থাকলে আর না" />
            </Tilt3D>
          </ScrollTilt>
          <div>
            <SectionHead
              center={false}
              eyebrow="কেন আমরা"
              title="কেন দেশ ট্রান্সপোর্ট বেছে নেবেন"
              lead="প্রতিটি ট্রিপে নিরাপত্তা, স্বচ্ছ ভাড়া আর সময়ের নিশ্চয়তা — ব্যবসার পরিবহন এখন ঝামেলাহীন।"
            />
            {valueProps.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 0.08} y={14}>
                  <div className="lp-value">
                    <span className="lp-value-icon">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h3>{v.title}</h3>
                      <p>{v.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FLEET ================= */}
      <section id="fleet" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="dt-container">
          <SectionHead eyebrow="গাড়ির বহর" title="আমাদের যানবাহনের ধরণ সমূহ" lead="আপনার মালামালের সুরক্ষায় আমাদের সুসজ্জিত ও আধুনিক যানবাহনের বহর।" />
          <div className="lp-grid-3">
            {vehicles.map((v, i) => (
              <ScrollTilt key={v.name} strength={1 - i * 0.15}>
                <Tilt3D max={3}>
                  <article className="lp-fleet">
                    <CurtainImage className="lp-fleet-img" image={v.image} alt={v.name} delay={i * 0.12} />
                    <div className="lp-fleet-body">
                      <h3>{v.name}</h3>
                      <p>{v.desc}</p>
                      <div className="lp-spec">
                        <span>বডি</span>
                        <strong>{v.body}</strong>
                      </div>
                      <a className="dt-btn dt-btn-sm dt-btn-outline" href={whatsappHref} target="_blank" rel="noreferrer">
                        <MessageCircle size={16} /> এই গাড়ি বুক করুন
                      </a>
                    </div>
                  </article>
                </Tilt3D>
              </ScrollTilt>
            ))}
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
            {liveTrips === null && [0, 1, 2].map((i) => <div key={i} className="dt-skeleton" style={{ height: 210 }} />)}

            {liveTrips &&
              liveTrips.slice(0, 3).map((t, i) => (
                <FlipIn key={t._id} from={i % 2 === 0 ? "left" : "right"} delay={i * 0.12}>
                  <div className="lp-trip">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span className="dt-badge dt-badge-teal">
                        <Truck size={13} /> {bodyLabel(t.requiredVehicleBody)}
                      </span>
                      <span className="dt-badge dt-badge-amber">
                        <CalendarClock size={13} /> {t.pickupTime}
                      </span>
                    </div>
                    <div className="lp-trip-route">
                      <span>{t.from}</span>
                      <ArrowRight size={18} color="var(--teal-300)" />
                      <span>{t.to}</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,.7)", display: "flex", gap: 8, alignItems: "flex-start", fontSize: "var(--fs-sm)" }}>
                      <Package size={15} style={{ marginTop: 3, flexShrink: 0 }} /> {t.cargoDetails}
                      {t.requiredCapacity ? <> · <Scale size={15} style={{ marginTop: 3 }} /> {bn(t.requiredCapacity)} টন</> : null}
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <span className="dt-num" style={{ fontSize: "var(--fs-xl)", fontWeight: 700, color: "var(--teal-300)" }}>৳ {Number(t.fixedPrice || 0).toLocaleString("bn-BD")}</span>
                      <button className="dt-btn dt-btn-sm dt-btn-primary" onClick={() => navigate("/trips")}>
                        ট্রিপ নিন <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </FlipIn>
              ))}
          </div>

          {liveTrips && liveTrips.length === 0 && (
            <div className="lp-trip" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto", alignItems: "center" }}>
              <Truck size={34} color="var(--teal-300)" />
              <h3 style={{ margin: 0 }}>এই মুহূর্তে কোনো খালি ট্রিপ নেই</h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,.7)" }}>নতুন ট্রিপ যোগ হলেই এখানে দেখা যাবে। ড্রাইভার হিসেবে রেজিস্ট্রেশন করে রাখুন।</p>
              <button className="dt-btn dt-btn-primary" onClick={() => navigate("/login?mode=signup")}>
                ড্রাইভার রেজিস্ট্রেশন <ArrowRight size={16} />
              </button>
            </div>
          )}

          {liveTrips && liveTrips.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button className="dt-btn dt-btn-ghost" onClick={() => navigate("/trips")}>
                সব {bn(liveTrips.length)}টি ট্রিপ দেখুন <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="dt-section">
        <div className="dt-container">
          <SectionHead eyebrow="প্রক্রিয়া" title="কীভাবে কাজ করে" lead="মাত্র তিন ধাপে আপনার মালামাল পৌঁছে যাবে গন্তব্যে।" />
          <StepsTimeline />
        </div>
      </section>

      {/* ================= DRIVER JOIN ================= */}
      <section className="dt-section" style={{ paddingTop: 0 }}>
        <div className="dt-container lp-join">
          <ScrollTilt>
            <Tilt3D max={3}>
              <ParallaxImage className="lp-join-photo" image={IMG.driver} alt="দেশ ট্রান্সপোর্টের একজন চালক" amount={24} />
            </Tilt3D>
          </ScrollTilt>
          <div>
            <SectionHead
              center={false}
              eyebrow="চালকদের জন্য"
              title="আপনি কি ট্রাক বা কভার্ড ভ্যানের চালক?"
              lead="দেশ ট্রান্সপোর্টে রেজিস্ট্রেশন করুন — মোবাইল থেকেই নতুন ট্রিপ দেখুন, এক ক্লিকে আবেদন করুন।"
            />
            <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
              {driverPerks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <Reveal key={p.text} delay={i * 0.08} y={12}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="lp-value-icon" style={{ width: 38, height: 38 }}>
                        <Icon size={18} />
                      </span>
                      <span style={{ fontWeight: 500 }}>{p.text}</span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
            <div className="lp-cta-row">
              <button className="dt-btn dt-btn-primary" onClick={() => navigate("/login?mode=signup")}>
                ড্রাইভার হিসেবে যুক্ত হোন <ArrowRight size={18} />
              </button>
              <button className="dt-btn dt-btn-outline" onClick={() => navigate("/login")}>
                লগইন করুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section id="reviews" className="dt-section" style={{ paddingTop: 0 }}>
        <div className="dt-container">
          <SectionHead eyebrow="মতামত" title="আমাদের চালকদের মতামত" lead="অভিজ্ঞ চালকদের বাস্তব অভিজ্ঞতা ও দেশ ট্রান্সপোর্টের প্রতি তাদের আস্থা।" />
          <div className="lp-reviews">
            {reviews.map((r, i) => (
              <ScrollTilt key={r.name} strength={1 - i * 0.15}>
                <figure className="lp-review" style={{ margin: 0 }}>
                  <CurtainImage className="lp-review-photo" image={r.photo} alt={r.name} delay={i * 0.12} imgStyle={{ objectPosition: "center 25%" }} />
                  <div className="lp-review-body">
                    <div style={{ display: "flex", gap: 2, color: "#f59e0b" }} aria-label="৫ এর মধ্যে ৫">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <blockquote>"{r.text}"</blockquote>
                    <figcaption>
                      <strong style={{ display: "block" }}>{r.name}</strong>
                      <span style={{ color: "var(--ink-soft)", fontSize: "var(--fs-sm)" }}>{r.role}</span>
                    </figcaption>
                  </div>
                </figure>
              </ScrollTilt>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section id="contact" className="dt-container">
        <Reveal>
          <div className="lp-cta">
            <div style={{ maxWidth: 560 }}>
              <h2 className="dt-h2" style={{ color: "#fff", marginTop: 0 }}>আজই আপনার প্রয়োজনীয় গাড়ি বুক করুন</h2>
              <p className="dt-lead" style={{ color: "rgba(255,255,255,.75)", margin: 0 }}>
                সরাসরি কল করুন অথবা WhatsApp-এ মেসেজ পাঠান — কয়েক মিনিটেই নিশ্চিত হবে আপনার ট্রিপ।
              </p>
            </div>
            <div className="lp-cta-row">
              <a className="dt-btn dt-btn-primary" href={`tel:${PHONE_MAIN}`}>
                <Phone size={18} /> সরাসরি কল করুন
              </a>
              <a className="dt-btn dt-btn-wa" href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> WhatsApp বুকিং
              </a>
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
                <img src={logoImg} alt="দেশ ট্রান্সপোর্ট" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <h3 style={{ color: "white", margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>মেসার্স দেশ ট্রান্সপোর্ট এজেন্সি</h3>
                  <p style={{ margin: 0, color: "var(--teal-400)", fontSize: "var(--fs-xs)", fontWeight: 600 }}>নিরাপদ পরিবহন, আপনার বিশ্বাসের সঙ্গী</p>
                </div>
              </div>
              <p style={{ lineHeight: 1.8, margin: "0 0 14px", fontSize: "var(--fs-sm)" }}>
                আমরা আধুনিক প্রযুক্তি ও দেশের শীর্ষ যাচাইকৃত চালকদের মাধ্যমে সারাদেশে বিশ্বস্ত ট্রাক, পিকআপ ও ট্রেইলার লজিস্টিক সার্ভিস প্রদান করে আসছি।
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)" }}>
                <ShieldCheck size={15} color="var(--teal-400)" /> নিবন্ধিত ও অনুমোদিত এজেন্সি
              </span>
            </div>

            {/* Col 2: Services */}
            <div>
              <h4>প্রধান সেবাসমূহ</h4>
              <ul>
                <li><Truck size={15} color="var(--teal-400)" /> কভার্ড ভ্যান (৭ - ২৩ ফিট)</li>
                <li><Truck size={15} color="var(--teal-400)" /> খোলা ট্রাক ও পিকআপ সার্ভিস</li>
                <li><Truck size={15} color="var(--teal-400)" /> হেভি ডিউটি ট্রেইলার ও লরি</li>
                <li><MapPin size={15} color="var(--teal-400)" /> রিয়েল-টাইম জিপিএস ট্র্যাকিং</li>
              </ul>
            </div>

            {/* Col 3: Head Office */}
            <div>
              <h4>প্রধান কার্যালয়</h4>
              <p style={{ display: "flex", gap: 8, lineHeight: 1.9, margin: "0 0 12px", fontSize: "var(--fs-sm)" }}>
                <MapPin size={16} color="var(--teal-400)" style={{ flexShrink: 0, marginTop: 5 }} />
                <span>
                   মাদানী এবিনিউ ১০০ ফিট,<br />
                   ঢাকা,বাংলাদেশ।
                </span>
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)" }}>
                <Clock size={15} color="var(--teal-400)" /> ২৪ ঘণ্টা সার্ভিস খোলা
              </span>
            </div>

            {/* Col 4: Hotline Cards */}
            <div>
              <h4>জরুরি হটলাইন</h4>
              <div style={{ display: "grid", gap: 10 }}>
                <a className="lp-hotline" href={`tel:${PHONE_MAIN}`}>
                  <span className="dt-num">01853389495</span>
                  <span className="lp-call"><Phone size={14} /> কল করুন</span>
                </a>
                <a className="lp-hotline" href={`tel:${PHONE_ALT}`}>
                  <span className="dt-num">01715708008</span>
                  <span className="lp-call"><Phone size={14} /> কল করুন</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Site Info */}
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

      {/* মোবাইলে নিচের কল/WhatsApp বার — হিরো পার হওয়ার পর দেখায়, যাতে হিরোর বাটন ঢেকে না যায় */}
      <AnimatePresence>
        {pastHero && (
          <motion.div className="lp-bar" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ duration: 0.35, ease }}>
            <a className="dt-btn dt-btn-primary" href={`tel:${PHONE_MAIN}`}>
              <Phone size={18} /> কল করুন
            </a>
            <a className="dt-btn dt-btn-wa" href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle size={18} /> WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
