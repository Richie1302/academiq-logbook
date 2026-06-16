import { useMemo } from "react";
import { Flame, BookOpen, Star, Zap, Trophy, Target, Calendar, Award, CheckCircle2, Lock } from "lucide-react";

export interface Badge {
  id: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  earned: boolean;
  progress?: number; // 0–100
  progressLabel?: string;
}

interface Props {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalWeeks: number;
  hasExported: boolean;
  profileComplete: boolean;
}

export function useAchievementBadges({
  totalEntries,
  currentStreak,
  longestStreak,
  totalWeeks,
  hasExported,
  profileComplete,
}: Props): Badge[] {
  return useMemo(() => [
    {
      id: "first-entry",
      icon: BookOpen,
      label: "First Step",
      desc: "Write your very first logbook entry.",
      color: "text-violet-600",
      bg: "bg-violet-100",
      earned: totalEntries >= 1,
      progress: Math.min(100, totalEntries * 100),
      progressLabel: `${totalEntries}/1 entries`,
    },
    {
      id: "five-entries",
      icon: Zap,
      label: "Getting Going",
      desc: "Write 5 logbook entries.",
      color: "text-blue-600",
      bg: "bg-blue-100",
      earned: totalEntries >= 5,
      progress: Math.min(100, (totalEntries / 5) * 100),
      progressLabel: `${totalEntries}/5 entries`,
    },
    {
      id: "twenty-entries",
      icon: Target,
      label: "Consistent",
      desc: "Write 20 logbook entries.",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      earned: totalEntries >= 20,
      progress: Math.min(100, (totalEntries / 20) * 100),
      progressLabel: `${totalEntries}/20 entries`,
    },
    {
      id: "fifty-entries",
      icon: Star,
      label: "Dedicated",
      desc: "Write 50 logbook entries.",
      color: "text-amber-600",
      bg: "bg-amber-100",
      earned: totalEntries >= 50,
      progress: Math.min(100, (totalEntries / 50) * 100),
      progressLabel: `${totalEntries}/50 entries`,
    },
    {
      id: "streak-3",
      icon: Flame,
      label: "On Fire",
      desc: "Maintain a 3-day streak.",
      color: "text-orange-600",
      bg: "bg-orange-100",
      earned: currentStreak >= 3 || longestStreak >= 3,
      progress: Math.min(100, (Math.max(currentStreak, longestStreak) / 3) * 100),
      progressLabel: `${Math.max(currentStreak, longestStreak)}/3 days`,
    },
    {
      id: "streak-7",
      icon: Flame,
      label: "Week Warrior",
      desc: "Maintain a 7-day streak.",
      color: "text-red-600",
      bg: "bg-red-100",
      earned: currentStreak >= 7 || longestStreak >= 7,
      progress: Math.min(100, (Math.max(currentStreak, longestStreak) / 7) * 100),
      progressLabel: `${Math.max(currentStreak, longestStreak)}/7 days`,
    },
    {
      id: "streak-30",
      icon: Trophy,
      label: "Unstoppable",
      desc: "Maintain a 30-day streak.",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      earned: currentStreak >= 30 || longestStreak >= 30,
      progress: Math.min(100, (Math.max(currentStreak, longestStreak) / 30) * 100),
      progressLabel: `${Math.max(currentStreak, longestStreak)}/30 days`,
    },
    {
      id: "two-weeks",
      icon: Calendar,
      label: "Two Weeks In",
      desc: "Log entries across 2 weeks.",
      color: "text-teal-600",
      bg: "bg-teal-100",
      earned: totalWeeks >= 2,
      progress: Math.min(100, (totalWeeks / 2) * 100),
      progressLabel: `${totalWeeks}/2 weeks`,
    },
    {
      id: "exported",
      icon: Award,
      label: "PDF Pro",
      desc: "Export your logbook as a PDF.",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      earned: hasExported,
      progress: hasExported ? 100 : 0,
      progressLabel: hasExported ? "Done" : "Not yet",
    },
    {
      id: "profile-complete",
      icon: CheckCircle2,
      label: "Ready to Roll",
      desc: "Complete your profile — name, school, company, supervisor.",
      color: "text-pink-600",
      bg: "bg-pink-100",
      earned: profileComplete,
      progress: profileComplete ? 100 : 0,
      progressLabel: profileComplete ? "Done" : "Incomplete",
    },
  ], [totalEntries, currentStreak, longestStreak, totalWeeks, hasExported, profileComplete]);
}

export default function AchievementBadges({
  totalEntries,
  currentStreak,
  longestStreak,
  totalWeeks,
  hasExported,
  profileComplete,
}: Props) {
  const badges = useAchievementBadges({ totalEntries, currentStreak, longestStreak, totalWeeks, hasExported, profileComplete });
  const earned = badges.filter(b => b.earned).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted-foreground">{earned} of {badges.length} badges earned</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{earned}/{badges.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
              badge.earned
                ? "border-border bg-card shadow-sm"
                : "border-dashed border-muted bg-muted/20 opacity-60"
            }`}
          >
            {!badge.earned && (
              <Lock className="absolute top-2 right-2 h-3 w-3 text-muted-foreground/50" />
            )}
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${badge.earned ? badge.bg : "bg-muted"}`}>
              <badge.icon className={`h-6 w-6 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className={`text-xs font-bold leading-tight ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
                {badge.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{badge.desc}</p>
            </div>
            {!badge.earned && badge.progress !== undefined && badge.progress > 0 && (
              <div className="w-full">
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary/40 rounded-full transition-all" style={{ width: `${badge.progress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{badge.progressLabel}</p>
              </div>
            )}
            {badge.earned && (
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3" /> Earned
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
