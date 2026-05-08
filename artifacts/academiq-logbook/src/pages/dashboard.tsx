import { useGetEntryStats, useGetRecentEntries } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { CalendarDays, Flame, CheckCircle2, TrendingUp, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useUser();
  const { data: stats, isLoading: statsLoading } = useGetEntryStats();
  const { data: recentEntries, isLoading: entriesLoading } = useGetRecentEntries();

  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM do");

  const todayEntry = recentEntries?.find(e => e.date === format(today, "yyyy-MM-dd"));

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">
          Hello, {user?.firstName || "Student"}
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
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats?.totalEntries || 0}
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
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : `${stats?.currentStreak || 0} days`}
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
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : stats?.entriesThisWeek || 0}
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
              {statsLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : `${stats?.longestStreak || 0} days`}
            </div>
          </CardContent>
        </Card>
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
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <CalendarDays className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground">No recent entries</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't written anything in the past 7 days.</p>
            <Link href="/entry/new">
              <Button variant="outline">Create your first entry</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
