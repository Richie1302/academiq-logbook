import { Link } from "wouter";
import Nav from "@/components/MobileNav";
import { Box, ArrowRight, BookOpen, FileText, Video, Download, Lightbulb, GraduationCap, ClipboardList, HelpCircle } from "lucide-react";



const guides = [
  {
    icon: GraduationCap,
    color: "bg-violet-100 text-violet-600",
    tag: "Guide",
    title: "The Complete SIWES Logbook Guide for Nigerian Students",
    desc: "Everything you need to know about writing a SIWES logbook that impresses supervisors — from structure and format to common mistakes to avoid.",
    readTime: "8 min read",
  },
  {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-600",
    tag: "Template",
    title: "SIWES Logbook Entry Templates by Discipline",
    desc: "Ready-to-use entry templates for Software Engineering, Electrical, Mechanical, Civil, Business Admin, Pharmacy, and more.",
    readTime: "Templates",
  },
  {
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600",
    tag: "Tips",
    title: "10 Tips for Writing SIWES Entries That Supervisors Love",
    desc: "Practical, field-tested tips from students who aced their SIWES assessments. Learn the exact phrases and structures that supervisors respond to.",
    readTime: "5 min read",
  },
  {
    icon: FileText,
    color: "bg-emerald-100 text-emerald-600",
    tag: "Sample",
    title: "50 Sample SIWES Logbook Entries Across All Fields",
    desc: "A curated collection of 50 sample entries spanning IT, engineering, business, and sciences. Use them as reference or inspiration for your own logs.",
    readTime: "Reference",
  },
  {
    icon: Video,
    color: "bg-red-100 text-red-500",
    tag: "Video",
    title: "AcademiQ Walkthrough: Getting Started in 5 Minutes",
    desc: "A quick video walkthrough showing you how to write your first AI-powered SIWES entry from scratch. Perfect for new users.",
    readTime: "5 min watch",
  },
  {
    icon: BookOpen,
    color: "bg-pink-100 text-pink-500",
    tag: "Blog",
    title: "How to Make the Most of Your SIWES Placement",
    desc: "Beyond the logbook — advice on how to build real skills, make professional connections, and set yourself up for a strong career during your industrial training.",
    readTime: "6 min read",
  },
];

const faqs = [
  {
    q: "What is SIWES and why does the logbook matter?",
    a: "SIWES (Students Industrial Work Experience Scheme) is a mandatory industrial training programme for Nigerian university students. The logbook is an official record of your daily activities — it's assessed by your university and determines part of your final grade.",
  },
  {
    q: "How long should a SIWES logbook entry be?",
    a: "Most supervisors expect between 150–300 words per entry. It should cover what you did, what tools or methods you used, any challenges you encountered, and what you learned. AcademiQ generates entries within this range by default.",
  },
  {
    q: "What should I write about if I had a slow day?",
    a: "Even on slow days, something happened — an observation, a meeting, background reading, or shadowing a colleague. AcademiQ can help you frame even minor activities into meaningful, reflective entries.",
  },
  {
    q: "Can I use AcademiQ on my phone?",
    a: "Yes. AcademiQ is fully mobile-responsive. You can write and submit entries directly from your smartphone — no app download required.",
  },
  {
    q: "Does AcademiQ work for non-technical SIWES placements?",
    a: "Absolutely. AcademiQ supports all SIWES disciplines including business, health sciences, agriculture, education, and social sciences.",
  },
  {
    q: "How do I share my logbook with my supervisor?",
    a: "You can generate a read-only shareable link from your dashboard, or export to PDF and send directly. Both options are available on all plans.",
  },
];

const downloads = [
  { title: "SIWES Logbook Cover Page Template", type: "DOCX", size: "45 KB" },
  { title: "Sample Completed SIWES Logbook (IT)", type: "PDF", size: "1.2 MB" },
  { title: "SIWES Assessment Criteria Breakdown", type: "PDF", size: "320 KB" },
  { title: "Daily Entry Planner Worksheet", type: "PDF", size: "180 KB" },
];

export default function Resources() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          Resources
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          Everything you need to <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">ace SIWES</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Free guides, templates, and sample entries to help you stop stressing about your logbook and actually make the most of your SIWES.
        </p>
      </section>

      {/* Guides grid */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-6 text-2xl font-bold">Guides & articles</h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <div key={g.title} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-violet-200">
              <div className="flex items-start justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${g.color}`}>
                  <g.icon className="h-5 w-5" />
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{g.tag}</span>
              </div>
              <h3 className="mt-4 text-base font-bold leading-snug group-hover:text-violet-600 transition-colors">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
              <p className="mt-4 text-xs font-medium text-violet-500">{g.readTime} →</p>
            </div>
          ))}
        </div>
      </section>

      {/* Downloads */}
      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 text-2xl font-bold">Free downloads</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {downloads.map((d) => (
              <div key={d.title} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:border-violet-200 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.type} · {d.size}</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-violet-500" />
          <h2 className="text-2xl font-bold">Questions students always ask</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <BookOpen className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-4 text-3xl font-bold text-white">Ready to actually start?</h2>
          <p className="mt-2 text-sm text-white/80">Everything above is free. AcademiQ is free to start too.</p>
          <Link href="/sign-up">
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
              Create your free account <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
