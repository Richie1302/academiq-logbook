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
    content: `By accessing or using AcademiQ ("the Service", "the Platform"), you ("User", "you") agree to be bound by these Terms of Service ("Terms") and our Privacy Policy, which is incorporated herein by reference.

If you are using AcademiQ on behalf of an institution or organisation, you represent that you have the authority to bind that entity to these Terms.

If you do not agree to these Terms, do not access or use AcademiQ. We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms.

These Terms constitute a legally binding agreement between you and AcademiQ Technologies ("Company", "we", "us").`,
  },
  {
    icon: UserCheck,
    color: "bg-blue-100 text-blue-600",
    title: "2. Eligibility & Account Registration",
    content: `To use AcademiQ, you must:

• Be at least 16 years of age, or have the consent of a parent or legal guardian
• Be a currently enrolled or recently graduated student, educator, or academic professional
• Provide accurate, current, and complete information during registration
• Maintain the security of your account credentials and not share your password with others

You are responsible for all activity that occurs under your account. If you suspect unauthorised access to your account, you must notify us immediately at hello@academiq.app.

We reserve the right to refuse registration, suspend, or terminate accounts at our discretion, particularly where we believe the Terms have been violated.`,
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-600",
    title: "3. Permitted Use",
    content: `AcademiQ is provided for personal, educational, and non-commercial use by students, educators, and academic institutions.

You may use AcademiQ to:
• Write, generate, edit, and export SIWES logbook entries
• Store and manage your logbook history
• Share read-only access to your logbook with your supervisor
• Access educational resources on the platform

You agree to use the platform in good faith and in a manner consistent with its intended purpose — supporting genuine academic and industrial training documentation.`,
  },
  {
    icon: Ban,
    color: "bg-red-100 text-red-500",
    title: "4. Prohibited Use",
    content: `You must not use AcademiQ for any of the following:

• **Academic fraud** — Submitting AI-generated content as your own work in violation of your institution's academic integrity policies. You are solely responsible for ensuring your use of AcademiQ complies with your university's rules.

• **Misrepresentation** — Creating logbook entries that contain entirely fabricated activities, false dates, or false employer/supervisor information.

• **Unauthorised access** — Attempting to access other users' accounts, bypassing security measures, or reverse-engineering the platform.

• **Harmful content** — Uploading or generating content that is defamatory, obscene, threatening, or in violation of any applicable law.

• **Spam or abuse** — Using the platform to send unsolicited communications or to scrape data.

• **Resale** — Reselling, sublicensing, or commercially exploiting AcademiQ or its output without our written permission.

Violation of these prohibitions may result in immediate account termination and, where applicable, legal action.`,
  },
  {
    icon: FileText,
    color: "bg-amber-100 text-amber-600",
    title: "5. Your Content & Intellectual Property",
    content: `You retain full ownership of the content you input into AcademiQ, including your original notes and descriptions.

By using AcademiQ, you grant us a limited, non-exclusive, royalty-free licence to process your content solely for the purpose of providing the Service — including generating AI-enhanced entries, storing your logbook, and enabling PDF export.

We do not claim ownership over your logbook content. We will not use your individual entries to train AI models without your explicit written consent.

**AI-Generated Content**
The logbook entries generated by our AI are based on your input and are provided to you for your use. You are responsible for reviewing and verifying the accuracy of all AI-generated content before submitting it to supervisors or institutions.

AcademiQ's platform design, branding, code, and non-user-generated content are the intellectual property of AcademiQ Technologies and may not be copied, reproduced, or distributed without our written permission.`,
  },
  {
    icon: CreditCard,
    color: "bg-indigo-100 text-indigo-600",
    title: "6. Subscription & Payments",
    content: `AcademiQ offers a free tier with limited features and paid subscription plans with expanded capabilities. Pricing details are available on our Pricing page.

**Free Tier**
The free tier is provided at no cost and may be modified or discontinued at any time with reasonable notice.

**Paid Plans**
• Subscriptions are billed in advance on a monthly or annual basis
• Payments are processed securely through our payment provider
• All prices are displayed in Nigerian Naira (NGN) or United States Dollars (USD) where applicable

**Refunds**
We offer a 7-day refund policy for new paid subscriptions. Refund requests must be submitted to hello@academiq.app within 7 days of your first payment. Refunds are not available after this window or for renewals.

**Cancellation**
You may cancel your subscription at any time from your Settings page. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the period ends.`,
  },
  {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-500",
    title: "7. Disclaimers & Limitation of Liability",
    content: `**No Academic Guarantee**
AcademiQ is a writing assistance tool. We do not guarantee that your supervisor, institution, or employer will accept, approve, or be satisfied with any content generated using our platform. You are solely responsible for the quality, accuracy, and appropriateness of content you submit.

**Service Availability**
We aim to maintain high availability but do not guarantee uninterrupted access to AcademiQ. The platform may be unavailable due to maintenance, upgrades, or circumstances beyond our control.

**As-Is Basis**
AcademiQ is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.

**Limitation of Liability**
To the fullest extent permitted by Nigerian law, AcademiQ Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, academic penalties, or reputational harm, arising from your use of or inability to use the Service.

Our total liability to you for any claim arising from these Terms or your use of AcademiQ shall not exceed the amount you paid us in the 3 months preceding the claim.`,
  },
  {
    icon: Globe,
    color: "bg-teal-100 text-teal-600",
    title: "8. Third-Party Services",
    content: `AcademiQ integrates with third-party services including AI providers, cloud infrastructure, and payment processors. Your use of these integrated services may be subject to their own terms and privacy policies.

We are not responsible for the content, practices, or terms of third-party services. Links to external websites or services from AcademiQ do not constitute endorsement.`,
  },
  {
    icon: Gavel,
    color: "bg-slate-100 text-slate-600",
    title: "9. Governing Law & Dispute Resolution",
    content: `These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.

**Dispute Resolution**
In the event of a dispute arising from these Terms or your use of AcademiQ, the parties agree to first attempt to resolve the matter informally by contacting us at hello@academiq.app. We will respond within 14 business days.

If the dispute cannot be resolved informally within 30 days, it shall be referred to and finally resolved by arbitration under the Arbitration and Mediation Act 2023 of Nigeria, with the seat of arbitration in Lagos State.

Nothing in this clause prevents either party from seeking urgent injunctive relief from a court of competent jurisdiction.`,
  },
  {
    icon: Ban,
    color: "bg-rose-100 text-rose-500",
    title: "10. Termination",
    content: `**By You**
You may terminate your account at any time by deleting it from your Settings page. Upon termination, your personal data will be deleted in accordance with our Privacy Policy.

**By Us**
We reserve the right to suspend or terminate your account immediately, without prior notice, if:
• You violate these Terms, particularly the Prohibited Use section
• We are required to do so by law
• We reasonably believe your actions harm other users or the platform

Upon termination by us for cause, you will not be entitled to a refund of any prepaid fees.

Sections of these Terms that by their nature should survive termination (including intellectual property, disclaimers, and governing law) shall continue to apply after termination.`,
  },
  {
    icon: RefreshCw,
    color: "bg-cyan-100 text-cyan-600",
    title: "11. Changes to These Terms",
    content: `We reserve the right to modify these Terms at any time. When we make material changes, we will:

• Update the "Last updated" date at the top of this page
• Notify registered users by email at least 14 days before changes take effect
• Display a prominent notice on the platform

Your continued use of AcademiQ after the effective date of any revised Terms constitutes your acceptance of those Terms. If you do not agree to the revised Terms, you must stop using the platform and delete your account.`,
  },
  {
    icon: Mail,
    color: "bg-pink-100 text-pink-500",
    title: "12. Contact Information",
    content: `If you have any questions about these Terms of Service, please contact us:

AcademiQ Technologies
Email: hello@academiq.app
Contact form: academiq.app/contact

For legal notices, please email hello@academiq.app with the subject line "Legal Notice".

We aim to respond to all enquiries within 5 business days.`,
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
          Please read these Terms carefully before using AcademiQ. By creating an account or using our platform, you agree to be bound by these Terms.
        </p>
      </section>

      {/* Summary cards */}
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Scale, color: "bg-violet-100 text-violet-600", title: "Nigerian law governs", desc: "These Terms are governed by the laws of the Federal Republic of Nigeria." },
            { icon: ShieldCheck, color: "bg-emerald-100 text-emerald-600", title: "Your content is yours", desc: "You retain full ownership of all content you create on AcademiQ." },
            { icon: AlertTriangle, color: "bg-amber-100 text-amber-600", title: "Use responsibly", desc: "You are responsible for ensuring your use complies with your institution's policies." },
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
          <h2 className="mt-4 text-2xl font-bold text-white">Questions about these Terms?</h2>
          <p className="mt-2 text-sm text-white/80">We're happy to clarify anything. Reach out and we'll respond within 5 business days.</p>
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
