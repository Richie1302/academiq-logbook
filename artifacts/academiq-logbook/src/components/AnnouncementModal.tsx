import { useState, useEffect, useRef } from "react";
import { X, Sparkles, CheckCircle2 } from "lucide-react";

const ANNOUNCEMENT_KEY = "academiq_announcement_v2_dismissed";

export default function AnnouncementModal() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          dismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  const dismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisible(false);
  };

  if (!visible) return null;

  const progress = ((25 - countdown) / 25) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-2xl">

          {/* Auto-dismiss progress bar */}
          <div className="absolute top-0 left-0 h-1 w-full bg-violet-100">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-700 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dismiss button */}
          <button
            onClick={dismiss}
            className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Content */}
          <div className="px-6 pb-6 pt-8">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-7 w-7 text-white animate-pulse" />
            </div>

            {/* Badge */}
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                New Features Live!
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-center text-xl font-bold tracking-tight text-foreground">
              What's New in AcademiQ
            </h2>

            {/* Feature list */}
            <div className="mt-4 space-y-2.5 text-left bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {[
                { title: "Bulk Logbook Generator", desc: "Generate weeks of logs at once, brief enough for paper books." },
                { title: "Export to Word (.docx)", desc: "Download clean entries in Times New Roman 12pt format." },
                { title: "Cover Page Generator", desc: "Instantly create print-ready SIWES cover pages." },
                { title: "Authenticity Check", desc: "Scan and refine generic clichés or copy-paste risk." },
                { title: "Custom Streak Reminders", desc: "Set your reminder hour with a time picker dropdown." },
              ].map((f, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs">
                  <CheckCircle2 className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">{f.title}:</span>{" "}
                    <span className="text-muted-foreground">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dismiss CTA */}
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                onClick={dismiss}
                className="w-full rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition"
              >
                Let's explore!
              </button>
              <p className="text-[10px] text-muted-foreground">
                Closes automatically in {countdown}s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
