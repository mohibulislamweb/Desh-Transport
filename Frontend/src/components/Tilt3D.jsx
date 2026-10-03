import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// 🎯 মাউস/টাচ অনুযায়ী 3D টিল্ট কার্ড (glare সহ)
// max = সর্বোচ্চ কত ডিগ্রি ঘুরবে
const Tilt3D = ({ children, max = 12, glare = true, className = "", style, ...rest }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const glareOpacity = useMotionValue(0);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const glareBg = useTransform(
    [px, py],
    ([x, y]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.55), rgba(255,255,255,0) 55%)`
  );

  const move = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    glareOpacity.set(1);
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => {
    glareOpacity.set(0);
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className="dt-3d-scene" style={{ height: "100%" }}>
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        className={`dt-3d ${className}`}
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, position: "relative", height: "100%", ...style }}
        {...rest}
      >
        {children}
        {glare && !reduce && <motion.div className="dt-tilt-glare" style={{ background: glareBg, opacity: glareOpacity }} />}
      </motion.div>
    </div>
  );
};

export default Tilt3D;
