import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Rocket } from "lucide-react";

const DISMISSED_KEY = "academiq_announcement_v1_dismissed";

export default function AnnouncementModal() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only show if not dismissed before
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    // Slight delay so dashboard renders first
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
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  const progress = ((30 - countdown) / 30) * 100;

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
          <div className="px-8 pb-8 pt-8">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/30">
              <Rocket className="h-8 w-8 text-white" />
            </div>

            {/* Badge */}
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Sparkles className="h-3 w-3" /> Coming Soon
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Something big is coming to AcademiQ
            </h2>

            {/* Body */}
            <p className="mt-3 text-center text-sm text-muted-foreground leading-relaxed">
              We're building something that goes beyond the logbook. A new way for students to connect with real opportunities — verified, accessible, and built for you.
            </p>

            <p className="mt-3 text-center text-sm font-medium text-violet-600">
              Stay tuned. You won't want to miss this. 🚀
            </p>

            {/* Dismiss CTA */}
            <div className="mt-7 flex flex-col items-center gap-2">
              <button
                onClick={dismiss}
                className="w-full rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition"
              >
                Got it, I'm excited!
              </button>
              <p className="text-xs text-muted-foreground">
                Closes automatically in {countdown}s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
