import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { LogOut, Home, PlusCircle, History, BookOpen, User } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();

  const handleSignOut = () => {
    signOut(() => setLocation("/"));
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/entry/new", label: "New Entry", icon: PlusCircle },
    { href: "/history", label: "History", icon: History },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>AcademiQ</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/50"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </header>

      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full md:relative md:w-64 border-t md:border-t-0 md:border-r bg-card z-50 flex flex-row md:flex-col md:h-screen">
        <div className="hidden md:flex items-center gap-2 p-6 text-primary font-bold text-2xl border-b">
          <BookOpen className="h-8 w-8" />
          <span>AcademiQ</span>
        </div>

        <div className="flex-1 flex flex-row md:flex-col w-full justify-around md:justify-start p-2 md:p-4 gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 md:h-5 md:w-5" />
                  <span className="text-xs md:text-base">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block p-4 border-t">
          <Link href="/settings">
            <div className="flex items-center gap-3 mb-4 px-2 hover:bg-secondary/50 p-2 rounded-lg cursor-pointer transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm shrink-0">
                {user?.firstName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-medium truncate">{user?.firstName || "Student"}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-20 md:pb-0 relative">
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
