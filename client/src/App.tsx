import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { useAuth } from "./contexts/AuthContext";
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

// AuthCheck is a separate component that handles auth logic
function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    navigate("/login");
    return null;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route path="/">
          {() => (
            <AuthCheck>
              <Dashboard />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/pomodoro">
          {() => (
            <AuthCheck>
              <PomodoroPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/calendar">
          {() => (
            <AuthCheck>
              <CalendarPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/books">
          {() => (
            <AuthCheck>
              <BooksPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/statistics">
          {() => (
            <AuthCheck>
              <StatisticsPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/notes">
          {() => (
            <AuthCheck>
              <NotesPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/flashcards">
          {() => (
            <AuthCheck>
              <FlashcardsPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/community">
          {() => (
            <AuthCheck>
              <CommunityPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/profile">
          {() => (
            <AuthCheck>
              <ProfilePage />
            </AuthCheck>
          )}
        </Route>
        
        <Route path="/settings">
          {() => (
            <AuthCheck>
              <SettingsPage />
            </AuthCheck>
          )}
        </Route>
        
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
