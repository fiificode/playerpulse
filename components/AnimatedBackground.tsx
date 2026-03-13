"use client";

import { motion } from "framer-motion";

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

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={blob.className}
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{
            opacity: [0.4, 0.8, 0.5],
            scale: [0.9, 1.1, 1],
            rotate: [0, 12, -8],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: index * 1.5,
          }}
        />
      ))}
    </div>
  );
}

