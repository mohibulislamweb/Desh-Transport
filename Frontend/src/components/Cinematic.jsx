import React, { useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

// 🎬 ছবির পর্দা-সরানো রিভিল
// ⚠️ আগে ছবির উপরেই clip-path ছিল — মোবাইল ব্রাউজার সেটাকে "অদৃশ্য" ধরে ছবি লোডই করত না।
// এখন ছবি সবসময় স্বাভাবিকভাবে লোড হয়; উপরে আলাদা একটা "পর্দা" স্তর সরে যায়।
// image = { src, srcSet, sizes } (assets/images.js থেকে) অথবা src + alt
export const CurtainImage = ({ image, src, alt, className, style, delay = 0, imgStyle, eager = false }) => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [loaded, setLoaded] = useState(false);
  const show = reduce || inView;
  const data = image || { src };

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden", background: "#e2e8f0", ...style }}>
      <motion.img
        src={data.src}
        srcSet={data.srcSet}
        sizes={data.sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: loaded ? 1 : 0, transition: "opacity .5s", ...imgStyle }}
        initial={false}
        animate={{ scale: show && !reduce ? 1 : reduce ? 1 : 1.2 }}
        transition={{ duration: 1.6, ease, delay }}
      />
      {!reduce && (
        <motion.div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "#0b1424", transformOrigin: "top", pointerEvents: "none" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: show ? 0 : 1 }}
          transition={{ duration: 1, ease, delay }}
        />
      )}
    </div>
  );
};

// ✍️ শব্দে শব্দে মাস্ক রিভিল (শিরোনামের জন্য)
// (দৃশ্যমানতা মাপা হয় পুরো শিরোনামে — শব্দগুলো মাস্কের বাইরে থাকায় আলাদা করে মাপলে কখনো দেখা যেত না)
const wordParent = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const wordChild = {
  hidden: { y: "110%", rotateX: -40 },
  show: { y: 0, rotateX: 0, transition: { duration: 0.75, ease } }
};

export const WordReveal = ({ text, as = "span", delay = 0, className, style }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.span;
  const words = String(text).split(" ");
  return (
    <Tag
      className={className}
      style={style}
      aria-label={text}
      variants={wordParent}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delayChildren: delay }}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.1em" }}>
          <motion.span style={{ display: "inline-block" }} variants={wordChild}>
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

// 🃏 3D ফ্লিপ-ইন কার্ড (পাশ থেকে ঘুরে আসে)
export const FlipIn = ({ children, from = "left", delay = 0, style, className }) => {
  const reduce = useReducedMotion();
  const dir = from === "left" ? -1 : 1;
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1200, height: "100%", ...style }}
      initial={reduce ? false : { opacity: 0, rotateY: 35 * dir, x: 60 * dir, scale: 0.92 }}
      whileInView={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.95, ease, delay }}
    >
      {children}
    </motion.div>
  );
};
