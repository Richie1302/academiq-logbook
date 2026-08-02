import { useState } from "react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle2, ChevronRight, CalendarDays, Building2, User2, ListChecks, AlignLeft, Lightbulb } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { getListEntriesQueryKey, getGetEntryStatsQueryKey, getGetRecentEntriesQueryKey } from "@workspace/api-client-react";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

interface GeneratedEntry {
  id: number;
  date: string;
  dayOfWeek: string | null;
  week: number | null;
  rewrittenEntry: string | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function BulkGenerate() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });
  const queryClient = useQueryClient();

  const [startWeek, setStartWeek] = useState("1");
  const [numWeeks, setNumWeeks] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [company, setCompany] = useState(profile?.siwesCompany ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [supervisor, setSupervisor] = useState("");
  const [activities, setActivities] = useState("");
  const [format, setFormat] = useState<"standard" | "structured">("standard");

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [generatedEntries, setGeneratedEntries] = useState<GeneratedEntry[]>([]);
  const [done, setDone] = useState(false);

  const totalWeeksNum = Math.min(Math.max(parseInt(numWeeks, 10) || 1, 1), 24);
  const estimatedSeconds = totalWeeksNum * 8;

  const handleGenerate = async () => {
    if (!startDate) { toast.error("Please select a training start date."); return; }
    if (!activities.trim()) { toast.error("Please describe your general activities."); return; }

    setLoading(true);
    setDone(false);
    setGeneratedEntries([]);
    setProgressMsg(`Generating ${totalWeeksNum} week${totalWeeksNum > 1 ? "s" : ""} of entries… this may take ~${estimatedSeconds}s`);

    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/api/entries/bulk-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          startWeek: parseInt(startWeek, 10),
          numWeeks: totalWeeksNum,
          startDate,
          company: company || profile?.siwesCompany || "",
          department: department || profile?.department || "",
          supervisor,
          activities,
          format,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Generation failed. Please try again.");
      }

      const data = await res.json();
      setGeneratedEntries(data.entries ?? []);
      setDone(true);
      setProgressMsg("");

      // Invalidate queries so History page refreshes
      queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetEntryStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });

      toast.success(`${data.totalGenerated} entries generated and saved!`);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong.");
      setProgressMsg("");
    } finally {
      setLoading(false);
    }
  };

  // Group entries by week for display
  const byWeek: Record<number, GeneratedEntry[]> = {};
  for (const e of generatedEntries) {
    const w = e.week ?? 0;
    if (!byWeek[w]) byWeek[w] = [];
    byWeek[w].push(e);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Bulk Generate Entries</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          AI writes realistic daily logbook entries for multiple weeks from your brief description.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2 space-y-5">
          {/* Week range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startWeek">Starting Week Number</Label>
              <Input
                id="startWeek"
                type="number"
                min={1}
                max={52}
                value={startWeek}
                onChange={e => setStartWeek(e.target.value)}
                placeholder="e.g. 1"
              />
              <p className="text-xs text-muted-foreground">e.g. enter 9 to start from Week 9</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numWeeks">Number of Weeks to Generate</Label>
              <Input
                id="numWeeks"
                type="number"
                min={1}
                max={24}
                value={numWeeks}
                onChange={e => setNumWeeks(e.target.value)}
                placeholder="e.g. 4"
              />
              <p className="text-xs text-muted-foreground">Enter 1 for one week, or more for a range</p>
            </div>
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Training Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">The Monday of your first SIWES week</p>
          </div>

          {/* Company & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company" className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                Company / Organisation
              </Label>
              <Input
                id="company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder={profile?.siwesCompany || "e.g. MTN Nigeria"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department / Unit</Label>
              <Input
                id="department"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder={profile?.department || "e.g. IT Department"}
              />
            </div>
          </div>

          {/* Supervisor */}
          <div className="space-y-1.5">
            <Label htmlFor="supervisor" className="flex items-center gap-1.5">
              <User2 className="h-4 w-4" />
              Supervisor's Name
            </Label>
            <Input
              id="supervisor"
              value={supervisor}
              onChange={e => setSupervisor(e.target.value)}
              placeholder="e.g. Mr. Femi Adeyemi"
            />
          </div>

          {/* Activities */}
          <div className="space-y-1.5">
            <Label htmlFor="activities">General Activities Description</Label>
            <Textarea
              id="activities"
              value={activities}
              onChange={e => setActivities(e.target.value)}
              rows={4}
              placeholder="Describe your overall SIWES activities. e.g. I worked on network configuration, attended team meetings, fixed software bugs, helped document APIs, shadowed senior engineers..."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">AI will create unique, varied entries for each day based on this</p>
          </div>

          {/* Format toggle */}
          <div className="space-y-2">
            <Label>Logbook Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("standard")}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  format === "standard"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 text-muted-foreground"
                }`}
              >
                <AlignLeft className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Standard</p>
                  <p className="text-xs mt-0.5 opacity-70">Short prose paragraph, 2–3 sentences per day</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormat("structured")}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  format === "structured"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 text-muted-foreground"
                }`}
              >
                <ListChecks className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Structured</p>
                  <p className="text-xs mt-0.5 opacity-70">Activities · Challenges · Solutions per day</p>
                </div>
              </button>
            </div>
          </div>

          {/* Generate button */}
          <Button
            id="bulk-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {totalWeeksNum} Week{totalWeeksNum > 1 ? "s" : ""} of Entries
              </>
            )}
          </Button>

          {/* Progress */}
          {loading && progressMsg && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {progressMsg}
            </div>
          )}

          {/* Success notice */}
          {done && !loading && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {generatedEntries.length} entries saved — visible in your History page.
            </div>
          )}
        </div>

        {/* Sidebar tips */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-primary">
                <Lightbulb className="h-4 w-4" />
                Tips for great results
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  "Mention specific tools or software you used",
                  "Include the type of work (e.g. networking, software dev, accounting)",
                  "Note meetings and team interactions",
                  "Mention documents you read or wrote",
                  "The more detail you give, the more realistic the entries",
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">How it works</p>
              {[
                "Fill in your details and activities",
                "AI generates realistic daily entries",
                "Entries are saved directly to History",
                "Edit any entry from the History page",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview of generated entries */}
      {done && generatedEntries.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Generated Entries Preview
          </h2>
          {Object.entries(byWeek)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([week, entries]) => (
              <div key={week}>
                <h3 className="text-sm font-bold text-primary mb-2">Week {week}</h3>
                <div className="grid gap-2">
                  {entries
                    .sort((a, b) => {
                      const ai = DAYS.indexOf(a.dayOfWeek ?? "");
                      const bi = DAYS.indexOf(b.dayOfWeek ?? "");
                      return ai - bi;
                    })
                    .map(entry => (
                      <Card key={entry.id} className="border-border/50">
                        <CardContent className="p-3 space-y-1">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {entry.dayOfWeek}, {entry.date}
                          </p>
                          <p className="text-sm whitespace-pre-line leading-relaxed">{entry.rewrittenEntry}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
