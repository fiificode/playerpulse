"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const blobs = [
  {
    className:
      "pointer-events-none absolute -top-40 -left-32 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl",
  },
  {
    className:
      "pointer-events-none absolute -bottom-40 -right-10 h-96 w-96 rounded-full bg-sky-500/25 blur-3xl",
  },
  {
    className:
      "pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/30 blur-3xl",
  },
];

type AnimatedBackgroundProps = {
  intensity?: number;
};

export function AnimatedBackground({ intensity = 0 }: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const energy = Math.min(1, Math.max(0, intensity));
  const opacityLow = 0.35 + 0.15 * energy;
  const opacityHigh = 0.65 + 0.2 * energy;
  const opacityMid = 0.45 + 0.15 * energy;
  const scaleHigh = 1.05 + 0.08 * energy;
  const animateEnabled = !prefersReducedMotion && isVisible;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const updateVisibility = () => {
      setIsVisible(!document.hidden);
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={blob.className}
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={
            animateEnabled
              ? {
                  opacity: [opacityLow, opacityHigh, opacityMid],
                  scale: [0.9, scaleHigh, 1],
                  rotate: [0, 12, -8],
                }
              : {
                  opacity: opacityMid,
                  scale: 1,
                  rotate: 0,
                }
          }
          transition={
            animateEnabled
              ? {
                  duration: 18,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: index * 1.5,
                }
              : { duration: 0 }
          }
        />
      ))}
    </div>
  );
}
