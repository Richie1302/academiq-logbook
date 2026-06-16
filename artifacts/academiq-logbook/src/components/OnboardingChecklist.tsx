import { CheckCircle2, Circle, ChevronRight, User, FileText, Download, Flame, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  done: boolean;
  href: string;
  cta: string;
}

interface Props {
  profileComplete: boolean;
  hasFirstEntry: boolean;
  hasExported: boolean;
  hasStreak3: boolean;
}

const DISMISSED_KEY = "academiq_checklist_dismissed";

export default function OnboardingChecklist({ profileComplete, hasFirstEntry, hasExported, hasStreak3 }: Props) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "true");

  const items: ChecklistItem[] = [
    {
      id: "profile",
      icon: User,
      label: "Complete your profile",
      desc: "Add your school, company, and supervisor so your PDF looks professional.",
      done: profileComplete,
      href: "/profile",
      cta: "Go to profile",
    },
    {
      id: "first-entry",
      icon: FileText,
      label: "Write your first entry",
      desc: "Document your first day. Just a few sentences — the AI handles the rest.",
      done: hasFirstEntry,
      href: "/entry/new",
      cta: "Write entry",
    },
    {
      id: "export",
      icon: Download,
      label: "Export your first PDF",
      desc: "See what your logbook looks like as a polished, print-ready document.",
      done: hasExported,
      href: "/history",
      cta: "Go to history",
    },
    {
      id: "streak",
      icon: Flame,
      label: "Build a 3-day streak",
      desc: "Write entries 3 days in a row to build the daily habit.",
      done: hasStreak3,
      href: "/entry/new",
      cta: "Write today's entry",
    },
  ];

  const completedCount = items.filter(i => i.done).length;
  const allDone = completedCount === items.length;
  const progress = (completedCount / items.length) * 100;

  // Auto-hide once all done and dismissed
  if (dismissed) return null;

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3 gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">
              {allDone ? "You're all set! 🎉" : "Get started checklist"}
            </h3>
            <span className="text-xs font-semibold bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">
              {completedCount}/{items.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allDone
              ? "You've completed all the setup steps. Keep writing!"
              : "Complete these steps to get the most out of AcademiQ."}
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full bg-violet-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => { localStorage.setItem(DISMISSED_KEY, "true"); setDismissed(true); }}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
          aria-label="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Items */}
      <div className="px-3 pb-4 space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
              item.done ? "opacity-60" : "hover:bg-violet-50"
            }`}
          >
            {item.done ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-violet-300 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-tight ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.label}
              </p>
              {!item.done && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
              )}
            </div>
            {!item.done && (
              <Link href={item.href}>
                <button className="shrink-0 flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors whitespace-nowrap">
                  {item.cta} <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
