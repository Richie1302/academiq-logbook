import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useCreateEntry, useRewriteEntry, getGetRecentEntriesQueryKey, getGetEntryStatsQueryKey, getListEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Save, Loader2, Copy, Check, Calendar, Hash, RefreshCcw, AlignLeft, AlignJustify, Lightbulb, X } from "lucide-react";

type RewriteMode = "concise" | "detailed";

const TEMPLATES = [
  {
    label: "General Day",
    text: "I arrived at the office at [time]. My supervisor briefed me on [task]. I worked on [activity] using [tools/technology]. I encountered [challenge] and resolved it by [solution]. By end of day I had completed [outcome].",
  },
  {
    label: "Technical Task",
    text: "Today I was assigned to work on [technical task]. I used [tools/languages/frameworks] to [describe what you did]. I learned about [concept] and how it applies to [context]. The task took approximately [duration] to complete.",
  },
  {
    label: "Meeting / Training",
    text: "I attended a [meeting/training/workshop] on [topic]. The session was led by [person/department]. Key takeaways included [point 1], [point 2], and [point 3]. I will apply this knowledge to [upcoming task].",
  },
  {
    label: "Observation Day",
    text: "Today I shadowed [colleague/team] as they worked on [activity]. I observed [process/workflow] and took notes on [key observations]. I asked questions about [topic] and received useful guidance on [area].",
  },
  {
    label: "Report / Documentation",
    text: "I spent today working on documentation for [project/task]. I compiled [type of report] covering [areas]. I reviewed [materials] and ensured all sections were accurate and complete. The document was submitted to [supervisor/team].",
  },
];

const DRAFT_KEY = "academiq_entry_draft";

export default function NewEntry() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [week, setWeek] = useState("");
  const [rawActivity, setRawActivity] = useState("");
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>("concise");
  const [showTemplates, setShowTemplates] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const rewriteMutation = useRewriteEntry();
  const createMutation = useCreateEntry();

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.rawActivity?.trim()) {
          setHasDraft(true);
        }
      } catch {}
    }
  }, []);

  const loadDraft = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setRawActivity(draft.rawActivity || "");
        setDate(draft.date || format(new Date(), "yyyy-MM-dd"));
        setWeek(draft.week || "");
        setHasDraft(false);
        toast.success("Draft loaded");
      } catch {}
    }
  };

  const saveDraft = () => {
    if (!rawActivity.trim()) { toast.error("Nothing to save as draft"); return; }
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ rawActivity, date, week }));
    toast.success("Draft saved — you can come back to this later");
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  const applyTemplate = (text: string) => {
    setRawActivity(text);
    setShowTemplates(false);
    toast.success("Template applied — fill in the brackets");
  };

  const handleRewrite = (mode: RewriteMode = rewriteMode) => {
    if (!rawActivity.trim()) { toast.error("Please describe your activities first"); return; }
    rewriteMutation.mutate(
      { data: { rawActivity, date, week: week ? parseInt(week, 10) : null, mode } },
      {
        onSuccess: (res) => { setRewritten(res.rewrittenEntry); toast.success("Entry rewritten successfully"); },
        onError: () => { toast.error("Failed to rewrite. Please try again."); },
      }
    );
  };

  const handleSave = () => {
    if (!rawActivity.trim()) { toast.error("Activity cannot be empty"); return; }
    createMutation.mutate(
      {
        data: {
          date,
          rawActivity,
          rewrittenEntry: rewritten,
          week: week ? parseInt(week, 10) : null,
          dayOfWeek: format(new Date(date + "T12:00:00"), "EEEE"),
        }
      },
      {
        onSuccess: () => {
          toast.success("Entry saved to logbook");
          localStorage.removeItem(DRAFT_KEY);
          queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetEntryStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
          setLocation("/dashboard");
        },
        onError: () => { toast.error("Failed to save entry. Please try again."); },
      }
    );
  };

  const handleCopy = () => {
    if (!rewritten) return;
    navigator.clipboard.writeText(rewritten);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const charCount = rawActivity.length;
  const charColor = charCount > 800 ? "text-amber-500" : charCount > 500 ? "text-blue-500" : "text-muted-foreground";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-serif tracking-tight">New Logbook Entry</h1>
        <p className="text-muted-foreground">Document your daily SIWES activities.</p>
      </div>

      {/* Draft banner */}
      {hasDraft && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700 font-medium">You have an unsaved draft from your last session.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={loadDraft} className="border-amber-300 text-amber-700 hover:bg-amber-100">Load draft</Button>
            <Button size="sm" variant="ghost" onClick={clearDraft} className="text-amber-500"><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Date + Week */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" /> Date
          </Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-card" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="week" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Week Number <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input id="week" type="number" min="1" placeholder="e.g. 4" value={week} onChange={(e) => setWeek(e.target.value)} className="bg-card" />
        </div>
      </div>

      {/* Activity input card */}
      <Card className="shadow-sm border-muted/60 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">What did you do today?</CardTitle>
              <CardDescription>Write naturally — don't worry about grammar or sounding professional.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="shrink-0 gap-1.5"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Templates
            </Button>
          </div>

          {/* Template picker */}
          {showTemplates && (
            <div className="mt-3 pt-3 border-t grid gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t.text)}
                  className="text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{t.text.substring(0, 80)}...</p>
                </button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Textarea
            placeholder="e.g. Today I arrived at the office by 8am. My supervisor showed me how to use the server deployment tool. I helped configure a new router for the marketing department..."
            className="min-h-[200px] border-0 focus-visible:ring-0 rounded-none resize-none p-6 text-base leading-relaxed bg-transparent"
            value={rawActivity}
            onChange={(e) => setRawActivity(e.target.value)}
          />
        </CardContent>

        <CardFooter className="bg-muted/20 border-t p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <p className={`text-xs font-medium ${charColor}`}>{charCount} characters</p>
            {charCount > 30 && (
              <button
                onClick={saveDraft}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Save as draft
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center rounded-lg border border-muted overflow-hidden bg-background text-sm">
              <button
                type="button"
                onClick={() => setRewriteMode("concise")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors font-medium ${rewriteMode === "concise" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <AlignLeft className="h-3.5 w-3.5" /> Concise
              </button>
              <button
                type="button"
                onClick={() => setRewriteMode("detailed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors font-medium ${rewriteMode === "detailed" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <AlignJustify className="h-3.5 w-3.5" /> Detailed
              </button>
            </div>
            <Button
              onClick={() => handleRewrite(rewriteMode)}
              disabled={rewriteMutation.isPending || !rawActivity.trim()}
              className="shadow-sm group"
            >
              {rewriteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-primary-foreground group-hover:scale-110 transition-transform" />}
              {rewriteMutation.isPending ? "Rewriting..." : "Rewrite with AI"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* AI output */}
      {rewritten !== null && (
        <Card className="border-primary/20 shadow-md bg-card relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardHeader className="pb-3 border-b bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Professional Entry
                </CardTitle>
                <CardDescription>
                  {rewriteMode === "concise" ? "Concise mode · 2-3 sentences" : "Detailed mode · 4-6 sentences"} · Feel free to edit before saving.
                </CardDescription>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button variant="outline" size="sm" onClick={() => handleRewrite(rewriteMode)} className="gap-2" disabled={rewriteMutation.isPending}>
                  <RefreshCcw className={`h-4 w-4 ${rewriteMutation.isPending ? "animate-spin" : ""}`} /> Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {isCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              className="min-h-[150px] font-serif text-base leading-loose border-0 focus-visible:ring-0 bg-transparent resize-none w-full p-6"
              value={rewritten}
              onChange={(e) => setRewritten(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="order-3 sm:order-1">Cancel</Button>
        <Button variant="outline" onClick={handleSave} disabled={createMutation.isPending || !rawActivity.trim()} className="order-2">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Without AI
        </Button>
        <Button onClick={handleSave} disabled={createMutation.isPending || !rawActivity.trim()} className="gap-2 px-8 order-1 sm:order-3" size="lg">
          {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Entry
        </Button>
      </div>
    </div>
  );
}
