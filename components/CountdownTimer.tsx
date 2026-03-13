"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  deadline: string;
  active?: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(deadline: string): TimeLeft {
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export function CountdownTimer({
  deadline,
  active = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(deadline));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(id);
  }, [active, deadline]);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-[0_0_18px_rgba(15,23,42,0.9)]">
      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
        Ends in
      </span>
      <span className="tabular-nums text-sky-300">
        {days}d {hours}h {minutes}m {seconds}s
      </span>
    </div>
  );
}
