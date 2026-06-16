import { Link } from "wouter";
import Nav from "@/components/MobileNav";
import { Box, Mail, MessageCircle, Twitter, Instagram, Linkedin, Clock, HelpCircle, Bug, Lightbulb, ArrowRight } from "lucide-react";
import { useState } from "react";



const reasons = [
  { icon: HelpCircle, color: "bg-violet-100 text-violet-600", label: "General question", value: "general" },
  { icon: Bug, color: "bg-red-100 text-red-500", label: "Found a bug", value: "bug" },
  { icon: Lightbulb, color: "bg-amber-100 text-amber-600", label: "Got an idea", value: "feature" },
  { icon: MessageCircle, color: "bg-emerald-100 text-emerald-600", label: "Partnership", value: "partnership" },
];

const channels = [
  {
    icon: Mail,
    color: "bg-violet-100 text-violet-600",
    title: "Email us",
    desc: "For all enquiries. We reply within 24 hours on weekdays.",
    action: "hello@academiq.app",
    href: "mailto:hello@academiq.app",
  },
  {
    icon: Twitter,
    color: "bg-sky-100 text-sky-500",
    title: "Twitter / X",
    desc: "Quick questions, feedback, or just to say hi. We're on there daily.",
    action: "@AcademiQApp",
    href: "https://twitter.com/AcademiQApp",
  },
  {
    icon: Instagram,
    color: "bg-pink-100 text-pink-500",
    title: "Instagram",
    desc: "Updates, student features, and behind-the-scenes stuff.",
    action: "@academiqapp",
    href: "https://instagram.com/academiqapp",
  },
];

export default function Contact() {
  const [selected, setSelected] = useState("general");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit() {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          Contact us
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          We'd love to <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">hear from you</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Got a question, found a bug, or have an idea? We're a small team and we actually read every message that comes in. Reach out — we'll get back to you.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">

          {/* Contact form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-xl font-bold">Got it!</h3>
                <p className="mt-2 text-sm text-muted-foreground">We'll get back to you within 24 hours. Thanks for writing in.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", message: "" }); }}
                  className="mt-6 text-sm font-medium text-violet-600 hover:underline"
                >
                  Send another one
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold">Send us a message</h2>
                <p className="mt-1 text-sm text-muted-foreground">We usually get back to you within 24 hours on weekdays.</p>

                {/* Reason selector */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setSelected(r.value)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
                        selected === r.value
                          ? "border-violet-400 bg-violet-50 text-violet-700"
                          : "border-slate-200 hover:border-violet-200"
                      }`}
                    >
                      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${r.color}`}>
                        <r.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>

                {/* Fields */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-foreground">Full name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-foreground">Email address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-foreground">Message</label>
                    <textarea
                      rows={5}
                      placeholder="What's on your mind?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:opacity-95 transition"
                  >
                    Send it
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="space-y-5">
            {/* How fast we respond */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">How fast we respond</p>
                <p className="text-sm text-muted-foreground">We reply within <span className="font-semibold text-violet-600">24 hours</span> on weekdays — usually faster.</p>
              </div>
            </div>

            {/* Channels */}
            {channels.map((c) => (
              <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-violet-200 transition block">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                  <p className="mt-1 text-xs font-semibold text-violet-600">{c.action}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}

            {/* Community */}
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-violet-600" />
                <p className="text-sm font-bold text-violet-700">Student community</p>
              </div>
              <p className="mt-2 text-sm text-violet-700/80">
                Join the community on LinkedIn. Share tips, ask questions, and connect with students from universities across Nigeria.
              </p>
              <a href="https://linkedin.com/company/academiqapp" target="_blank" rel="noopener noreferrer">
                <button className="mt-4 rounded-lg border border-violet-300 bg-white px-4 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition">
                  Join the community →
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
