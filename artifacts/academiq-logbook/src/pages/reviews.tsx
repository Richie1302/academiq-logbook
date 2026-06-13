import { Link } from "wouter";
import { Box, ArrowRight, Star, ThumbsUp, Users, Award } from "lucide-react";

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

const reviews = [
  { name: "Chioma Okeke", school: "University of Lagos", course: "Computer Science", img: "/avatar-ngozi.jpg", rating: 5, date: "March 2024", review: "AcademiQ genuinely saved my SIWES period. I was struggling to write entries every day after long hours at the office. With AcademiQ, I just type a few sentences about what I did and it turns it into something my supervisor actually praised. I got commended for having one of the best logbooks in my set." },
  { name: "Ibrahim Yusuf", school: "ABU Zaria", course: "Electrical Engineering", img: "/avatar-chinedu.jpg", rating: 5, date: "April 2024", review: "As an engineering student, I was always worried about whether my entries were technical enough. AcademiQ understands the field and adds proper terminology without making things up. My supervisor was impressed and asked how I managed to write so consistently. Highly recommend!" },
  { name: "Aisha Bello", school: "OAU Ile-Ife", course: "Business Administration", img: "/avatar-aisha.jpg", rating: 5, date: "February 2024", review: "I didn't think an AI tool would work for business SIWES but I was wrong. AcademiQ adapted perfectly to my placement at a consulting firm. The entries were professional and structured just right. The PDF export is also beautiful — my supervisor commented on how neat it looked." },
  { name: "Tunde Adeyemi", school: "UNILAG", course: "Mechanical Engineering", img: "/avatar-femi.jpg", rating: 5, date: "May 2024", review: "I finished my SIWES with a complete logbook and zero stress. Before AcademiQ, I was the student who would try to fill in two weeks' worth of entries the night before submission. This tool changed everything for me. The streak feature kept me accountable every single day." },
  { name: "Ngozi Eze", school: "FUTO", course: "Information Technology", img: "/avatar-ngozi.jpg", rating: 5, date: "January 2024", review: "The AI is genuinely smart. It doesn't just rephrase what I write — it actually expands and enriches it with relevant details. I work in cybersecurity and it understood the technical context perfectly. Best tool for any IT student doing SIWES." },
  { name: "Emeka Nwosu", school: "Covenant University", course: "Software Engineering", img: "/avatar-chinedu.jpg", rating: 5, date: "June 2024", review: "Clean UI, fast AI, and the PDF export is 🔥. I've recommended AcademiQ to every student in my department. The pricing is fair and the free tier gives you more than enough to get started. This is exactly the kind of tool Nigerian students needed." },
  { name: "Fatima Aliyu", school: "BUK Kano", course: "Accounting", img: "/avatar-aisha.jpg", rating: 4, date: "March 2024", review: "Very good product. I used it throughout my 6-month SIWES placement and my logbook was always complete and professional. The only thing I'd love is a dark mode — but that's minor. The AI writing quality is top-notch and my supervisor had no complaints at all." },
  { name: "Segun Lawal", school: "LAUTECH", course: "Civil Engineering", img: "/avatar-femi.jpg", rating: 5, date: "April 2024", review: "My IT supervisor said my logbook was the most detailed and well-written he'd seen in years. That's entirely because of AcademiQ. The tool captured the technical nature of civil engineering site work perfectly. Worth every kobo — and the free plan got me through most of my placement." },
  { name: "Blessing Obi", school: "UNIBEN", course: "Pharmacy", img: "/avatar-ngozi.jpg", rating: 5, date: "February 2024", review: "I was skeptical at first — I thought it might sound robotic or generic. But the AI actually sounds natural and professional. It writes like someone who understands what pharmacy students do during industrial training. My entries were always detailed and my supervisor approved every single one." },
];

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < n ? "fill-current" : "text-slate-200 fill-current"}`} />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <main className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700">
          STUDENT REVIEWS
        </span>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          Loved by students <span className="bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">across Nigeria</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Real reviews from real SIWES students. No paid testimonials, no fake stars.
        </p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {[
            { icon: Users, val: "10,000+", label: "Active students", color: "text-violet-600" },
            { icon: Star, val: "4.9 / 5", label: "Average rating", color: "text-amber-500" },
            { icon: ThumbsUp, val: "98%", label: "Would recommend", color: "text-emerald-600" },
            { icon: Award, val: "1,200+", label: "Verified reviews", color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-slate-50 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black">{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Review grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <div key={r.name} className="mb-5 break-inside-avoid rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <StarRating n={r.rating} />
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{r.review}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={r.img} alt={r.name} className="h-10 w-10 rounded-full border border-slate-100 object-cover shadow-sm" />
                <div>
                  <p className="text-sm font-bold">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.course} · {r.school}</p>
                </div>
                <span className="ml-auto text-[10px] text-muted-foreground">{r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 p-10 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white">Join 10,000+ satisfied students</h2>
          <p className="mt-2 text-sm text-white/80">Start free. No credit card needed.</p>
          <Link href="/sign-up">
            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg">
              Get started free <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
