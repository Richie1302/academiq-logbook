import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Bot, User, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "How do I write a good SIWES logbook entry?",
  "What should I do if I had a slow day with nothing significant?",
  "How do I describe a technical task I did as a non-technical student?",
  "What's the difference between a daily entry and a weekly summary?",
  "My supervisor keeps rejecting my entries. What am I doing wrong?",
  "How long should a SIWES logbook entry be?",
];

async function chat(messages: Message[]): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Session expired. Please sign in again.");

  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/api/entries/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Server error ${response.status}`);
  }

  const data = await response.json();
  return data.reply ?? "Sorry, I couldn't generate a response. Please try again.";
}

export default function AIChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await chat(updatedMessages);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setMessages(prev => prev.slice(0, -1)); // remove the user message on error
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100dvh-10rem)] md:h-[calc(100dvh-8rem)] gap-0 pb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Ask AcademiQ
          </h1>
          <p className="text-muted-foreground">Your AI guide for everything SIWES.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" /> New chat
          </Button>
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-muted/60 bg-card shadow-sm flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-9 w-9 text-primary" />
              </div>
              <h3 className="font-bold text-xl">How can I help you today?</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">Ask me anything about SIWES, logbook writing, or your industrial training.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left rounded-xl border border-muted px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
                  msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                }`}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-muted/40 text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}>
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 mt-3">
        <div className="flex gap-2 items-end rounded-2xl border border-muted/60 bg-card p-2 shadow-sm focus-within:border-primary/40 transition-colors">
          <Textarea
            ref={textareaRef}
            placeholder="Ask anything about SIWES..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none border-0 focus-visible:ring-0 bg-transparent min-h-[40px] max-h-[120px] py-2 px-2 text-sm"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            size="sm"
            className="shrink-0 rounded-xl h-9 w-9 p-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
