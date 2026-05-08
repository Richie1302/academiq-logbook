import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useCreateEntry, useRewriteEntry, getGetRecentEntriesQueryKey, getGetEntryStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Save, Loader2, Copy, Check, Calendar, Hash, Mic, RefreshCcw } from "lucide-react";

export default function NewEntry() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [week, setWeek] = useState("");
  const [rawActivity, setRawActivity] = useState("");
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const rewriteMutation = useRewriteEntry();
  const createMutation = useCreateEntry();

  const handleRewrite = () => {
    if (!rawActivity.trim()) {
      toast.error("Please describe your activities first");
      return;
    }

    rewriteMutation.mutate(
      { 
        data: { 
          rawActivity, 
          date,
          week: week ? parseInt(week, 10) : null 
        } 
      },
      {
        onSuccess: (res) => {
          setRewritten(res.rewrittenEntry);
          toast.success("Activity rewritten successfully!");
        },
        onError: () => {
          toast.error("Failed to rewrite activity. Please try again.");
        }
      }
    );
  };

  const handleSave = () => {
    if (!rawActivity.trim()) {
      toast.error("Activity cannot be empty");
      return;
    }

    createMutation.mutate(
      {
        data: {
          date,
          rawActivity,
          rewrittenEntry: rewritten,
          week: week ? parseInt(week, 10) : null,
          dayOfWeek: format(new Date(date), "EEEE")
        }
      },
      {
        onSuccess: () => {
          toast.success("Entry saved to logbook");
          queryClient.invalidateQueries({ queryKey: getGetRecentEntriesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetEntryStatsQueryKey() });
          setLocation("/dashboard");
        },
        onError: () => {
          toast.error("Failed to save entry");
        }
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-serif tracking-tight">New Logbook Entry</h1>
        <p className="text-muted-foreground">Document your daily SIWES activities.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date
          </Label>
          <Input 
            id="date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="bg-card"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="week" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Week Number <span className="text-muted-foreground font-normal">(Optional)</span>
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
      </div>

      <Card className="shadow-sm border-muted/60 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-lg">What did you do today?</CardTitle>
          <CardDescription>
            Write naturally. Don't worry about grammar or sounding professional.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Textarea 
            placeholder="e.g. Today I arrived at the office by 8am. My supervisor showed me how to use the server deployment tool. I helped configure a new router for the marketing department. Later in the afternoon I observed a database migration."
            className="min-h-[200px] border-0 focus-visible:ring-0 rounded-none resize-none p-6 text-base leading-relaxed bg-transparent"
            value={rawActivity}
            onChange={(e) => setRawActivity(e.target.value)}
          />
        </CardContent>
        <CardFooter className="bg-muted/20 border-t p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled title="Voice input coming soon">
              <Mic className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              {rawActivity.length} characters
            </p>
          </div>
          <Button 
            onClick={handleRewrite} 
            disabled={rewriteMutation.isPending || !rawActivity.trim()}
            className="shadow-sm group"
          >
            {rewriteMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2 text-primary-foreground group-hover:scale-110 transition-transform" />
            )}
            ✨ Rewrite with AI
          </Button>
        </CardFooter>
      </Card>

      {rewritten !== null && (
        <Card className="border-primary/20 shadow-md bg-card relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <CardHeader className="pb-3 border-b bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Professional Entry
                </CardTitle>
                <CardDescription>Ready for your logbook. Feel free to edit.</CardDescription>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRewrite}
                  className="gap-2"
                  disabled={rewriteMutation.isPending}
                >
                  <RefreshCcw className={`h-4 w-4 ${rewriteMutation.isPending ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {isCopied ? "Copied" : "Copy Text"}
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
        <Button 
          variant="outline"
          onClick={handleSave} 
          disabled={createMutation.isPending || !rawActivity.trim()}
          className="order-2 sm:order-2"
        >
          Save Without AI
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={createMutation.isPending || (!rawActivity.trim() && !rewritten)}
          className="gap-2 px-8 order-1 sm:order-3"
          size="lg"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Entry
        </Button>
      </div>
    </div>
  );
}
