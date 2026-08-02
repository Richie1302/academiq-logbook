import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface GenericCheckResult {
  genericityScore: number;
  verdict: "Original" | "Slightly Generic" | "Very Generic" | "Copy-Paste Risk";
  flaggedPhrases: string[];
  suggestions: string[];
  summary: string;
}

interface Props {
  entryText: string;
}

async function checkGeneric(text: string): Promise<GenericCheckResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Session expired");

  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/api/entries/generic-check`, {
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

function VerdictBadge({ verdict, score }: { verdict: string; score: number }) {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    "Original": {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    "Slightly Generic": {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Info className="h-3.5 w-3.5" />,
    },
    "Very Generic": {
      color: "bg-orange-50 text-orange-700 border-orange-200",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    },
    "Copy-Paste Risk": {
      color: "bg-red-50 text-red-700 border-red-200",
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
    },
  };

  const c = config[verdict] ?? config["Slightly Generic"];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.color}`}>
      {c.icon}
      {verdict}
      <span className="opacity-60">·</span>
      <span className="font-bold">{score}%</span>
    </span>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const color = score <= 25
    ? "bg-emerald-500"
    : score <= 50
    ? "bg-amber-400"
    : score <= 75
    ? "bg-orange-500"
    : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-20 shrink-0">
        {score <= 25 ? "Authentic" : score <= 50 ? "Mostly original" : score <= 75 ? "Needs work" : "High risk"}
      </span>
    </div>
  );
}

export default function GenericityCheck({ entryText }: Props) {
  const [result, setResult] = useState<GenericCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const handleCheck = useCallback(async () => {
    if (!entryText?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await checkGeneric(entryText);
      setResult(data);
      setExpanded(true);
    } catch {
      setError("Couldn't check this entry. Try again.");
    } finally {
      setLoading(false);
    }
  }, [entryText]);

  return (
    <div className="rounded-xl border border-muted/60 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/10">
        <div className="flex items-center gap-2 flex-wrap">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">Authenticity Check</span>
          {result && (
            <VerdictBadge verdict={result.verdict} score={result.genericityScore} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {!result && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCheck}
              disabled={loading || !entryText?.trim()}
              className="gap-1.5 h-7 text-xs"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3" />}
              {loading ? "Checking..." : "Check entry"}
            </Button>
          )}
          {result && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCheck}
              disabled={loading}
              className="h-7 text-xs text-muted-foreground"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              Re-check
            </Button>
          )}
          {result && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground text-xs px-1"
            >
              {expanded ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-500 px-4 py-3">{error}</p>}

      {result && expanded && (
        <div className="px-4 py-4 space-y-4">
          {/* Score meter */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Generic language score</p>
            <ScoreMeter score={result.genericityScore} />
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/30 px-4 py-3 border border-muted/50">
            <p className="text-sm text-foreground/80 leading-relaxed">{result.summary}</p>
          </div>

          {/* Flagged phrases + suggestions */}
          {result.flaggedPhrases?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Flagged phrases & rewrites
              </p>
              <ul className="space-y-3">
                {result.flaggedPhrases.map((phrase, i) => (
                  <li key={i} className="rounded-lg border border-muted/60 overflow-hidden text-sm">
                    <div className="flex items-start gap-2 px-3 py-2 bg-red-50/60 dark:bg-red-950/20 border-b border-muted/40">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-foreground/80 italic">"{phrase}"</span>
                    </div>
                    {result.suggestions[i] && (
                      <div className="flex items-start gap-2 px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="text-foreground/80">{result.suggestions[i]}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.flaggedPhrases?.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              No generic phrases detected — your entry sounds authentic!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
