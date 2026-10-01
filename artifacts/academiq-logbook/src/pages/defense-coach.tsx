import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Award,
  Loader2,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api-config";

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

interface Question {
  id: string;
  topic: string;
  question: string;
  context: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Evaluation {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export default function DefenseCoach() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    setEvaluation(null);
    setUserAnswer("");
    setSessionCompleted(false);
    setScores([]);
    setCurrentIndex(0);

    try {
      const token = await getAuthToken();
      const res = await fetch(getApiUrl("/api/entries/defense-coach/questions"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = "Failed to fetch defense questions";
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errMsg = parsed.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      setQuestions(data.questions || []);
      toast.success("5 Tailored SIWES Defense Questions Generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to load defense coach. Ensure you have saved log entries.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please type or paste your oral answer first!");
      return;
    }

    const currentQ = questions[currentIndex];
    setIsEvaluating(true);

    try {
      const token = await getAuthToken();
      const res = await fetch(getApiUrl("/api/entries/defense-coach/evaluate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          question: currentQ.question,
          answer: userAnswer,
          topic: currentQ.topic,
        }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data: Evaluation = await res.json();
      setEvaluation(data);
      setScores((prev) => [...prev, data.score]);
      toast.success(`Scored ${data.score}/100!`);
    } catch (err: any) {
      toast.error("Failed to evaluate response.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setEvaluation(null);
    } else {
      setSessionCompleted(true);
    }
  };

  const currentQ = questions[currentIndex];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-serif tracking-tight">SIWES Defense Coach</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Simulate your final oral defense. AI tests you on your real logbook entries and grades your preparedness.
          </p>
        </div>
        <Button
          onClick={fetchQuestions}
          disabled={isLoadingQuestions}
          className="gap-2 shadow-sm shrink-0"
        >
          {isLoadingQuestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {questions.length > 0 ? "Generate New Mock Defense" : "Start Mock Defense Session"}
        </Button>
      </div>

      {/* Hero empty state */}
      {questions.length === 0 && !isLoadingQuestions && (
        <Card className="border-dashed p-8 text-center bg-muted/10">
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold">Ready for your Defense?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                External supervisors will challenge you on what you actually learned. The AI Examiner analyzes your saved SIWES logs to construct realistic viva questions.
              </p>
            </div>
            <Button onClick={fetchQuestions} className="gap-2 mt-2">
              <Sparkles className="h-4 w-4" /> Start Defense Simulation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoadingQuestions && (
        <Card className="p-12 text-center">
          <CardContent className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-base font-medium">Analyzing your logbook history...</p>
            <p className="text-xs text-muted-foreground">Constructing 5 custom oral examination questions from your entries.</p>
          </CardContent>
        </Card>
      )}

      {/* Session Active */}
      {questions.length > 0 && !sessionCompleted && currentQ && (
        <div className="grid gap-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="flex items-center gap-1.5 text-primary">
              <BookOpen className="h-4 w-4" /> Topic: {currentQ.topic}
            </span>
          </div>

          <Card className="shadow-md border-primary/20">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-start justify-between gap-3">
                <Badge variant={currentQ.difficulty === "Hard" ? "destructive" : "secondary"}>
                  {currentQ.difficulty} Difficulty
                </Badge>
                <span className="text-xs text-muted-foreground">Based on your saved entries</span>
              </div>
              <CardTitle className="text-xl mt-3 text-foreground leading-snug">
                "{currentQ.question}"
              </CardTitle>
              {currentQ.context && (
                <CardDescription className="text-xs italic mt-1">
                  Context: {currentQ.context}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <label className="text-sm font-semibold block text-slate-700">
                Your Answer (How would you defend this to an examiner?):
              </label>
              <Textarea
                placeholder="Explain clearly using technical terms, methodology, safety precautions, and your direct role..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="min-h-[140px] text-base leading-relaxed"
                disabled={isEvaluating}
              />

              {!evaluation && (
                <Button
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="w-full sm:w-auto gap-2"
                >
                  {isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Submit Answer for Examiner Grading
                </Button>
              )}

              {/* Evaluation Feedback */}
              {evaluation && (
                <div className="mt-6 rounded-xl border bg-card p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Examiner Rating</span>
                      <h4 className="text-2xl font-bold flex items-center gap-2">
                        {evaluation.score} / 100
                        <Badge className="text-sm font-semibold">{evaluation.verdict}</Badge>
                      </h4>
                    </div>
                    <Award className="h-10 w-10 text-amber-500" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> Strong Points
                      </h5>
                      <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                        {evaluation.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="h-4 w-4" /> Areas for Improvement
                      </h5>
                      <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                        {evaluation.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 border rounded-lg p-4">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Recommended Model Answer</h5>
                    <p className="text-sm text-slate-800 leading-relaxed font-serif italic">"{evaluation.modelAnswer}"</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleNextQuestion} className="gap-2">
                      Next Defense Question <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completed Summary */}
      {sessionCompleted && (
        <Card className="text-center p-8 bg-card shadow-lg border-primary/30">
          <CardContent className="flex flex-col items-center gap-4 py-4">
            <Award className="h-16 w-16 text-amber-500 animate-bounce" />
            <h2 className="text-3xl font-bold font-serif">Defense Simulation Complete!</h2>
            <p className="text-muted-foreground max-w-md">
              You answered all defense questions. Your overall Readiness Score is:
            </p>
            <div className="text-5xl font-extrabold text-primary my-2">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">
              {avgScore >= 75
                ? "🌟 Excellent! You demonstrated strong technical depth and clarity."
                : "💡 Good effort! Review your model answers to sharpen your defense delivery."}
            </p>
            <Button onClick={fetchQuestions} className="gap-2 mt-4">
              <RefreshCw className="h-4 w-4" /> Practice Another Round
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
