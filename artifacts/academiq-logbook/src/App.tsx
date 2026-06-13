import { Component, type ReactNode } from "react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";

// Configure API client
setBaseUrl(import.meta.env.VITE_API_URL ?? "");
setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import HowItWorks from "@/pages/how-it-works";
import Features from "@/pages/features";
import Reviews from "@/pages/reviews";
import Resources from "@/pages/resources";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Dashboard from "@/pages/dashboard";
import NewEntry from "@/pages/new-entry";
import History from "@/pages/history";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import Onboarding from "@/pages/onboarding";
import { AppLayout } from "@/components/layout";
import { useGetProfile } from "@workspace/api-client-react";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", color: "red" }}>
          <h2>App Error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{(this.state.error as Error).message}</pre>
          <pre style={{ whiteSpace: "pre-wrap" }}>{(this.state.error as Error).stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ component: Component, skipOnboarding }: { component: React.ComponentType<any>; skipOnboarding?: boolean }) {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading, isError: profileError } = useGetProfile({ query: { retry: false, enabled: !!user } });
  if (loading || (!!user && profileLoading)) return null;
  if (!user) return <Redirect to="/" />;
  // Redirect to onboarding if: no profile (404) OR profile exists but has no meaningful data
  const profileIsEmpty = !profile || (!profile.fullName && !profile.school && !profile.course);
  if (!skipOnboarding && !profileLoading && profileIsEmpty) return <Redirect to="/onboarding" />;
  return <AppLayout><Component /></AppLayout>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Redirect to="/dashboard" />;
  return <Landing />;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/features" component={Features} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/resources" component={Resources} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/entry/new">{() => <ProtectedRoute component={NewEntry} />}</Route>
      <Route path="/history">{() => <ProtectedRoute component={History} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
      <Route path="/settings">{() => <ProtectedRoute component={Settings} />}</Route>
      <Route path="/onboarding">{() => {
        const { user, loading } = useAuth();
        if (loading) return null;
        if (!user) return <Redirect to="/" />;
        return <Onboarding />;
      }}</Route>
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter>
              <AppRoutes />
            </WouterRouter>
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
