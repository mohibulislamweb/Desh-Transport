import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

// 🎞️ স্ক্রল অনুযায়ী বাস্তবসম্মত 3D চলন — মোবাইলেও কাজ করে (মাউস লাগে না)
// কার্ড নিচ থেকে ঢোকার সময় হালকা কাত হয়ে আসে, মাঝখানে সোজা, উপরে যাওয়ার সময় সামান্য পেছনে হেলে
// zoom = true হলে ভেতরের ছবিতে ধীর Ken Burns জুম
export const ScrollTilt = ({ children, strength = 1, className, style }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const s = reduce ? 0 : strength * 1.6;
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.45, 1], [14 * s, 0, -8 * s]), { stiffness: 120, damping: 24 });
  const y = useSpring(useTransform(scrollYProgress, [0, 0.45], [40 * s, 0]), { stiffness: 120, damping: 24 });
  const opacity = useTransform(scrollYProgress, [0, 0.2], reduce ? [1, 1] : [0, 1]);

  return (
    <div ref={ref} className={className} style={{ perspective: 1200, ...style }}>
      <motion.div style={{ rotateX, y, opacity, transformOrigin: "50% 100%", height: "100%" }}>{children}</motion.div>
    </div>
  );
};

// 🖼️ ছবি স্ক্রলের সাথে ধীরে জুম ও সরে (প্যারালাক্স) — বাস্তব ক্যামেরা মুভমেন্টের মতো
export const ParallaxImage = ({ src, image, alt, className, style, amount = 40, zoom = 0.12 }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-amount, amount]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1 + zoom, 1 + zoom / 2, 1 + zoom]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden", ...style }}>
      <motion.img src={image ? image.src : src} srcSet={image?.srcSet} sizes={image?.sizes} alt={alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", y, scale }} />
    </div>
  );
};

export default ScrollTilt;
