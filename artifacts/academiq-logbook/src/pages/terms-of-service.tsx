import { Link } from "wouter";
import { Box, FileText, UserCheck, ShieldCheck, AlertTriangle, CreditCard, Scale, Globe, RefreshCw, Mail, Ban, Gavel } from "lucide-react";

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

const sections = [
  {
    icon: FileText,
    color: "bg-violet-100 text-violet-600",
    title: "1. Acceptance of Terms",
    content: `Using AcademiQ means you agree to these Terms and our Privacy Policy. If you're using AcademiQ on behalf of a school or organisation, you're confirming you have the authority to agree on their behalf.

If you don't agree with any of this, please don't use AcademiQ. We can update these Terms at any time — if you keep using the platform after a change, that means you accept the updated version.

These Terms are a legal agreement between you and AcademiQ Technologies.`,
  },
  {
    icon: UserCheck,
    color: "bg-blue-100 text-blue-600",
    title: "2. Eligibility & Account Registration",
    content: `To use AcademiQ, you need to:

• Be at least 16 years of age, or have the consent of a parent or legal guardian
• Be a currently enrolled or recently graduated student, educator, or academic professional
• Provide accurate, current, and complete information during registration
• Maintain the security of your account credentials and not share your password with others

Whatever happens under your account is your responsibility. If you think someone else has gotten into it, let us know straight away at hello@academiq.app.

We can refuse, suspend, or close accounts — especially if we think the Terms are being broken.`,
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
    title: "3. Permitted Use",
    content: `AcademiQ is for students, educators, and academic institutions. It's for personal and educational use — not commercial resale.

You may use AcademiQ to:
• Write, generate, edit, and export SIWES logbook entries
• Store and manage your logbook history
• Share read-only access to your logbook with your supervisor
• Access educational resources on the platform

Use it honestly and for what it's designed for — helping you document your real SIWES experience.`,
  },
  {
    icon: Ban,
    color: "bg-red-100 text-red-500",
    title: "4. Prohibited Use",
    content: `Here's what you can't use AcademiQ for:

• Academic fraud — Submitting AI-generated content as your own work in violation of your institution's academic integrity policies. You are solely responsible for ensuring your use of AcademiQ complies with your university's rules.

• Misrepresentation — Creating logbook entries that contain entirely fabricated activities, false dates, or false employer/supervisor information.

• Unauthorised access — Attempting to access other users' accounts, bypassing security measures, or reverse-engineering the platform.

• Harmful content — Uploading or generating content that is defamatory, obscene, threatening, or in violation of any applicable law.

• Spam or abuse — Using the platform to send unsolicited communications or to scrape data.

• Resale — Reselling, sublicensing, or commercially exploiting AcademiQ or its output without our written permission.

Breaking these rules can get your account closed immediately and, in serious cases, lead to legal action.`,
  },
  {
    icon: FileText,
    color: "bg-amber-100 text-amber-600",
    title: "5. Your Content & Intellectual Property",
    content: `Everything you write and input on AcademiQ is yours. We don't claim ownership over any of it.

By using AcademiQ, you give us permission to process your content — but only to actually run the service. That means generating your AI entries, storing your logbook, and letting you export to PDF.

We don't own your logbook. And we won't use your entries to train AI models without your explicit written permission.

AI-Generated Content
The entries the AI generates are based on what you put in — they're for your use. Always read them over before sending to your supervisor. You're responsible for what you submit.

The AcademiQ platform itself — the design, the code, the branding — belongs to us. Please don't copy or redistribute it without asking first.`,
  },
  {
    icon: CreditCard,
    color: "bg-indigo-100 text-indigo-600",
    title: "6. Subscription & Payments",
    content: `AcademiQ offers a free tier with limited features and paid subscription plans with expanded capabilities. Pricing details are available on our Pricing page.

Free Tier
The free tier is provided at no cost and may be modified or discontinued at any time with reasonable notice.

Paid Plans
• Subscriptions are billed in advance on a monthly or annual basis
• Payments are processed securely through our payment provider
• All prices are displayed in Nigerian Naira (NGN) or United States Dollars (USD) where applicable

Refunds
We offer a 7-day refund policy for new paid subscriptions. Refund requests must be submitted to hello@academiq.app within 7 days of your first payment. Refunds are not available after this window or for renewals.

Cancellation
You may cancel your subscription at any time from your Settings page. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the period ends.`,
  },
  {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-500",
    title: "7. Disclaimers & Limitation of Liability",
    content: `No academic guarantee
AcademiQ helps you write better — it doesn't guarantee your supervisor will love every entry. You're responsible for reviewing and standing behind the content you submit.

Service availability
We do our best to keep AcademiQ running smoothly, but we can't promise zero downtime. Maintenance and the occasional unexpected issue can happen.

As-is
AcademiQ is provided as-is. We don't make any formal warranties beyond what's stated in these Terms.

Liability limits
We're not liable for indirect or consequential losses — like academic penalties or reputational damage — that result from using or being unable to use AcademiQ. Our total liability to you won't exceed what you've paid us in the 3 months before a claim.`,
  },
  {
    icon: Globe,
    color: "bg-teal-100 text-teal-600",
    title: "8. Third-Party Services",
    content: `AcademiQ uses third-party services to run — things like AI, cloud infrastructure, and payment processing. Your use of those services may also be covered by their own terms. We're not responsible for what those services do, and linking to them doesn't mean we endorse them.`,
  },
  {
    icon: Gavel,
    color: "bg-slate-100 text-slate-600",
    title: "9. Governing Law & Dispute Resolution",
    content: `These Terms follow Nigerian law.

Sorting out disputes
If something goes wrong, let's talk first. Email us at hello@academiq.app and we'll do our best to resolve it within 14 business days.

If we can't resolve it informally within 30 days, we'll go to arbitration under the Arbitration and Mediation Act 2023 of Nigeria, seated in Lagos State.

Either party can still go to court for urgent relief if needed.`,
  },
  {
    icon: Ban,
    color: "bg-rose-100 text-rose-500",
    title: "10. Termination",
    content: `Leaving AcademiQ
You can delete your account anytime from your Settings page. When you do, your data will be deleted in line with our Privacy Policy.

If we close your account
We can suspend or close your account immediately if:
• You've broken these Terms — especially the prohibited use section
• We're legally required to
• Your actions are harming other users or the platform

If we close your account for breaking the rules, we won't be issuing a refund.

Sections of these Terms that by their nature should survive termination (including intellectual property, disclaimers, and governing law) shall continue to apply after termination.`,
  },
  {
    icon: RefreshCw,
    color: "bg-cyan-100 text-cyan-600",
    title: "11. Changes to These Terms",
    content: `We can update these Terms when we need to. If we make a significant change, we'll:

• Update the date at the top of this page
• Email you at least 14 days before it kicks in
• Show a notice on the platform

If you keep using AcademiQ after the update, that means you're okay with the new Terms. If not, you can delete your account and leave.`,
  },
  {
    icon: Mail,
    color: "bg-pink-100 text-pink-500",
    title: "12. Contact Information",
    content: `Got questions about these Terms? Just ask.

Email: hello@academiq.app
Contact form: academiq.app/contact

For formal legal notices, email hello@academiq.app with "Legal Notice" in the subject line. We aim to respond to everything within 5 business days.`,
  },
];

export default function TermsOfService() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          LEGAL
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Last updated: <strong>June 2025</strong> · Effective date: <strong>June 1, 2025</strong>
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Please read this before using AcademiQ. By signing up or using the platform, you're agreeing to these Terms.
        </p>
      </section>

      {/* Summary cards */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Scale, color: "bg-violet-100 text-violet-600", title: "Governed by Nigerian law", desc: "These Terms follow the laws of the Federal Republic of Nigeria." },
            { icon: ShieldCheck, color: "bg-emerald-100 text-emerald-600", title: "Your content is yours", desc: "Everything you write on AcademiQ belongs to you." },
            { icon: AlertTriangle, color: "bg-amber-100 text-amber-600", title: "Use responsibly", desc: "Make sure your use of AcademiQ lines up with your institution's own rules." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-bold">{c.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold">{s.title}</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
                {s.content.split("\n\n").map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <Gavel className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-4 text-2xl font-bold text-white">Got questions about these Terms?</h2>
          <p className="mt-2 text-sm text-white/80">We're happy to explain anything here in plain terms. Reach out and we'll get back to you within 5 business days.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="mailto:hello@academiq.app">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
                <Mail className="h-4 w-4" /> hello@academiq.app
              </button>
            </a>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white">
                Contact form
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
