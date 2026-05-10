import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useUpsertProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { mutateAsync: upsertProfile, isPending } = useUpsertProfile();

  const [form, setForm] = useState({
    fullName: user?.user_metadata?.full_name ?? "",
    email: user?.email ?? "",
    school: "",
    course: "",
    department: "",
    siwesCompany: "",
    siwesDuration: "",
  });

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.school || !form.course || !form.siwesCompany) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      await upsertProfile({ body: form });
      toast.success("Profile set up successfully!");
      setLocation("/dashboard");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-8">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl border border-slate-200">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-2 justify-center">
          <BookOpen className="h-7 w-7" />
          <span>AcademiQ</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 text-center">Set up your profile</h2>
        <p className="text-slate-500 text-center mb-6 text-sm">This helps personalise your logbook entries. You can update these later.</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input id="fullName" value={form.fullName} onChange={handleChange("fullName")} placeholder="e.g. Ayodeji Caleb" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={form.email} disabled className="bg-slate-50 text-slate-400" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">University / School <span className="text-red-500">*</span></Label>
            <Input id="school" value={form.school} onChange={handleChange("school")} placeholder="e.g. Caleb University" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
              <Input id="course" value={form.course} onChange={handleChange("course")} placeholder="e.g. Cybersecurity" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={form.department} onChange={handleChange("department")} placeholder="e.g. Computing" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siwesCompany">SIWES Company <span className="text-red-500">*</span></Label>
            <Input id="siwesCompany" value={form.siwesCompany} onChange={handleChange("siwesCompany")} placeholder="e.g. Momas Electricity Metering" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siwesDuration">SIWES Duration</Label>
            <Input id="siwesDuration" value={form.siwesDuration} onChange={handleChange("siwesDuration")} placeholder="e.g. 6 months" />
          </div>

          <Button className="w-full mt-2" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
