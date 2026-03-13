import { motion } from "framer-motion";

type ProgressBarProps = {
  value: number; // 0 - 100
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
      <motion.div
        className="h-full rounded-full bg-linear-to-r from-sky-400 via-indigo-400 to-purple-500 shadow-[0_0_16px_rgba(56,189,248,0.8)]"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ ease: "easeOut", duration: 0.5 }}
      />
    </div>
  );
}
