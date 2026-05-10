import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import { useGetProfile, useUpsertProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, User as UserIcon } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });
  const upsertMutation = useUpsertProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    school: "",
    course: "",
    siwesCompany: "",
    department: "",
    siwesDuration: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || user?.email || "",
        school: profile.school || "",
        course: profile.course || "",
        siwesCompany: profile.siwesCompany || "",
        department: profile.department || "",
        siwesDuration: profile.siwesDuration || ""
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user?.user_metadata?.full_name || "",
        email: prev.email || user?.email || ""
      }));
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    upsertMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          toast.success("Profile saved");
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        },
        onError: () => {
          toast.error("Failed to save profile");
        }
      }
    );
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
      <div className="flex flex-col gap-1 text-center md:text-left">
        <h1 className="text-3xl font-bold font-serif tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Your SIWES information</p>
      </div>

      <Card className="border-muted/60 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-4 border-b bg-muted/10 pb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20 shrink-0">
            {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <UserIcon className="h-8 w-8" />}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-xl truncate">{formData.fullName || user?.email?.split("@")[0] || "Student"}</CardTitle>
            <CardDescription className="truncate">{formData.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input id="school" name="school" value={formData.school} onChange={handleChange} placeholder="e.g. University of Lagos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course/Programme</Label>
              <Input id="course" name="course" value={formData.course} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="siwesCompany">SIWES Company</Label>
              <Input id="siwesCompany" name="siwesCompany" value={formData.siwesCompany} onChange={handleChange} placeholder="e.g. MTN Nigeria" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department/Unit</Label>
              <Input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. IT Department" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siwesDuration">SIWES Duration</Label>
              <Input id="siwesDuration" name="siwesDuration" value={formData.siwesDuration} onChange={handleChange} placeholder="e.g. 6 months" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} disabled={upsertMutation.isPending} className="px-8 w-full sm:w-auto">
              {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
