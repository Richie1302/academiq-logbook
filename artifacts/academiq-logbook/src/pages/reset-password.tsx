import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Supabase puts the session in the URL hash after redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      else setLocation("/sign-in");
    });
  }, []);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      setTimeout(() => setLocation("/dashboard"), 2500);
    }
    setLoading(false);
  };

  if (!validSession) return null;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl border border-slate-200">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-6 justify-center">
          <BookOpen className="h-7 w-7" />
          <span>AcademiQ</span>
        </div>

        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Password updated!</h2>
            <p className="text-slate-500 text-sm">Taking you to your dashboard...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-1 text-center">Set new password</h2>
            <p className="text-slate-500 text-center text-sm mb-6">Choose a strong password for your account.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  onKeyDown={e => e.key === "Enter" && handleReset()}
                />
              </div>
              <Button className="w-full" onClick={handleReset} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update password
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
