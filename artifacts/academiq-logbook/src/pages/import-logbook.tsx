import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListEntriesQueryKey, getGetEntryStatsQueryKey, getGetRecentEntriesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  ClipboardPaste,
  Loader2,
  FileText,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Save,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api-config";

interface ParsedEntry {
  week: number | null;
  date: string | null;
  dayOfWeek: string | null;
  content: string;
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Read a .txt file in the browser — no packages needed */
async function readTxtFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string ?? "");
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Best-effort plain-text extraction from a .docx file.
 * A .docx is a ZIP containing word/document.xml — we strip the XML tags to get raw text.
 */
async function readDocxFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const raw = e.target?.result as string ?? "";
      const text = raw
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/\s{2,}/g, "\n")
        .trim();
      resolve(text || raw.slice(0, 8000));
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}


export default function ImportLogbook() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"paste" | "upload">("paste");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[] | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(week) ? next.delete(week) : next.add(week);
      return next;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".txt") && !name.endsWith(".docx")) {
      toast.error("Only .txt and .docx files are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum 5MB.");
      return;
    }

    setFileName(file.name);
    setExtractedText(null);
    setParsedEntries(null);

    try {
      toast.info("Reading file...");
      const text = name.endsWith(".docx")
        ? await readDocxFile(file)
        : await readTxtFile(file);

      if (!text?.trim() || text.trim().length < 20) {
        toast.error("The file appears empty or unreadable. Try copying and pasting the text instead.");
        return;
      }

      setExtractedText(text);
      toast.success(`File read — ${text.length.toLocaleString()} characters. Click Parse to continue.`);
    } catch {
      toast.error("Could not read file. Try copying and pasting the text instead.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Parse raw text and automatically save to database + redirect to History */
  const handleParseAndSave = async (autoSave = true) => {
    const rawText = tab === "paste" ? pastedText : extractedText;
    if (!rawText?.trim()) {
      toast.error(tab === "paste" ? "Please paste your logbook text first." : "Please upload a file first.");
      return;
    }

    setIsParsing(true);
    setParsedEntries(null);

    try {
      const token = await getAuthToken();

      // Step 1: Parse text via AI
      const parseRes = await fetch(getApiUrl("/api/entries/import/parse"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: rawText }),
      });

      let parseData: any = {};
      const contentType = parseRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        parseData = await parseRes.json();
      } else {
        throw new Error(`Server returned status ${parseRes.status}. Please restart the API server.`);
      }

      if (!parseRes.ok) throw new Error(parseData.error || "Parsing failed.");

      const entries = parseData.entries;
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error("No entries could be extracted from your text.");
      }

      setParsedEntries(entries);

      // Auto-expand weeks
      const firstWeeks = new Set<number>();
      (entries as ParsedEntry[]).slice(0, 10).forEach(e => {
        if (e.week != null) firstWeeks.add(e.week);
      });
      setExpandedWeeks(firstWeeks.size ? firstWeeks : new Set([0]));

      if (!autoSave) {
        toast.success(`Found ${parseData.total} entries. Review below and click Save when ready.`);
        return;
      }

      // Step 2: Auto-save parsed entries directly to database
      toast.info(`Parsed ${parseData.total} entries. Saving to History...`);
      setIsSaving(true);

      const saveRes = await fetch(getApiUrl("/api/entries/import/save"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ entries }),
      });

      let saveData: any = {};
      const saveContentType = saveRes.headers.get("content-type") || "";
      if (saveContentType.includes("application/json")) {
        saveData = await saveRes.json();
      } else {
        throw new Error("Failed to save entries to database.");
      }

      if (!saveRes.ok) throw new Error(saveData.error || "Save failed.");

      // Invalidate all query keys
      await queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetEntryStatsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });
      await queryClient.refetchQueries();

      const skippedNote = saveData.skipped > 0 ? ` (${saveData.skipped} skipped — already existed)` : "";
      toast.success(`Successfully saved ${saveData.saved} entries to History!${skippedNote}`);

      // Redirect immediately to History
      setLocation("/history");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsParsing(false);
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!parsedEntries?.length) return;
    setIsSaving(true);

    try {
      const token = await getAuthToken();
      const res = await fetch(getApiUrl("/api/entries/import/save"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ entries: parsedEntries }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(`Server returned status ${res.status}. Please restart the API server.`);
      }

      if (!res.ok) throw new Error(data.error || "Save failed.");

      await queryClient.invalidateQueries({ queryKey: getListEntriesQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetEntryStatsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });
      await queryClient.refetchQueries();

      const skippedNote = data.skipped > 0 ? ` (${data.skipped} skipped — already existed)` : "";
      toast.success(`${data.saved} entries saved to your logbook!${skippedNote}`);
      setLocation("/history");
    } catch (err: any) {
      toast.error(err.message || "Failed to save entries.");
    } finally {
      setIsSaving(false);
    }
  };

  // Group by week for preview
  const byWeek: Record<number, ParsedEntry[]> = {};
  if (parsedEntries) {
    for (const entry of parsedEntries) {
      const w = entry.week ?? 0;
      if (!byWeek[w]) byWeek[w] = [];
      byWeek[w].push(entry);
    }
  }
  const weekNumbers = Object.keys(byWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold font-serif tracking-tight">Import Your Logbook</h1>
        </div>
        <p className="text-muted-foreground">
          Already wrote your SIWES logs somewhere else? Paste or upload and we'll sort everything into your account week by week.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 border w-fit">
        {([["paste", "Paste Text", ClipboardPaste], ["upload", "Upload File", FileUp]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setParsedEntries(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Paste tab */}
      {tab === "paste" && (
        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Paste your logbook text</CardTitle>
            <CardDescription>
              Copy everything from your Word doc, Google Doc, or notes and paste it here. Dates, week headers, messy formatting — all fine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`Week 1 — Monday, 15 January 2024\nToday I arrived at the company premises and was briefed by my supervisor on general rules and conduct...\n\nTuesday, 16 January 2024\nI was assigned to the IT department and introduced to the team. I observed how the help desk handles requests...`}
              value={pastedText}
              onChange={e => { setPastedText(e.target.value); setParsedEntries(null); }}
              className="min-h-[260px] font-mono text-sm resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{pastedText.length.toLocaleString()} characters</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleParseAndSave(false)} disabled={isParsing || isSaving || !pastedText.trim()}>
                  Preview Only
                </Button>
                <Button onClick={() => handleParseAndSave(true)} disabled={isParsing || isSaving || !pastedText.trim()} className="gap-2">
                  {isParsing || isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isParsing ? "Parsing AI..." : isSaving ? "Saving to History..." : "Import & Save to History"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload tab */}
      {tab === "upload" && (
        <Card className="border-muted/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload a file</CardTitle>
            <CardDescription>
              Supports .txt and .docx files. For PDFs — export to Word first, then upload here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-muted rounded-xl p-10 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">{fileName ?? "Click to choose a file"}</p>
                <p className="text-xs text-muted-foreground mt-1">.txt or .docx — max 5MB</p>
              </div>
              {extractedText && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {extractedText.length.toLocaleString()} characters extracted
                </span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".txt,.docx" className="hidden" onChange={handleFileSelect} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleParseAndSave(false)} disabled={isParsing || isSaving || !extractedText}>
                Preview Only
              </Button>
              <Button onClick={() => handleParseAndSave(true)} disabled={isParsing || isSaving || !extractedText} className="gap-2">
                {isParsing || isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isParsing ? "Parsing AI..." : isSaving ? "Saving to History..." : "Import & Save to History"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsing status */}
      {isParsing && (
        <div className="flex items-center gap-3 text-sm p-4 rounded-xl border bg-muted/20 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
          <div>
            <p className="font-medium text-foreground">Reading your logbook...</p>
            <p className="text-xs text-muted-foreground mt-0.5">AI is identifying entries, dates, and week numbers. Takes a few seconds.</p>
          </div>
        </div>
      )}

      {/* Preview section */}
      {parsedEntries && parsedEntries.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-emerald-50 border-emerald-200 px-5 py-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  {parsedEntries.length} entries across {weekNumbers.length} week{weekNumbers.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">Review below then save — duplicates are skipped automatically.</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save All to Logbook"}
            </Button>
          </div>

          {/* Week accordion */}
          <div className="space-y-2">
            {weekNumbers.map(week => (
              <div key={week} className="border rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleWeek(week)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-semibold">
                      {week === 0 ? "No week assigned" : `Week ${week}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {byWeek[week].length} {byWeek[week].length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                  {expandedWeeks.has(week)
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {expandedWeeks.has(week) && (
                  <div className="divide-y">
                    {byWeek[week].map((entry, i) => (
                      <div key={i} className="px-4 py-3 flex gap-3 items-start">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {entry.dayOfWeek && <span className="text-xs font-semibold">{entry.dayOfWeek}</span>}
                            {entry.date && <span className="text-xs text-muted-foreground">{entry.date}</span>}
                            {!entry.date && !entry.dayOfWeek && (
                              <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> No date detected
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{entry.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom save */}
          <div className="flex justify-end pt-2 border-t">
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2 px-8">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : `Save ${parsedEntries.length} Entries to Logbook`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
