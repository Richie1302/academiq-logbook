import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Save, User as UserIcon, GraduationCap, Building2, CheckCircle2, Share2, Copy, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false, staleTime: 0 } });

  const [isSaving, setIsSaving] = useState(false);
  const [supervisorToken, setSupervisorToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    school: "",
    course: "",
    department: "",
    siwesCompany: "",
    supervisorName: "",
    siwesDuration: "",
  });

  useEffect(() => {
    if (profile) {
      // supervisorName is stored as a JSON prefix in department field: "supervisor::Name||department"
      // We parse it out cleanly
      let supervisorName = "";
      let department = profile.department || "";
      if (department.startsWith("supervisor::")) {
        const parts = department.replace("supervisor::", "").split("||");
        supervisorName = parts[0] || "";
        department = parts[1] || "";
      }
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || user?.email || "",
        school: profile.school || "",
        course: profile.course || "",
        department,
        siwesCompany: profile.siwesCompany || "",
        supervisorName,
        siwesDuration: profile.siwesDuration || "",
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user?.user_metadata?.full_name || "",
        email: prev.email || user?.email || "",
      }));
    }
  }, [profile, user]);

  // Completion score
  const fields = [
    formData.fullName,
    formData.school,
    formData.course,
    formData.department,
    formData.siwesCompany,
    formData.supervisorName,
    formData.siwesDuration,
  ];
  const filled = fields.filter(Boolean).length;
  const completion = Math.round((filled / fields.length) * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error("Session expired."); return; }
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/profile/supervisor-token`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to generate token");
      const data = await res.json();
      setSupervisorToken(data.token);
      toast.success("Supervisor link generated");
    } catch {
      toast.error("Failed to generate link. Please try again.");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const supervisorLink = supervisorToken
    ? `${window.location.origin}/supervisor/${supervisorToken}`
    : null;

  const copyLink = () => {
    if (!supervisorLink) return;
    navigator.clipboard.writeText(supervisorLink);
    setCopiedLink(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error("Session expired."); return; }

      // Encode supervisorName into department field
      const encodedDepartment = formData.supervisorName
        ? `supervisor::${formData.supervisorName}||${formData.department}`
        : formData.department;

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          school: formData.school,
          course: formData.course,
          siwesCompany: formData.siwesCompany,
          department: encodedDepartment,
          siwesDuration: formData.siwesDuration,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Unknown server error" }));
        throw new Error(errData.error || `Server error ${response.status}`);
      }
      toast.success("Profile saved successfully");
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    } catch (err: any) {
      console.error("[PROFILE_SAVE_ERROR]", err?.message);
      toast.error(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-serif tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Keep this updated — it appears on your exported PDF logbook.</p>
      </div>

      {/* Profile card with avatar + completion */}
      <Card className="border-muted/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 border-b bg-muted/10 pb-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20 shrink-0">
            {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <UserIcon className="h-8 w-8" />}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate">{formData.fullName || user?.email?.split("@")[0] || "Student"}</CardTitle>
            <CardDescription className="truncate">{formData.email}</CardDescription>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={completion} className="h-1.5 flex-1" />
              <span className="text-xs font-medium text-muted-foreground shrink-0">{completion}% complete</span>
            </div>
            {completion === 100 && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3" /> Profile complete — your PDF will be fully detailed
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Ayodeji Caleb" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. caleb@example.com" disabled className="bg-muted/30 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Academic Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">University / School <span className="text-red-500">*</span></Label>
                <Input id="school" name="school" value={formData.school} onChange={handleChange} placeholder="e.g. Caleb University" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course / Programme <span className="text-red-500">*</span></Label>
                <Input id="course" name="course" value={formData.course} onChange={handleChange} placeholder="e.g. Cybersecurity" />
              </div>
            </div>
          </div>

          {/* SIWES Info */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">SIWES / Placement Details</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="siwesCompany">Company / Organisation <span className="text-red-500">*</span></Label>
                <Input id="siwesCompany" name="siwesCompany" value={formData.siwesCompany} onChange={handleChange} placeholder="e.g. MEMCOL (Momas Electricity Metering)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department / Unit</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. IT Department" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisorName">Supervisor Name</Label>
                <Input id="supervisorName" name="supervisorName" value={formData.supervisorName} onChange={handleChange} placeholder="e.g. Engr. Bola Adeyemi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siwesDuration">SIWES Duration</Label>
                <Input id="siwesDuration" name="siwesDuration" value={formData.siwesDuration} onChange={handleChange} placeholder="e.g. 6 months" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t">
            <p className="text-xs text-muted-foreground">Fields marked <span className="text-red-500">*</span> are required for your PDF export.</p>
            <Button onClick={handleSave} disabled={isSaving} className="px-8 w-full sm:w-auto">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Supervisor Share Card */}
      <Card className="border-muted/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-4 w-4 text-primary" /> Share with Supervisor
          </CardTitle>
          <CardDescription>
            Generate a read-only link to your logbook that your supervisor can view anytime — no login required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!supervisorLink ? (
            <Button variant="outline" onClick={generateToken} disabled={isGeneratingToken} className="gap-2">
              {isGeneratingToken ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              {isGeneratingToken ? "Generating..." : "Generate supervisor link"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-4 py-3">
                <p className="text-sm text-muted-foreground flex-1 truncate font-mono">{supervisorLink}</p>
                <Button size="sm" variant="ghost" onClick={copyLink} className="shrink-0 gap-1.5">
                  {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copiedLink ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">This link gives read-only access to your logbook.</p>
                <Button size="sm" variant="ghost" onClick={generateToken} disabled={isGeneratingToken} className="text-xs gap-1.5 text-muted-foreground shrink-0">
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
