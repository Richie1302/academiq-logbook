import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type Step = "signup" | "verify";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignUp() {
  const [step, setStep] = useState<Step>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSignUp = async () => {
    if (!email || !password) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the 6-digit verification code!");
      setStep("verify");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!otp) { toast.error("Please enter the verification code."); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account verified! Welcome to AcademiQ!");
      setLocation("/dashboard");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error(error.message);
    else toast.success("New code sent to your email!");
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  if (step === "verify") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl border border-slate-200">
          <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-6 justify-center">
            <BookOpen className="h-7 w-7" /><span>AcademiQ</span>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center">
              <Mail className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1 text-center">Check your email</h2>
          <p className="text-slate-500 text-center mb-1 text-sm">We sent a 6-digit code to</p>
          <p className="text-indigo-600 font-semibold text-center mb-6 text-sm">{email}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp" type="text" inputMode="numeric" maxLength={8}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="00000000" className="text-center text-2xl font-bold tracking-widest"
                onKeyDown={e => e.key === "Enter" && handleVerify()}
              />
            </div>
            <Button className="w-full" onClick={handleVerify} disabled={loading || otp.length < 8}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify Account
            </Button>
          </div>
          <div className="text-center mt-6 space-y-2">
            <p className="text-slate-500 text-sm">
              Didn't receive it?{" "}
              <button onClick={handleResend} className="text-indigo-600 font-semibold hover:text-indigo-700">Resend code</button>
            </p>
            <p className="text-slate-400 text-sm">
              <button onClick={() => setStep("signup")} className="hover:text-slate-600">← Back to sign up</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl border border-slate-200">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-6 justify-center">
          <BookOpen className="h-7 w-7" /><span>AcademiQ</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 text-center">Create your account</h2>
        <p className="text-slate-500 text-center mb-6">Start writing professional logbook entries today</p>
        <Button variant="outline" className="w-full mb-4 flex items-center gap-2" onClick={handleGoogleSignIn} disabled={googleLoading}>
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSignUp()} />
          </div>
          <Button className="w-full" onClick={handleSignUp} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
