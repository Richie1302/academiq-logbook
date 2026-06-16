import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Home, PlusCircle, History, BookOpen, User, MessageCircle, FileText, Settings, Sparkles } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [location, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const mainNav = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/entry/new", label: "New Entry", icon: PlusCircle },
    { href: "/history", label: "History", icon: History },
  ];

  const aiNav = [
    { href: "/chat", label: "Ask AcademiQ", icon: MessageCircle },
    { href: "/summary", label: "Weekly Summary", icon: FileText },
  ];

  const accountNav = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const mobileNav = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/entry/new", label: "New Entry", icon: PlusCircle },
    { href: "/history", label: "History", icon: History },
    { href: "/chat", label: "Ask AI", icon: MessageCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-colors cursor-pointer ${
          isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        }`}>
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-xs md:text-sm">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile top header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>AcademiQ</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/50"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </header>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex md:w-64 border-r bg-card z-50 md:flex-col md:h-screen md:sticky md:top-0">
        <div className="flex items-center gap-2 p-6 text-primary font-bold text-2xl border-b">
          <BookOpen className="h-8 w-8" />
          <span>AcademiQ</span>
        </div>

        <div className="flex-1 flex flex-col p-3 gap-1 overflow-y-auto">
          <div className="mb-2">
            {mainNav.map(item => <NavItem key={item.href} {...item} />)}
          </div>

          <div className="pt-3 border-t">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> AI Tools
            </p>
            {aiNav.map(item => <NavItem key={item.href} {...item} />)}
          </div>

          <div className="pt-3 border-t">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5">Account</p>
            {accountNav.map(item => <NavItem key={item.href} {...item} />)}
          </div>
        </div>

        <div className="p-4 border-t">
          <Link href="/settings">
            <div className="flex items-center gap-3 mb-3 px-2 hover:bg-secondary/50 p-2 rounded-lg cursor-pointer transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm shrink-0">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-medium truncate">{user?.email?.split("@")[0] || "Student"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 w-full border-t bg-card z-50 flex flex-row md:hidden">
        <div className="flex flex-row w-full justify-around p-2">
          {mobileNav.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors cursor-pointer min-w-[56px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-20 md:pb-0 relative">
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
