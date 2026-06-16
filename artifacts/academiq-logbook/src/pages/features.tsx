import { Link } from "wouter";
import Nav from "@/components/MobileNav";
import { Box, ArrowRight, Sparkles, FileText, Flame, ShieldCheck, ClipboardList, Brain, BarChart2, Bell, Globe, Zap, Lock, RefreshCw } from "lucide-react";



const features = [
  {
    icon: Brain,
    color: "bg-violet-100 text-violet-600",
    title: "AI Writing Engine",
    desc: "The AI knows SIWES. It understands what Nigerian supervisors want to read — the structure, the tone, the technical depth — and it applies all of that automatically so you don't have to think about it.",
    tags: ["Claude-powered", "SIWES-trained", "Industry-aware"],
  },
  {
    icon: FileText,
    color: "bg-red-100 text-red-500",
    title: "One-Click PDF Export",
    desc: "Export your whole logbook or just selected entries as a clean, properly formatted PDF. Your name, school, department — all included. Print it, email it, or share the file directly.",
    tags: ["Print-ready", "Branded", "Instant"],
  },
  {
    icon: Flame,
    color: "bg-orange-100 text-orange-500",
    title: "Streak & Progress Tracking",
    desc: "Missing entries is how SIWES becomes a nightmare. Streak tracking keeps you honest — you can see your weekly activity, hours logged, and how far along you are at a glance.",
    tags: ["Daily streaks", "Weekly insights", "Progress charts"],
  },
  {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600",
    title: "Supervisor-Ready Templates",
    desc: "Pick a template built for your role — software engineering, electrical, mechanical, business admin, and more. Each one is structured the way supervisors in that field actually want to see it.",
    tags: ["Role-specific", "Multi-discipline", "Structured"],
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
    title: "Secure & Private",
    desc: "Your entries are yours. We encrypt everything and don't share your data with anyone. Export it, delete it — you're in full control.",
    tags: ["End-to-end encryption", "GDPR-aligned", "Your data, always"],
  },
  {
    icon: Sparkles,
    color: "bg-pink-100 text-pink-500",
    title: "Smart Suggestions",
    desc: "As you type, AcademiQ nudges you with better wording — technical terms, stronger action verbs, industry phrases that make your entries sound sharper. Like autocomplete, but actually useful.",
    tags: ["Real-time", "Context-aware", "Domain-specific"],
  },
  {
    icon: BarChart2,
    color: "bg-indigo-100 text-indigo-600",
    title: "Analytics Dashboard",
    desc: "See your whole SIWES journey at once — how many entries you've written, your most active days, quality scores, everything. One screen, no digging around.",
    tags: ["Visual charts", "Quality scores", "Activity heatmap"],
  },
  {
    icon: Bell,
    color: "bg-amber-100 text-amber-600",
    title: "Daily Reminders",
    desc: "Set a reminder for whenever works for you — end of day, after dinner, whatever. A quick nudge so daily logging actually becomes a habit.",
    tags: ["Push notifications", "Customisable time", "Weekly digest"],
  },
  {
    icon: Globe,
    color: "bg-teal-100 text-teal-600",
    title: "Works on Any Device",
    desc: "Write on your phone after work, review on your laptop at home. Everything syncs instantly so you can pick up wherever you left off.",
    tags: ["Mobile-first", "Cross-device sync", "Offline-friendly"],
  },
  {
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
    title: "Lightning Fast",
    desc: "The AI generates your entry in under 10 seconds. No spinning wheels, no waiting. Faster than it takes to make tea.",
    tags: ["< 10s generation", "Instant save", "Zero lag"],
  },
  {
    icon: Lock,
    color: "bg-slate-100 text-slate-600",
    title: "Supervisor Access Control",
    desc: "Share a read-only link with your supervisor directly — no printing, no emailing PDFs back and forth. You control what they see and can pull access whenever you want.",
    tags: ["Shareable link", "Read-only mode", "Access control"],
  },
  {
    icon: RefreshCw,
    color: "bg-cyan-100 text-cyan-600",
    title: "Unlimited Revisions",
    desc: "Not loving the first draft? Hit regenerate or edit it yourself. You can revise as many times as you want before saving — no limits.",
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
          Features
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          Everything built for <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">SIWES success</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          This isn't a generic writing tool with a SIWES label slapped on it. Every single feature was built with Nigerian students in mind.
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
          <h2 className="text-3xl font-bold text-white">All of this. Free to start.</h2>
          <p className="mt-2 text-sm text-white/80">No card needed. Cancel whenever you want.</p>
          <Link href="/sign-up">
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
              Get started — it's free <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
