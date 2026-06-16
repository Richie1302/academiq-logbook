import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, ChevronRight, ChevronLeft, GraduationCap, Building2, User as UserIcon, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const INDUSTRIES = [
  "Software Engineering", "Electrical Engineering", "Mechanical Engineering",
  "Civil Engineering", "Computer Science", "Cybersecurity", "Business Administration",
  "Accounting", "Pharmacy", "Health Sciences", "Agriculture", "Architecture", "Other",
];

const STEPS = [
  { id: 1, title: "Personal Info", icon: UserIcon },
  { id: 2, title: "Academic Details", icon: GraduationCap },
  { id: 3, title: "SIWES Placement", icon: Building2 },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    school: "",
    course: "",
    industry: "",
    department: "",
    siwesCompany: "",
    supervisorName: "",
    siwesDuration: "",
  });

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const validateStep = () => {
    if (step === 1 && !form.fullName.trim()) {
      toast.error("Please enter your full name"); return false;
    }
    if (step === 2 && (!form.school.trim() || !form.course.trim())) {
      toast.error("Please fill in your school and course"); return false;
    }
    if (step === 3 && !form.siwesCompany.trim()) {
      toast.error("Please enter your SIWES company"); return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsPending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error("Session expired. Please sign in again."); return; }

      const encodedDepartment = form.supervisorName
        ? `supervisor::${form.supervisorName}||${form.department}`
        : form.department;

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          school: form.school,
          course: `${form.course}${form.industry && form.industry !== form.course ? ` (${form.industry})` : ""}`,
          siwesCompany: form.siwesCompany,
          department: encodedDepartment,
          siwesDuration: form.siwesDuration,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save profile");
      }
      await queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      toast.success("Welcome to AcademiQ! Let's write your first entry.");
      setLocation("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const progress = ((step - 1) / STEPS.length) * 100;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="bg-primary/5 border-b px-8 pt-8 pb-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl mb-4">
            <BookOpen className="h-6 w-6" />
            <span>AcademiQ</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Set up your profile</h2>
          <p className="text-slate-500 text-sm mt-1">Step {step} of {STEPS.length} — {STEPS[step - 1].title}</p>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((step) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-3">
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > s.id ? "bg-primary text-white" :
                  step === s.id ? "border-2 border-primary text-primary bg-white" :
                  "bg-slate-100 text-slate-400"
                }`}>
                  {step > s.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                </div>
                <span className={`text-xs hidden sm:block ${step === s.id ? "text-primary font-medium" : "text-slate-400"}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="px-8 py-6 space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input id="fullName" value={form.fullName} onChange={handleChange("fullName")} placeholder="e.g. Ayodeji Caleb Ogundiran" autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={form.email} disabled className="bg-slate-50 text-slate-400" />
                <p className="text-xs text-muted-foreground">This is locked to your account email.</p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="school">University / School <span className="text-red-500">*</span></Label>
                <Input id="school" value={form.school} onChange={handleChange("school")} placeholder="e.g. Caleb University Lagos" autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course / Programme <span className="text-red-500">*</span></Label>
                <Input id="course" value={form.course} onChange={handleChange("course")} placeholder="e.g. Cybersecurity" />
              </div>
              <div className="space-y-2">
                <Label>Industry / Field</Label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, industry: ind }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.industry === ind
                          ? "bg-primary text-white border-primary"
                          : "border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="siwesCompany">Company / Organisation <span className="text-red-500">*</span></Label>
                <Input id="siwesCompany" value={form.siwesCompany} onChange={handleChange("siwesCompany")} placeholder="e.g. MEMCOL" autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department / Unit</Label>
                <Input id="department" value={form.department} onChange={handleChange("department")} placeholder="e.g. IT Department" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisorName">Supervisor Name</Label>
                <Input id="supervisorName" value={form.supervisorName} onChange={handleChange("supervisorName")} placeholder="e.g. Engr. Bola Adeyemi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siwesDuration">SIWES Duration</Label>
                <Input id="siwesDuration" value={form.siwesDuration} onChange={handleChange("siwesDuration")} placeholder="e.g. 6 months" />
              </div>
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-8 pb-8 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < STEPS.length ? (
            <Button onClick={handleNext} className="flex-1">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {isPending ? "Setting up..." : "Go to Dashboard"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
