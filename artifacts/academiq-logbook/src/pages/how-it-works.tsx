import { Link } from "wouter";
import { Box, ArrowRight, Pencil, Sparkles, Download, CheckCircle2, Clock, Shield, Users, ChevronRight } from "lucide-react";

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
        <Link href="/sign-in"><span className="hidden cursor-pointer text-sm font-medium text-foreground sm:block">Sign in</span></Link>
        <Link href="/sign-up">
          <button className="rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30">
            Get started free
          </button>
        </Link>
      </div>
    </nav>
  );
}

const steps = [
  {
    n: "01",
    icon: Pencil,
    color: "bg-violet-100 text-violet-600",
    title: "Write what you did",
    desc: "Open AcademiQ and type out what you did — just like you'd tell a friend. No special format, no jargon. Just say the tasks you did, the tools you used, any issues you ran into, and what you picked up from it.",
    tip: "💡 Even three rough sentences is enough. Seriously.",
    example: `"Today I worked on API integration for the inventory module. Connected the frontend to the backend and fixed a few bugs that were causing data mismatches."`,
  },
  {
    n: "02",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-600",
    title: "The AI cleans it up",
    desc: "Our AI — built specifically around SIWES standards — takes that rough note and turns it into a proper entry. It fills out your points, adds the right technical language, fixes the grammar, and formats everything the way Nigerian supervisors want to see it.",
    tip: "💡 Not 100% happy with it? Edit it before saving. You're always in control.",
    example: `"I worked on the integration of the inventory management module by connecting the frontend interface to the backend REST API endpoints. I identified and resolved several data mismatch bugs that were arising from incorrect field mapping between the request and response objects..."`,
  },
  {
    n: "03",
    icon: Download,
    color: "bg-emerald-100 text-emerald-600",
    title: "Export it and you're done",
    desc: "Once it looks good, save it. When your supervisor asks for your logbook — or when it's submission time — export everything as a clean PDF in one click. No scrambling, no rushing.",
    tip: "💡 Five minutes before bed. That's all it takes to never fall behind again.",
    example: null,
  },
];

const faqs = [
  { q: "Is AcademiQ free?", a: "Yes — and the free tier is genuinely generous. You get up to 30 entries a month, which covers most SIWES placements. If you need more, our paid plans have you covered." },
  { q: "Will my supervisor know I used AI?", a: "AcademiQ works from the real activities you describe — it just helps you say it better. Think of it like Grammarly, but for logbook writing. The content is always based on what you actually did." },
  { q: "What if my SIWES isn't in a tech field?", a: "AcademiQ works for every discipline — engineering, business, health sciences, agriculture, you name it. Just describe what you did and the AI figures out the rest." },
  { q: "Can I edit what the AI generates?", a: "100%. Every entry is fully editable before you save it. You have the final say on everything." },
  { q: "Is my data safe?", a: "Yes. Everything is encrypted and stored securely. We don't share your data with anyone, full stop." },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          How it works
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          From rough notes to <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">polished reports</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          AcademiQ turns your everyday SIWES activities into professional logbook entries in seconds. Here's exactly how it works.
        </p>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={step.n} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-8 md:grid-cols-2 md:items-start">
                <div>
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${step.color}`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="text-4xl font-black text-slate-100">{step.n}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">{step.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  <p className="mt-4 text-sm text-violet-600">{step.tip}</p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {i === 0 ? "Your input" : i === 1 ? "AI output" : "Result"}
                  </p>
                  {step.example ? (
                    <p className="text-sm italic text-foreground/80">{step.example}</p>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { icon: CheckCircle2, text: "Clean PDF ready to submit", c: "text-emerald-500" },
                        { icon: Clock, text: "Your full logbook history saved", c: "text-blue-500" },
                        { icon: Shield, text: "Formatted the way supervisors expect", c: "text-violet-500" },
                      ].map((item) => (
                        <div key={item.text} className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${item.c}`} />
                          <span className="text-sm">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="mt-6 flex justify-center">
                  <ChevronRight className="h-6 w-6 rotate-90 text-violet-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { val: "10,000+", label: "Students onboarded" },
            { val: "500K+", label: "Entries generated" },
            { val: "4.9/5", label: "Average rating" },
            { val: "< 10s", label: "Per entry" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-violet-600">{s.val}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <Users className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-4 text-3xl font-bold text-white">Ready to give it a shot?</h2>
          <p className="mt-2 text-sm text-white/80">Thousands of students are already writing better logbooks. You could be next.</p>
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
