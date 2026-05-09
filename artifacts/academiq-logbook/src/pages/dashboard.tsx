import { useGetEntryStats, useGetRecentEntries } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO, isSameDay, startOfWeek, addDays } from "date-fns";
import { CalendarDays, Flame, CheckCircle2, TrendingUp, Sparkles, Loader2, ArrowRight, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useDisplayName } from "@/hooks/useDisplayName";

export default function Dashboard() {
  const { user } = useUser();
  const displayName = useDisplayName();
  const { data: stats, isLoading: statsLoading } = useGetEntryStats();
  const { data: recentEntries, isLoading: entriesLoading } = useGetRecentEntries();

  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM do");

  const todayEntry = recentEntries?.find(e => e.date === format(today, "yyyy-MM-dd"));

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <Link href="/entry/new">
        <div className="fixed bottom-24 right-4 md:hidden z-40 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
          <Plus className="h-6 w-6" />
        </div>
      </Link>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">
          Hello, {displayName} 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Today is {formattedDate}. Let's make it count.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats?.totalEntries ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/10 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : `${stats?.currentStreak ?? 0} days`}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/10 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats?.entriesThisWeek ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/10 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : `${stats?.longestStreak ?? 0} days`}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Week Progress */}
      <section className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
            <CalendarDays className="h-5 w-5 text-primary" />
            Week Progress
          </h3>
          <p className="text-sm text-muted-foreground">Mon – Fri</p>
        </div>
        <div className="flex gap-3 sm:gap-6 w-full md:w-auto justify-between md:justify-start">
          {weekDays.map((day, i) => {
            const hasEntry = recentEntries?.some(e => e.date === format(day, "yyyy-MM-dd"));
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  hasEntry
                    ? "bg-green-500 border-green-500 text-white"
                    : isToday
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground bg-muted/20"
                }`}>
                  {hasEntry ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-medium">{format(day, "d")}</span>}
                </div>
                <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {format(day, "EEE")}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Today's Action */}
      <section>
        <Card className="border-2 shadow-sm relative overflow-hidden bg-card">
          {!todayEntry && (
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          )}
          <CardHeader>
            <CardTitle>{todayEntry ? "Today's Entry Completed" : "Ready for today?"}</CardTitle>
            <CardDescription>
              {todayEntry
                ? "You've successfully documented your activities for today."
                : "Take 2 minutes to jot down what you did. We'll handle the professional formatting."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayEntry ? (
              <div className="bg-muted/50 p-4 rounded-xl border border-muted text-sm leading-relaxed">
                {todayEntry.rewrittenEntry || todayEntry.rawActivity}
              </div>
            ) : (
              <Link href="/entry/new">
                <Button size="lg" className="w-full sm:w-auto group">
                  <Sparkles className="h-4 w-4 mr-2 text-primary-foreground group-hover:animate-pulse" />
                  Write New Entry
                  <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Entries */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
          <Link href="/history">
            <Button variant="link" className="text-muted-foreground hover:text-foreground px-0">
              View all
            </Button>
          </Link>
        </div>

        {entriesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : recentEntries && recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.slice(0, 5).map(entry => (
              <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow border-muted/60">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  <div className="shrink-0 flex flex-col items-center justify-center bg-secondary/30 rounded-lg p-2 min-w-[80px] border border-secondary/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase">{format(parseISO(entry.date), "MMM")}</span>
                    <span className="text-2xl font-bold text-foreground font-serif">{format(parseISO(entry.date), "dd")}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{entry.dayOfWeek || format(parseISO(entry.date), "EEEE")}</span>
                      {entry.week && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Week {entry.week}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {entry.rewrittenEntry || entry.rawActivity}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="h-20 w-20 bg-background rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-6 rotate-3">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2 font-serif">A Fresh Start</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                Your logbook is a blank canvas. Start documenting your SIWES journey today and watch your professional narrative unfold.
              </p>
              <Link href="/entry/new">
                <Button size="lg" className="rounded-full px-8 shadow-md hover:shadow-lg transition-all group">
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Write First Entry
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
