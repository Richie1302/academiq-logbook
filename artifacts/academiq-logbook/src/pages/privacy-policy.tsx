import { Link } from "wouter";
import { Box, Shield, Lock, Eye, Trash2, Mail, RefreshCw, Globe, Server, UserCheck } from "lucide-react";

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
    icon: UserCheck,
    color: "bg-violet-100 text-violet-600",
    title: "1. Who We Are",
    content: `AcademiQ ("we", "us", or "our") is an AI-powered SIWES logbook platform developed and operated by AcademiQ Technologies. Our registered address and primary contact email is hello@academiq.app.

We are committed to protecting your personal data and respecting your privacy in accordance with the Nigeria Data Protection Regulation (NDPR) 2019, the Nigeria Data Protection Act (NDPA) 2023, and other applicable data protection laws.

By using AcademiQ, you agree to the collection and use of your information as described in this Privacy Policy.`,
  },
  {
    icon: Eye,
    color: "bg-blue-100 text-blue-600",
    title: "2. Information We Collect",
    content: `We collect the following categories of personal data when you use AcademiQ:

**Account Information**
When you register, we collect your name, email address, and password (stored in encrypted form). You may also optionally provide your university, department, course, and SIWES placement details.

**Logbook Content**
The entries you write and the AI-generated content associated with them are stored securely in your account. This content belongs to you.

**Usage Data**
We automatically collect information about how you interact with our platform — including pages visited, features used, session duration, and device/browser type. This helps us improve AcademiQ.

**Communications**
If you contact us by email or through our contact form, we retain your messages to respond to you and improve our support.

We do not collect sensitive personal data such as financial information, national identification numbers, or health data.`,
  },
  {
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600",
    title: "3. How We Use Your Information",
    content: `We use your personal data only for the following purposes:

• **To provide our service** — Creating and managing your account, generating AI logbook entries, storing your logbook history, and enabling PDF export.

• **To improve AcademiQ** — Analysing anonymised usage patterns to fix bugs, improve features, and build a better product.

• **To communicate with you** — Sending important account notifications, product updates, and responding to your support requests. You can opt out of marketing emails at any time.

• **To ensure security** — Detecting and preventing fraud, abuse, and unauthorised access to our platform.

• **To comply with legal obligations** — Retaining records as required by Nigerian law and responding to lawful requests from authorities.

We do not use your logbook content to train AI models without your explicit consent.`,
  },
  {
    icon: Globe,
    color: "bg-amber-100 text-amber-600",
    title: "4. Legal Basis for Processing",
    content: `Under the NDPA 2023 and NDPR 2019, we process your personal data on the following legal bases:

• **Contractual necessity** — Processing required to deliver the AcademiQ service you signed up for.

• **Legitimate interests** — Processing for fraud prevention, platform security, and product improvement, where these interests are not overridden by your rights.

• **Consent** — Where we ask for your explicit consent (e.g. marketing emails), you may withdraw it at any time without affecting prior processing.

• **Legal compliance** — Where we are required by law to process or retain your data.`,
  },
  {
    icon: Server,
    color: "bg-indigo-100 text-indigo-600",
    title: "5. Data Storage & Security",
    content: `Your data is stored on secure, enterprise-grade cloud infrastructure hosted within certified, access-controlled data centres.

We implement the following security measures to protect your data:

• End-to-end encryption for all data in transit (TLS 1.2+/HTTPS)
• Encryption at rest for all stored data
• Role-based access controls — only authorised personnel can access user data
• Secure, industry-standard authentication and session management
• Regular security audits and vulnerability assessments
• Automatic backups and disaster recovery procedures

Despite these measures, no system is 100% secure. If we become aware of a data breach that affects your personal information, we will notify you and the relevant authorities within 72 hours as required by law.`,
  },
  {
    icon: RefreshCw,
    color: "bg-pink-100 text-pink-500",
    title: "6. Data Sharing & Third Parties",
    content: `We do not sell your personal data to third parties. Ever.

We share data only with a small number of trusted third-party service providers, strictly to operate and deliver the AcademiQ platform. These providers are contractually bound to process your data only on our instructions, to maintain appropriate security standards, and to comply with applicable data protection law.

The categories of providers we work with include:

• **Authentication & database infrastructure** — Secure cloud services that store your account data and logbook entries with encryption at rest and in transit.

• **AI processing** — An AI provider used to generate logbook entry content. Your input is processed to generate a response and is not retained or used to train models beyond the scope of your request.

• **Email delivery** — A transactional email service used to send account notifications and support responses.

• **Hosting & deployment** — Cloud infrastructure providers that serve the AcademiQ web application and API.

We do not share your data with advertisers, data brokers, or any party for marketing purposes.

We may disclose your information if required to do so by law, court order, or a lawful request from a Nigerian government authority. We will notify you of such requests where legally permitted to do so.`,
  },
  {
    icon: Lock,
    color: "bg-orange-100 text-orange-500",
    title: "7. Your Rights",
    content: `Under the NDPA 2023 and NDPR 2019, you have the following rights regarding your personal data:

• **Right of access** — You may request a copy of the personal data we hold about you at any time.

• **Right to rectification** — You may ask us to correct inaccurate or incomplete personal data.

• **Right to erasure** — You may request that we delete your account and all associated data. We will comply within 30 days, except where we are required by law to retain certain information.

• **Right to data portability** — You may request your logbook data in a structured, machine-readable format (JSON or PDF).

• **Right to object** — You may object to processing based on legitimate interests, including direct marketing.

• **Right to withdraw consent** — Where processing is based on consent, you may withdraw it at any time.

To exercise any of these rights, email us at hello@academiq.app with the subject line "Data Rights Request". We will respond within 30 days.`,
  },
  {
    icon: Trash2,
    color: "bg-red-100 text-red-500",
    title: "8. Data Retention",
    content: `We retain your personal data for as long as your account is active or as necessary to provide our services.

If you delete your account:
• Your logbook entries and profile data are permanently deleted within 30 days
• Anonymised, non-identifiable usage analytics may be retained indefinitely
• We may retain certain records for up to 6 years where required for legal or tax compliance purposes

You can delete your account at any time from your Settings page.`,
  },
  {
    icon: Mail,
    color: "bg-teal-100 text-teal-600",
    title: "9. Cookies",
    content: `AcademiQ uses essential cookies and local storage to keep you logged in and maintain your session. We do not use third-party advertising cookies or cross-site tracking cookies.

The following types of cookies are used:

• **Authentication cookies** — Required to keep you signed in securely
• **Preference cookies** — To remember your in-app settings
• **Analytics cookies** — Anonymised data to understand how the platform is used (you can opt out)

You can manage cookie preferences through your browser settings. Disabling essential cookies may affect the functionality of AcademiQ.`,
  },
  {
    icon: RefreshCw,
    color: "bg-cyan-100 text-cyan-600",
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.

When we make material changes, we will:
• Update the "Last updated" date at the top of this page
• Notify you by email if the changes significantly affect your rights
• Display a notice on the platform

Your continued use of AcademiQ after the effective date of any changes constitutes your acceptance of the updated policy.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          LEGAL
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Last updated: <strong>June 2025</strong> · Effective date: <strong>June 1, 2025</strong>
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Your privacy matters to us. This policy explains what data we collect, how we use it, and the rights you have over it — in plain English, not legal jargon.
        </p>
      </section>

      {/* Quick summary cards */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Shield, color: "bg-emerald-100 text-emerald-600", title: "We never sell your data", desc: "Your personal information is never sold to advertisers or third parties." },
            { icon: Lock, color: "bg-violet-100 text-violet-600", title: "Your content is yours", desc: "Your logbook entries belong to you. Export or delete them anytime." },
            { icon: UserCheck, color: "bg-blue-100 text-blue-600", title: "NDPR compliant", desc: "We comply fully with Nigeria's Data Protection Regulation and Act 2023." },
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

      {/* Policy sections */}
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

      {/* Contact */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <Mail className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-4 text-2xl font-bold text-white">Questions about your privacy?</h2>
          <p className="mt-2 text-sm text-white/80">Our Data Protection Officer is available to help. Reach out anytime.</p>
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
