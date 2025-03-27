import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "@/pages/dashboard/Dashboard";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import PomodoroPage from "@/pages/pomodoro/PomodoroPage";
import CalendarPage from "@/pages/calendar/CalendarPage";
import BooksPage from "@/pages/books/BooksPage";
import StatisticsPage from "@/pages/statistics/StatisticsPage";
import NotesPage from "@/pages/notes/NotesPage";
import FlashcardsPage from "@/pages/flashcards/FlashcardsPage";
import CommunityPage from "@/pages/community/CommunityPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import { Loader2 } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

// A wrapper that checks auth state
function ProtectedRoute(props: { component: React.ComponentType }) {
  const { component: Component } = props;
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!auth.user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

// Create public routes that don't require authentication
function PublicRoute(props: { component: React.ComponentType }) {
  const { component: Component } = props;
  return <Component />;
}

// Main App component
function AppContent() {
  return (
    <>
      <AnimatedBackground />
      <Switch>
        <Route path="/login">
          <PublicRoute component={Login} />
        </Route>

        <Route path="/register">
          <PublicRoute component={Register} />
        </Route>

        <Route path="/">
          <ProtectedRoute component={Dashboard} />
        </Route>

        <Route path="/pomodoro">
          <ProtectedRoute component={PomodoroPage} />
        </Route>

        <Route path="/calendar">
          <ProtectedRoute component={CalendarPage} />
        </Route>

        <Route path="/books">
          <ProtectedRoute component={BooksPage} />
        </Route>

        <Route path="/statistics">
          <ProtectedRoute component={StatisticsPage} />
        </Route>

        <Route path="/notes">
          <ProtectedRoute component={NotesPage} />
        </Route>

        <Route path="/flashcards">
          <ProtectedRoute component={FlashcardsPage} />
        </Route>

        <Route path="/community">
          <ProtectedRoute component={CommunityPage} />
        </Route>

        <Route path="/profile">
          <ProtectedRoute component={ProfilePage} />
        </Route>

        <Route path="/settings">
          <ProtectedRoute component={SettingsPage} />
        </Route>

        <Route>
          <NotFound />
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

// Wrap AppContent with our providers to ensure they're always present
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
