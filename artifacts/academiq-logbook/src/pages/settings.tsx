import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LogOut, Trash2, Bell, Lock, Download, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useListEntries, useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { exportEntriesToPDF } from "@/lib/pdf-export";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  // Notifications (stored in localStorage)
  const [notifDailyReminder, setNotifDailyReminder] = useState(() => localStorage.getItem("notif_daily") !== "false");
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(() => localStorage.getItem("notif_weekly") === "true");
  const [notifStreak, setNotifStreak] = useState(() => localStorage.getItem("notif_streak") !== "false");

  // Change password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const { data: allEntries } = useListEntries();
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
      await signOut();
      setLocation("/");
      toast.success("Account deleted successfully");
    } catch {
      toast.error("Failed to delete account. Please contact support.");
    }
  };

  const handleNotifToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
    toast.success(value ? "Notification enabled" : "Notification disabled");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }
    setIsChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleExportAll = async () => {
    if (!allEntries?.length) { toast.error("No entries to export"); return; }
    setIsExporting(true);
    try {
      exportEntriesToPDF(allEntries, profile, "academiq-full-logbook.pdf");
      toast.success(`Exported ${allEntries.length} entries as PDF`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-serif tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="space-y-5">

        {/* Account */}
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border">
              <div>
                <p className="font-medium">Email Address</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Password</CardTitle>
            <CardDescription>Update your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>Change</Button>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-muted/10 rounded-lg border">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={isChangingPw} size="sm">
                    {isChangingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
            <CardDescription>Choose what you want to be reminded about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "notif_daily", label: "Daily entry reminder", desc: "Get a nudge each day to write your logbook entry.", value: notifDailyReminder, setter: setNotifDailyReminder },
              { key: "notif_streak", label: "Streak alerts", desc: "Be notified when you're about to break your streak.", value: notifStreak, setter: setNotifStreak },
              { key: "notif_weekly", label: "Weekly summary", desc: "Receive a summary of your week every Friday.", value: notifWeeklySummary, setter: setNotifWeeklySummary },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border">
                <div>
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={n.value}
                  onCheckedChange={(v) => handleNotifToggle(n.key, v, n.setter)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Export Data */}
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Your Data</CardTitle>
            <CardDescription>Download everything — your full logbook as a PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/10 rounded-lg border gap-4">
              <div>
                <p className="font-medium">Full Logbook PDF</p>
                <p className="text-sm text-muted-foreground">
                  {allEntries?.length ? `${allEntries.length} entries ready to export.` : "No entries yet."}
                </p>
              </div>
              <Button variant="outline" onClick={handleExportAll} disabled={isExporting || !allEntries?.length} className="w-full sm:w-auto">
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session */}
        <Card className="border-muted/60 shadow-sm">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Sign out of your account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/10 rounded-lg border gap-4">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">You can sign back in at any time.</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/10 gap-4">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all your logbook entries. There is no way to recover this data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
