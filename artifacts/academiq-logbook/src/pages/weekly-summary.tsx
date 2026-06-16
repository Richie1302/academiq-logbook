import { useState } from "react";
import { useListEntries, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy, Check, Download, Hash, FileText, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { exportSingleEntry } from "@/lib/pdf-export";

export default function WeeklySummary() {
  const [week, setWeek] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: allEntries } = useListEntries();
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });

  // Get unique weeks from entries
  const availableWeeks = [...new Set(
    allEntries?.filter(e => e.week).map(e => e.week) ?? []
  )].sort((a, b) => (a ?? 0) - (b ?? 0));

  // Entries for selected week
  const weekEntries = allEntries?.filter(e => e.week === parseInt(week, 10)) ?? [];

  const handleGenerate = async () => {
    if (!week || isNaN(parseInt(week, 10))) { toast.error("Please enter a week number"); return; }
    setLoading(true);
    setSummary(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error("Session expired"); return; }

      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/entries/weekly-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ week: parseInt(week, 10) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate summary");
      }

      const data = await res.json();
      setSummary(data.summary);
      setEntryCount(data.entryCount);
      toast.success(`Summary generated from ${data.entryCount} entries`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!summary || !week) return;
    // Create a fake entry object for the PDF export
    const fakeSummaryEntry = {
      id: 0,
      userId: "",
      date: new Date().toISOString().split("T")[0],
      rawActivity: `Weekly Summary — Week ${week}`,
      rewrittenEntry: summary,
      week: parseInt(week, 10),
      dayOfWeek: `Week ${week} Summary`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exportSingleEntry(fakeSummaryEntry, profile);
    localStorage.setItem("academiq_has_exported", "true");
    toast.success("Summary exported as PDF");
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-serif tracking-tight">Weekly Summary</h1>
        <p className="text-muted-foreground">Generate a polished summary of any week's entries in one click.</p>
      </div>

      {/* Week selector */}
      <Card className="border-muted/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Choose a week</CardTitle>
          <CardDescription>Enter a week number or pick from your logged weeks below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="week" className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" /> Week Number
              </Label>
              <Input
                id="week"
                type="number"
                min="1"
                placeholder="e.g. 4"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="bg-card"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || !week}
              className="gap-2 px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating..." : "Generate summary"}
            </Button>
          </div>

          {/* Quick week chips */}
          {availableWeeks.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your logged weeks</p>
              <div className="flex flex-wrap gap-2">
                {availableWeeks.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeek(String(w))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      week === String(w)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-muted hover:border-primary/50 hover:text-primary text-muted-foreground"
                    }`}
                  >
                    Week {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview of week entries */}
          {week && weekEntries.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {weekEntries.length} {weekEntries.length === 1 ? "entry" : "entries"} in Week {week}
              </p>
              <div className="space-y-1.5">
                {weekEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 text-sm text-muted-foreground rounded-lg border bg-muted/10 px-3 py-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-foreground">{e.dayOfWeek || format(parseISO(e.date), "EEEE")}</span>
                    <span className="truncate">{(e.rewrittenEntry || e.rawActivity).substring(0, 60)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {week && weekEntries.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground italic">No entries found for Week {week}.</p>
          )}
        </CardContent>
      </Card>

      {/* Generated summary */}
      {summary && (
        <Card className="border-primary/20 shadow-md bg-card relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="border-b bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Week {week} Summary
                </CardTitle>
                <CardDescription>Generated from {entryCount} entries · Edit freely before saving.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" /> Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              className="min-h-[280px] font-serif text-base leading-loose border-0 focus-visible:ring-0 bg-transparent resize-none w-full p-6"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!summary && !loading && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-muted bg-muted/5">
          <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No summary yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Pick a week above and hit Generate to create your weekly summary.</p>
        </div>
      )}
    </div>
  );
}
