import { Link } from "wouter";
import { Box, ArrowRight, Sparkles, FileText, Flame, ShieldCheck, ClipboardList, Brain, BarChart2, Bell, Globe, Zap, Lock, RefreshCw } from "lucide-react";

function Nav() {
  return (
    <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
            <Box className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">AcademiQ</span>
        </div>
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/sign-in"><span className="hidden cursor-pointer text-sm font-medium sm:block">Sign in</span></Link>
        <Link href="/sign-up">
          <button className="rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30">
            Get started free
          </button>
        </Link>
      </div>
    </nav>
  );
}

const features = [
  {
    icon: Brain,
    color: "bg-violet-100 text-violet-600",
    title: "AI Writing Engine",
    desc: "Our AI is trained specifically on SIWES logbook standards across all Nigerian universities. It understands the structure, tone, and technical depth supervisors expect — and applies it automatically to your entries.",
    tags: ["Claude-powered", "SIWES-trained", "Industry-aware"],
  },
  {
    icon: FileText,
    color: "bg-red-100 text-red-500",
    title: "One-Click PDF Export",
    desc: "Export your entire logbook — or selected entries — as a beautifully formatted PDF. Includes your name, school, department, and supervisor details. Print-ready and professionally laid out.",
    tags: ["Print-ready", "Branded", "Instant"],
  },
  {
    icon: Flame,
    color: "bg-orange-100 text-orange-500",
    title: "Streak & Progress Tracking",
    desc: "Stay consistent with visual streak tracking. See your weekly activity, total hours logged, and completion rate at a glance. Build the daily habit that makes your SIWES period stress-free.",
    tags: ["Daily streaks", "Weekly insights", "Progress charts"],
  },
  {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600",
    title: "Supervisor-Ready Templates",
    desc: "Choose from templates tailored to different SIWES roles — software engineering, electrical, mechanical, business admin, and more. Every template is structured to match what supervisors in those fields expect.",
    tags: ["Role-specific", "Multi-discipline", "Structured"],
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
    title: "Secure & Private",
    desc: "Your logbook data is fully encrypted in transit and at rest. We never share your entries with anyone. You own your data and can export or delete it at any time.",
    tags: ["End-to-end encryption", "GDPR-aligned", "Your data, always"],
  },
  {
    icon: Sparkles,
    color: "bg-pink-100 text-pink-500",
    title: "Smart Suggestions",
    desc: "As you write, AcademiQ suggests relevant technical terms, action verbs, and industry-specific phrases to strengthen your entries. Like autocomplete, but for professional writing.",
    tags: ["Real-time", "Context-aware", "Domain-specific"],
  },
  {
    icon: BarChart2,
    color: "bg-indigo-100 text-indigo-600",
    title: "Analytics Dashboard",
    desc: "Get a bird's-eye view of your SIWES progress. See how many entries you've written, average entry quality score, most active days, and more — all in one clean dashboard.",
    tags: ["Visual charts", "Quality scores", "Activity heatmap"],
  },
  {
    icon: Bell,
    color: "bg-amber-100 text-amber-600",
    title: "Daily Reminders",
    desc: "Set a daily reminder to write your log entry. AcademiQ sends a gentle notification so you never fall behind. Consistency is the key to a complete, stress-free logbook.",
    tags: ["Push notifications", "Customisable time", "Weekly digest"],
  },
  {
    icon: Globe,
    color: "bg-teal-100 text-teal-600",
    title: "Works on Any Device",
    desc: "AcademiQ is fully responsive — write your entries on your phone, tablet, or laptop. Your data syncs instantly across all devices so you're never tied to one screen.",
    tags: ["Mobile-first", "Cross-device sync", "Offline-friendly"],
  },
  {
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
    title: "Lightning Fast",
    desc: "AI generation takes under 10 seconds. No loading screens, no waiting. From rough note to polished entry faster than you can brew your evening tea.",
    tags: ["< 10s generation", "Instant save", "Zero lag"],
  },
  {
    icon: Lock,
    color: "bg-slate-100 text-slate-600",
    title: "Supervisor Access Control",
    desc: "Share a read-only view of your logbook with your supervisor directly from AcademiQ — no printing required. Control what they can see and revoke access at any time.",
    tags: ["Shareable link", "Read-only mode", "Access control"],
  },
  {
    icon: RefreshCw,
    color: "bg-cyan-100 text-cyan-600",
    title: "Unlimited Revisions",
    desc: "Not happy with the AI's first draft? Regenerate with one click or tweak it manually. Every entry can be revised as many times as you like before saving.",
    tags: ["Regenerate", "Manual edit", "Version history"],
  },
];

export default function Features() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          FEATURES
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          Everything built for <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">SIWES success</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          AcademiQ isn't a generic writing tool. Every feature is designed around the specific needs of Nigerian SIWES students.
        </p>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {f.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-600">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white">All features. Free to start.</h2>
          <p className="mt-2 text-sm text-white/80">No credit card required. Cancel anytime.</p>
          <Link href="/sign-up">
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
              Get started free <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
