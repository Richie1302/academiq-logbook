import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, PenLine, Sparkles, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 md:p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-primary font-bold text-xl md:text-2xl">
          <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
          <span>AcademiQ Logbook</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="px-4 py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered SIWES Assistant</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 font-serif">
            Your SIWES logbook,<br className="hidden md:block" /> but effortless.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Turn your simple daily notes into polished, professional logbook entries. AcademiQ is the quiet but powerful study companion built for Nigerian university students on the go.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8">Start Writing Now</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8 sm:hidden">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="bg-secondary/30 py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <PenLine className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Write Naturally</h3>
                <p className="text-muted-foreground leading-relaxed">Just jot down what you did today in plain English. No need to stress over professional phrasing.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-sm border relative overflow-hidden">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
                <p className="text-muted-foreground leading-relaxed">Our AI transforms your casual notes into standard, professional SIWES logbook entries instantly.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground leading-relaxed">Keep your streak alive and monitor your weekly progress. Never fall behind on your logbook again.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} AcademiQ. Built for students.</p>
      </footer>
    </div>
  );
}
