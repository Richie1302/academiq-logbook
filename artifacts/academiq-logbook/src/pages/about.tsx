import { Link } from "wouter";
import Nav from "@/components/MobileNav";
import { Box, ArrowRight, Heart, Target, Lightbulb, Shield, Users, GraduationCap, Globe, Zap } from "lucide-react";



const values = [
  {
    icon: Heart,
    color: "bg-red-100 text-red-500",
    title: "Built with empathy",
    desc: "We remember what SIWES stress actually feels like. Every feature we ship is about removing friction, not adding more. We build for students — full stop.",
  },
  {
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600",
    title: "Privacy first",
    desc: "Your logbook belongs to you. We encrypt everything, never sell your data, and you can export or delete everything whenever you want.",
  },
  {
    icon: Target,
    color: "bg-violet-100 text-violet-600",
    title: "Focused on Africa",
    desc: "AcademiQ isn't a Western tool with a Nigerian flag slapped on it. It's built from scratch for the Nigerian university system, SIWES standards, and African students.",
  },
  {
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600",
    title: "Always improving",
    desc: "We push updates every week based on what students tell us. If something's broken or confusing, tell us — we'll fix it fast.",
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
    name: "Ogundiran Caleb Ayodeji",
    role: "Founder & Developer",
    bio: "Cybersecurity student at Caleb University Lagos. Built AcademiQ after going through SIWES himself and realising the logbook was the hardest part of a programme that was supposed to be about real-world experience.",
    img: "/avatar-femi.jpg",
    tag: "Founder",
  },
  {
    name: "Product Team",
    role: "Design & Engineering",
    bio: "A small, tight team of developers and designers who care about building things that actually work for African students — not just looking like they do.",
    img: "/avatar-chinedu.jpg",
    tag: "Engineers",
  },
  {
    name: "Student Council",
    role: "Community & Feedback",
    bio: "Active SIWES students from 10+ universities across Nigeria who test every feature, catch bugs early, and help decide what we build next.",
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
          About AcademiQ
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          We exist to make <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">SIWES stress-free</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
          AcademiQ started with a frustration — Nigerian students are sharp, hardworking, and capable. But every year, so many of them get tripped up by something completely avoidable: the SIWES logbook. We decided to do something about it.
        </p>
      </section>

      {/* Story */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">The story behind it</p>
              <h2 className="mt-3 text-3xl font-bold leading-snug">Built by a student who lived through it</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  My name is Ogundiran Caleb Ayodeji, a Cybersecurity student at Caleb University Lagos. AcademiQ came out of a problem I dealt with personally during my own SIWES.
                </p>
                <p>
                  Writing logbook entries was genuinely difficult. After a full day at my placement, I would sit down to write and draw a complete blank. How do you turn something like "I helped configure a router today" into a proper, professional entry that actually reads well? I had no idea. That feeling of not knowing how to capture real work in words stuck with me long after my SIWES ended.
                </p>
                <p>
                  I looked around and realised there was nothing built specifically for this problem. Every student was going through the same thing and struggling alone. So I built AcademiQ. A tool that takes what you did in plain, everyday language and turns it into a well-structured, professional logbook entry.
                </p>
                <p>
                  I am a self-taught full-stack engineer and I built this entirely solo as a student. No funding, no team, just a clear problem and the determination to solve it. It has been challenging but AcademiQ is now being used daily by students across Nigerian universities and it keeps growing.
                </p>
                <p>
                  There is still a lot more on the roadmap — a placement board, Pro features, and bigger things ahead. But every decision I make for this product comes back to the same motivation. I just wanted to build the tool I wish I had when I was the one sitting there with a blank page and a long day behind me.
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
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Our mission</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          To give every African student the tools they need to document their journey properly
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          SIWES is where everything clicks — classroom theory finally meets real-world practice. AcademiQ exists to make sure that experience gets properly captured, professionally documented, and genuinely reflected on. Not just at one school. Every student, every university, across Africa.
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
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">What we believe</p>
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
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">The team</p>
        <h2 className="mb-10 text-center text-3xl font-bold">The people behind it</h2>
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
          <h2 className="mt-4 text-3xl font-bold text-white">Be part of it</h2>
          <p className="mt-2 text-sm text-white/80">Over 10,000 students are already writing better logbooks. Come join them.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
                Get started — it's free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white">
                Reach out
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
