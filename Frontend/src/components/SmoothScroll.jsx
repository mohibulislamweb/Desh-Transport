import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

// 🧈 সিনেমার মতো মসৃণ স্ক্রল (Lenis) — "কম অ্যানিমেশন" সেটিং চালু থাকলে বন্ধ
const SmoothScroll = () => {
  useEffect(() => {
    // "prefers-reduced-motion" অন থাকলে Lenis চালু হবে না
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Lenis ইনিশিয়ালাইজেশন
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      anchors: { offset: -70 },
    });

    let frameId;

    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    // Cleanup Function
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      lenis.destroy();
    };
  }, []);

  return null;
};

export default SmoothScroll;