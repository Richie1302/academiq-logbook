import { Link } from "wouter";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Check,
  Pencil,
  Sparkles,
  Download,
  FileText,
  Flame,
  Brain,
  ShieldCheck,
  ClipboardList,
  Plus,
  Star,
  Twitter,
  Instagram,
  Linkedin,
  ChevronDown,
  Box,
} from "lucide-react";

/* ---------- shared decorative bits ---------- */

function Cube({ className = "", size = 40, hue = "purple" }: { className?: string; size?: number; hue?: string }) {
  const colors: Record<string, string> = {
    purple: "from-violet-300/70 to-violet-500/60",
    white: "from-white to-slate-200",
    blue: "from-indigo-300/70 to-violet-400/60",
    glass: "from-white/80 to-violet-200/50",
  };
  return (
    <div
      className={`absolute rounded-[6px] rotate-12 shadow-2xl bg-gradient-to-br ${colors[hue]} backdrop-blur-sm border border-white/60 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function Sphere({ className = "", size = 60 }: { className?: string; size?: number }) {
  return (
    <div
      className={`absolute rounded-full bg-gradient-to-br from-white via-violet-100 to-violet-300/70 shadow-2xl ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/* ---------- NAV ---------- */

function Nav() {
  return (
    <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
          <Box className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">AcademiQ</span>
      </div>
      <ul className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
        <li className="cursor-pointer hover:text-foreground">How it works</li>
        <li className="cursor-pointer hover:text-foreground">Features</li>
        <li className="cursor-pointer hover:text-foreground">Pricing</li>
        <li className="cursor-pointer hover:text-foreground">Reviews</li>
        <li className="flex cursor-pointer items-center gap-1 hover:text-foreground">
          Resources <ChevronDown className="h-3.5 w-3.5" />
        </li>
      </ul>
      <div className="flex items-center gap-5">
        <Link href="/sign-in">
          <span className="hidden cursor-pointer text-sm font-medium text-foreground sm:block">Sign in</span>
        </Link>
        <Link href="/sign-up">
          <button className="rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:opacity-95">
            Get started free
          </button>
        </Link>
      </div>
    </nav>
  );
}

/* ---------- HERO MOCKUP ---------- */

function HeroMockup() {
  return (
    <div className="relative">
      <Cube className="-left-6 top-4" size={36} hue="blue" />
      <Sphere className="left-2 top-28" size={70} />
      <Cube className="-left-2 bottom-24" size={28} hue="purple" />
      <Sphere className="-right-4 top-10" size={40} />
      <Cube className="-right-2 top-40" size={32} hue="purple" />
      <Sphere className="right-6 bottom-10" size={50} />
      <Cube className="right-20 -bottom-4" size={26} hue="white" />

      <div className="relative rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_30px_80px_-20px_rgba(99,77,255,0.35)] backdrop-blur-xl">
        <div className="rounded-2xl bg-white p-5 shadow-inner">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-violet-700 text-white">
              <Box className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">AcademiQ</span>
            <img
              src="/avatar-femi.jpg"
              alt="Tunde"
              className="ml-auto h-8 w-8 rounded-full border border-white object-cover shadow-sm"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold">Good morning, Tunde 👋</h3>
            <p className="text-xs text-muted-foreground">Let's make today's log count.</p>
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">This week</p>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              { label: "Activities", val: "12" },
              { label: "Hours Logged", val: "48" },
              { label: "Progress", val: "74%", ring: true },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xl font-bold">{s.val}</span>
                  {s.ring && (
                    <div className="h-6 w-6 rounded-full border-[3px] border-violet-200 border-t-violet-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Entries</p>
          <ul className="space-y-2">
            {[
              { t: "System Analysis", d: "May 12, 2024", s: "Approved", c: "bg-emerald-100 text-emerald-700" },
              { t: "Team Meeting", d: "May 11, 2024", s: "Pending", c: "bg-amber-100 text-amber-700" },
              { t: "Documentation", d: "May 10, 2024", s: "Approved", c: "bg-emerald-100 text-emerald-700" },
            ].map((e) => (
              <li key={e.t} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5">
                <div>
                  <p className="text-sm font-semibold">{e.t}</p>
                  <p className="text-[10px] text-muted-foreground">{e.d}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${e.c}`}>{e.s}</span>
              </li>
            ))}
          </ul>
          <span className="mt-3 inline-block text-xs font-medium text-violet-600 cursor-pointer">View all entries →</span>
        </div>
      </div>

      <div className="absolute -left-10 top-1/3 hidden rotate-[-6deg] rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 p-4 shadow-xl md:block">
        <Pencil className="h-6 w-6 text-white" />
      </div>
      <div className="absolute -left-8 bottom-20 hidden items-center gap-2 rounded-xl border bg-white/90 p-2.5 shadow-lg backdrop-blur md:flex">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-red-100 text-red-600">
          <FileText className="h-4 w-4" />
        </div>
        <div className="text-[10px]">
          <p className="font-semibold">PDF Export</p>
          <p className="text-muted-foreground">Ready to download</p>
        </div>
      </div>
      <div className="absolute -right-6 top-24 hidden items-center gap-2 rounded-xl border bg-white/90 p-2.5 shadow-lg backdrop-blur md:flex">
        <Flame className="h-5 w-5 text-orange-500" />
        <div className="text-[10px]">
          <p className="text-muted-foreground">Streak</p>
          <p className="text-sm font-bold">7 days</p>
        </div>
      </div>
      <div className="absolute -right-4 bottom-32 hidden items-end gap-1 rounded-xl border bg-white/90 p-3 shadow-lg backdrop-blur md:flex">
        {[28, 40, 22, 48, 36].map((h, i) => (
          <div key={i} className="w-2 rounded-sm bg-gradient-to-t from-violet-300 to-violet-500" style={{ height: h }} />
        ))}
      </div>
      <div className="absolute -right-2 bottom-6 hidden items-center gap-2 rounded-xl border bg-white/90 p-2.5 shadow-lg backdrop-blur md:flex">
        <div className="text-[10px]">
          <p className="text-muted-foreground">Supervisor</p>
          <p className="text-xs font-bold">Approved</p>
        </div>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      </div>
    </div>
  );
}

/* ---------- HERO ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--hero-bg)" }}>
      <Cube className="left-8 top-32" size={22} hue="glass" />
      <Sphere className="left-24 bottom-24" size={26} />
      <Cube className="left-1/3 top-10" size={18} hue="purple" />
      <Sphere className="right-10 top-1/2" size={20} />
      <Cube className="right-1/4 bottom-16" size={24} hue="blue" />
      <Sphere className="right-1/3 top-24" size={16} />
      <Nav />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-10 md:grid-cols-2 md:gap-6 md:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700 backdrop-blur">
            <Plus className="h-3 w-3" /> AI-POWERED. SUPERVISOR APPROVED.
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Your SIWES <br /> logbook,{" "}
            <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">sorted.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            Write what you did in plain English. AcademiQ transforms it into polished SIWES entries in seconds. Built for Nigerian students.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-up">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/30">
                Start for free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm">
              <Play className="h-4 w-4" /> Watch demo
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-violet-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-violet-500" /> Supervisor approved</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-violet-500" /> Trusted by students</span>
          </div>
        </div>
        <div className="relative">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */

function HowItWorks() {
  const steps = [
    { n: "01", icon: Pencil, color: "bg-violet-100 text-violet-600", t: "Write like you talk", d: "Jot down what you did today in plain English. No grammar stress, specifically for SIWES." },
    { n: "02", icon: Sparkles, color: "bg-blue-100 text-blue-600", t: "AI does the heavy lifting", d: "Our AI structures, formats, and enhances your entry into a supervisor-ready report." },
    { n: "03", icon: Download, color: "bg-emerald-100 text-emerald-600", t: "Save, export, repeat", d: "Download polished reports in one click and keep your SIWES logbook on track." },
  ];
  return (
    <section className="py-24" style={{ background: "var(--hero-bg)" }}>
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
          <Plus className="h-3 w-3" /> HOW IT WORKS
        </p>
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Three steps. Done.</h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-bold text-muted-foreground">{s.n}</p>
              <h3 className="mt-1 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              {i < 2 && (
                <div className="absolute right-[-30px] top-[68px] hidden h-px w-16 border-t border-dashed border-violet-300 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURES ---------- */

function Features() {
  return (
    <section className="py-24" style={{ background: "var(--hero-bg)" }}>
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-600">BUILT FOR SIWES, END TO END</p>
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Everything you need, built for SIWES.</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <div className="row-span-2 rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">
            <h3 className="text-lg font-bold">AI Writing Engine</h3>
            <p className="mt-2 text-sm text-muted-foreground">Smart suggestions, auto-formatting, and content enhancement trained specifically for SIWES.</p>
            <div className="mt-10 flex justify-center">
              <div className="relative">
                <div className="grid h-40 w-40 place-items-center rounded-3xl bg-gradient-to-br from-violet-200 to-violet-400 shadow-2xl">
                  <Brain className="h-20 w-20 text-violet-700" />
                </div>
                <div className="absolute -bottom-3 left-1/2 h-3 w-32 -translate-x-1/2 rounded-full bg-violet-500/30 blur-md" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">
            <h3 className="text-lg font-bold">PDF Export</h3>
            <p className="mt-2 text-sm text-muted-foreground">One-click export to clean, professional PDFs your supervisor will love.</p>
            <div className="mt-4 flex justify-end">
              <div className="grid h-16 w-14 place-items-center rounded-lg bg-red-100 text-red-500 shadow-md">
                <FileText className="h-7 w-7" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">
            <h3 className="text-lg font-bold">Streak Tracking</h3>
            <p className="mt-2 text-sm text-muted-foreground">Build consistency with visual streaks and weekly progress insights.</p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Flame className="h-10 w-10 text-orange-500" />
              <div className="rounded-lg border bg-white p-2 text-[10px] shadow-sm">
                <p className="font-bold">+ 7</p>
                <p className="text-muted-foreground">Day streak</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">
            <h3 className="text-lg font-bold">Supervisor Ready</h3>
            <p className="mt-2 text-sm text-muted-foreground">Structured templates for different roles and industries. Just fill and go.</p>
            <div className="mt-2 flex justify-end">
              <ClipboardList className="h-10 w-10 text-violet-500" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">
            <h3 className="text-lg font-bold">Your Data, Secure</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your data is private, encrypted, and never shared. We take security seriously.</p>
            <div className="mt-2 flex justify-end">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-100">
                <ShieldCheck className="h-7 w-7 text-violet-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- DEMO PANEL ---------- */

function DemoPanel() {
  return (
    <section className="relative py-20" style={{ background: "var(--hero-bg)" }}>
      <Cube className="left-10 top-20" size={40} hue="white" />
      <Sphere className="left-32 bottom-20" size={50} />
      <Cube className="right-16 top-40" size={36} hue="blue" />
      <Sphere className="right-24 bottom-32" size={70} />
      <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/60 bg-white/70 p-10 shadow-[0_30px_80px_-20px_rgba(99,77,255,0.25)] backdrop-blur-xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">TRY IT YOURSELF</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">See AcademiQ in action</h2>
          <p className="mt-2 text-sm text-muted-foreground">Type a simple note and watch AI turn it into a professional SIWES entry.</p>
        </div>
        <div className="mt-8 grid items-start gap-8 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold">Your note (plain English)</p>
            <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-sm text-foreground/80">
              Today I worked on API integration for the inventory system. I connected the frontend to the backend and fixed some bugs.
            </div>
            <p className="mt-2 text-right text-[10px] text-muted-foreground">123/500</p>
            <button className="mt-4 inline-flex items-center gap-1 rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-md">
              Generate entry <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative rounded-xl border bg-white p-5 shadow-sm">
            <div className="absolute -left-10 top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border bg-white shadow md:grid">
              <Plus className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-sm font-semibold">AI generated SIWES entry</p>
            <div className="mt-3 rounded-lg border bg-slate-50 p-3 text-sm text-foreground/80">
              I worked on the integration of the inventory system. I connected the frontend interface to the backend services, ensuring smooth data flow between components. I also identified, diagnosed, and fixed several bugs to improve system functionality and performance.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Professional tone", "Well structured", "Supervisor ready"].map((t) => (
                <span key={t} className="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-medium text-violet-700">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TESTIMONIALS ---------- */

function Testimonials() {
  const items = [
    { q: "AcademiQ saved me so much time. My supervisor loved how detailed and professional my logbook was.", n: "Chioma Okeke", s: "University of Lagos", img: "/avatar-ngozi.jpg" },
    { q: "The AI writing is super smart. It turns my rough notes into perfect entries in seconds.", n: "Ibrahim Yusuf", s: "ABU Zaria", img: "/avatar-chinedu.jpg" },
    { q: "Finally, a tool built for Nigerian students. Simple to use and extremely effective!", n: "Aisha Bello", s: "OAU", img: "/avatar-aisha.jpg" },
  ];
  return (
    <section className="py-20" style={{ background: "var(--hero-bg)" }}>
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">TRUSTED BY THOUSANDS OF STUDENTS</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Loved by students. Approved by supervisors.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-violet-600">
              <Star className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-bold text-violet-600">10,000+</p>
            <p className="text-xs text-muted-foreground">Students trust AcademiQ</p>
            <div className="mt-6 flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">4.9/5 from 1,200+ reviews</p>
          </div>
          {items.map((it) => (
            <div key={it.n} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="mt-3 text-sm text-foreground/80">"{it.q}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={it.img} alt={it.n} className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm" />
                <div>
                  <p className="text-sm font-bold">{it.n}</p>
                  <p className="text-[11px] text-muted-foreground">{it.s}</p>
                </div>
                <div className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700 shadow-inner ring-1 ring-violet-300/50">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */

function FinalCTA() {
  return (
    <section className="px-6 pb-20 pt-10" style={{ background: "var(--hero-bg)" }}>
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 via-white to-violet-100 p-10 shadow-xl">
        <Cube className="right-32 top-6" size={28} hue="white" />
        <Sphere className="right-16 bottom-8" size={40} />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-violet-600">
              <Plus className="h-3 w-3" /> JOIN 10,000+ SIWES STUDENTS
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              Your supervisor will <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">notice</span><br />
              the difference.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">Start writing better, more professional SIWES reports today.</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/sign-up">
                <button className="rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                  Generate your first entry free
                </button>
              </Link>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-violet-500" /> Free forever</span>
                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-violet-500" /> No card required</span>
                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-violet-500" /> Cancel anytime</span>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative">
              <div className="absolute -bottom-6 left-1/2 h-14 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-3 left-1/2 h-6 w-44 -translate-x-1/2 rounded-full bg-violet-600/15 blur-xl" />
              <div
                className="relative h-56 w-56 rotate-[10deg] rounded-[28px] border border-white/80 bg-gradient-to-br from-white/75 via-white/35 to-violet-200/30 backdrop-blur-2xl"
                style={{ boxShadow: "0 40px 80px -30px rgba(99,77,255,0.45), 0 10px 30px -10px rgba(99,77,255,0.25), inset 0 1px 0 0 rgba(255,255,255,0.9), inset 0 -20px 40px -20px rgba(167,139,250,0.35)" }}
              >
                <div className="pointer-events-none absolute inset-x-5 top-[5px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
                <div className="pointer-events-none absolute inset-x-8 top-2 h-4 rounded-b-[14px] bg-gradient-to-b from-white/45 to-transparent blur-[1px]" />
                <div className="pointer-events-none absolute inset-4 rounded-[20px] border border-white/50" />
                <div
                  className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 -rotate-6 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700"
                  style={{ boxShadow: "0 20px 40px -10px rgba(99,77,255,0.55), inset 0 1px 0 0 rgba(255,255,255,0.35)" }}
                >
                  <Box className="h-12 w-12 text-white" />
                </div>
              </div>
              <Cube className="-left-8 -top-6" size={22} hue="white" />
              <Sphere className="-right-4 bottom-4" size={28} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */

function Footer() {
  const cols = [
    { h: "Product", l: ["Features", "How it works", "Pricing", "Updates"] },
    { h: "Resources", l: ["Blog", "Guides", "Templates", "Help center"] },
    { h: "Company", l: ["About us", "Contact us", "Privacy policy", "Terms of service"] },
  ];
  return (
    <footer className="border-t border-slate-200" style={{ background: "var(--hero-bg)" }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white">
              <Box className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">AcademiQ</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">AI-Powered SIWES Logbook</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-sm font-semibold">{c.h}</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {c.l.map((x) => <li key={x} className="cursor-pointer hover:text-foreground">{x}</li>)}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-sm font-semibold">Stay connected</p>
          <span className="mt-3 block text-xs text-violet-600">hello@academiq.app</span>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Twitter className="h-4 w-4 cursor-pointer hover:text-foreground" />
            <Instagram className="h-4 w-4 cursor-pointer hover:text-foreground" />
            <Linkedin className="h-4 w-4 cursor-pointer hover:text-foreground" />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} AcademiQ. All rights reserved.
      </div>
    </footer>
  );
}

/* ---------- PAGE ---------- */

export default function Landing() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Features />
      <DemoPanel />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
