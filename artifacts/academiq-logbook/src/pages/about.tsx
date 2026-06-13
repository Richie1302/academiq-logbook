import { Link } from "wouter";
import { Box, ArrowRight, Heart, Target, Lightbulb, Shield, Users, GraduationCap, Globe, Zap } from "lucide-react";

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

const values = [
  {
    icon: Heart,
    color: "bg-red-100 text-red-500",
    title: "Built with empathy",
    desc: "We remember what SIWES stress felt like. Every feature is designed to remove friction, not add to it. We build for students, not for ourselves.",
  },
  {
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600",
    title: "Privacy first",
    desc: "Your logbook is yours. We encrypt everything, never sell your data, and give you full control to export or delete at any time.",
  },
  {
    icon: Target,
    color: "bg-violet-100 text-violet-600",
    title: "Focused on Africa",
    desc: "AcademiQ isn't a global tool adapted for Nigeria — it's built from scratch for the Nigerian university system, SIWES standards, and African students.",
  },
  {
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600",
    title: "Always improving",
    desc: "We ship updates weekly based on student feedback. If something isn't working for you, we want to know — and we'll fix it fast.",
  },
];

const stats = [
  { val: "10,000+", label: "Students onboarded" },
  { val: "50+", label: "Nigerian universities" },
  { val: "500K+", label: "Logbook entries generated" },
  { val: "4.9★", label: "Average student rating" },
];

const team = [
  {
    name: "Caleb Ogundiran",
    role: "Founder & CEO",
    bio: "Cybersecurity graduate and full-stack developer. Built AcademiQ after watching his coursemates struggle with SIWES logbooks every single year.",
    img: "/avatar-femi.jpg",
    tag: "Builder",
  },
  {
    name: "Product Team",
    role: "Design & Engineering",
    bio: "A small, focused team of developers and designers passionate about EdTech and building products that actually solve African student problems.",
    img: "/avatar-chinedu.jpg",
    tag: "Engineers",
  },
  {
    name: "Student Council",
    role: "Community & Feedback",
    bio: "A group of active SIWES students across 10+ universities who test every feature, report bugs, and shape the product roadmap.",
    img: "/avatar-ngozi.jpg",
    tag: "Community",
  },
];

export default function About() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          ABOUT ACADEMIQ
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          We exist to make <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">SIWES stress-free</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
          AcademiQ was born from a simple frustration — Nigerian university students are brilliant, hardworking, and talented. But every year, thousands of them struggle with one avoidable problem: keeping up with their SIWES logbook. We decided to fix that.
        </p>
      </section>

      {/* Story */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">OUR STORY</p>
              <h2 className="mt-3 text-3xl font-bold leading-snug">Started by a student who lived the problem</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  AcademiQ was founded by Caleb Ogundiran, a Cybersecurity graduate from Caleb University Lagos. During his own SIWES placement, Caleb watched his coursemates — and himself — scramble to fill in weeks of missing logbook entries the night before submission deadlines.
                </p>
                <p>
                  The entries were rushed, poorly written, and nowhere near reflective of the actual work done. Supervisors weren't impressed. Students were stressed. And nobody was learning from the experience the way they should have been.
                </p>
                <p>
                  Caleb believed that if students just had a tool that made daily logging quick and easy — one that understood the SIWES context and helped them express their work professionally — the entire experience would transform. So he built it.
                </p>
                <p>
                  AcademiQ launched in 2024 and has since helped over 10,000 students across Nigeria write better logbooks, reduce SIWES stress, and impress their supervisors.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="grid grid-cols-2 gap-5">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                    <p className="text-3xl font-black text-violet-600">{s.val}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">OUR MISSION</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          To give every African student the tools to document their growth professionally
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          SIWES is one of the most important parts of a Nigerian student's university journey. It's where classroom theory meets real-world practice. AcademiQ's mission is to make sure that experience is properly captured, professionally documented, and genuinely reflected upon — by every student, at every university, across Africa.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          {[
            { icon: GraduationCap, text: "Student-first" },
            { icon: Globe, text: "Pan-African" },
            { icon: Zap, text: "AI-powered" },
            { icon: Users, text: "Community-driven" },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-violet-700 shadow-sm">
              <t.icon className="h-4 w-4" />
              {t.text}
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">OUR VALUES</p>
          <h2 className="mb-10 text-center text-3xl font-bold">What we stand for</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${v.color}`}>
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">THE TEAM</p>
        <h2 className="mb-10 text-center text-3xl font-bold">The people behind AcademiQ</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {team.map((t) => (
            <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <img src={t.img} alt={t.name} className="mx-auto h-20 w-20 rounded-full border-4 border-violet-100 object-cover shadow-md" />
              <span className="mt-4 inline-block rounded-full bg-violet-100 px-3 py-0.5 text-[10px] font-semibold text-violet-600">{t.tag}</span>
              <h3 className="mt-2 text-base font-bold">{t.name}</h3>
              <p className="text-xs text-violet-500 font-medium">{t.role}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <Heart className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-4 text-3xl font-bold text-white">Be part of the story</h2>
          <p className="mt-2 text-sm text-white/80">Join 10,000+ students already using AcademiQ to ace their SIWES.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
                Get started free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white">
                Contact us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
