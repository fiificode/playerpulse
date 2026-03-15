"use client";

import type { HighlightClip } from "@/data/highlights";

type HighlightsPanelProps = {
  clips: HighlightClip[];
  className?: string;
};

export function HighlightsPanel({ clips, className }: HighlightsPanelProps) {
  return (
    <section
      className={`mt-10 w-full rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-[0_0_45px_rgba(15,23,42,1)] backdrop-blur-xl md:mt-0 ${
        className ?? "md:w-[380px]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Highlights
        </h2>
        <p className="text-xs text-slate-400">Premier League</p>
      </div>

      <div className="space-y-4">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-3 shadow-[0_0_26px_rgba(15,23,42,0.9)]"
          >
            <div className="overflow-hidden rounded-xl border border-slate-800/80">
              <div className="aspect-video w-full bg-slate-950/80">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${clip.videoId}`}
                  title={clip.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold text-slate-100">
                {clip.title}
              </p>
              <p className="text-xs text-slate-400">{clip.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
