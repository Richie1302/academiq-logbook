import { useState, useCallback } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface QualityScore {
  overall: number;
  clarity: number;
  detail: number;
  professionalism: number;
  relevance: number;
  feedback: string;
  suggestions: string[];
}

interface Props {
  entryText: string;
  compact?: boolean;
}

async function scoreEntry(text: string): Promise<QualityScore> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Session expired");

  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/api/entries/quality-score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ entryText: text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  return response.json();
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-xs font-bold w-6 text-right">{score}</span>
    </div>
  );
}

export default function EntryQualityScore({ entryText, compact = false }: Props) {
  const [score, setScore] = useState<QualityScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleScore = useCallback(async () => {
    if (!entryText?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await scoreEntry(entryText);
      setScore(result);
      setExpanded(true);
    } catch {
      setError("Couldn't score this entry. Try again.");
    } finally {
      setLoading(false);
    }
  }, [entryText]);

  const overallColor = score
    ? score.overall >= 8 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : score.overall >= 6 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200"
    : "";

  if (compact && !score) {
    return (
      <Button variant="ghost" size="sm" onClick={handleScore} disabled={loading || !entryText?.trim()} className="gap-1.5 text-muted-foreground hover:text-foreground">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? "Scoring..." : "Score quality"}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-muted/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Entry Quality Score</span>
          {score && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${overallColor}`}>
              {score.overall}/10
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!score && (
            <Button size="sm" variant="outline" onClick={handleScore} disabled={loading || !entryText?.trim()} className="gap-1.5 h-7 text-xs">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {loading ? "Analysing..." : "Analyse entry"}
            </Button>
          )}
          {score && (
            <>
              <Button size="sm" variant="ghost" onClick={handleScore} disabled={loading} className="h-7 text-xs text-muted-foreground">
                Rescore
              </Button>
              <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500 px-4 py-3">{error}</p>}

      {score && expanded && (
        <div className="px-4 py-4 space-y-4">
          <div className="space-y-2.5">
            <ScoreBar label="Clarity" score={score.clarity} />
            <ScoreBar label="Detail" score={score.detail} />
            <ScoreBar label="Professionalism" score={score.professionalism} />
            <ScoreBar label="Relevance" score={score.relevance} />
          </div>
          <div className="rounded-lg bg-muted/30 px-4 py-3 border border-muted/50">
            <p className="text-sm text-foreground/80 leading-relaxed">{score.feedback}</p>
          </div>
          {score.suggestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Suggestions</p>
              <ul className="space-y-1.5">
                {score.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5 shrink-0">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
