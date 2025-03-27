import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import {
  BarChart2,
  Clock,
  Calendar,
  BookOpen,
  TrendingUp,
  StickyNote,
  Layers,
  Users,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MobileLink = ({
  to,
  icon,
  children,
  isActive,
  onClick,
}: MobileLinkProps) => {
  return (
    <Link to={to} onClick={onClick}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "text-white bg-gradient-to-r from-green-600/40 to-green-600/10 border border-green-500/30"
            : "text-gray-300 hover:bg-gray-800/40 hover:text-green-400"
        )}
      >
        <span
          className={cn("mr-3", isActive ? "text-green-400" : "text-gray-400")}
        >
          {icon}
        </span>
        {children}
      </a>
    </Link>
  );
};

export default function MobileHeader() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <div className="relative z-10 flex flex-shrink-0 h-16 bg-gray-900/80 backdrop-blur-md border-b border-green-900/30 md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            className="px-4 text-gray-300 hover:text-green-400 transition-colors focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-64 bg-gray-900/90 backdrop-blur-md border-r border-green-900/30"
        >
          <div className="flex flex-col h-full">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4 mb-5">
                <svg
                  className="w-auto h-8 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.649 3.084A1 1 0 015.163 4.4 13.95 13.95 0 004 10c0 1.993.416 3.886 1.164 5.6a1 1 0 01-1.832.8A15.95 15.95 0 012 10c0-2.274.475-4.44 1.332-6.4a1 1 0 011.317-.516zM12.96 7a3 3 0 00-2.342 1.126l-.328.41-.111-.279A2 2 0 008.323 7H8a1 1 0 000 2h.323l.532 1.33-1.035 1.295a1 1 0 01-.781.375H7a1 1 0 100 2h.039a3 3 0 002.342-1.126l.328-.41.111.279A2 2 0 0011.677 14H12a1 1 0 100-2h-.323l-.532-1.33 1.035-1.295A1 1 0 0112.961 9H13a1 1 0 100-2h-.039zm1.874-2.6a1 1 0 011.833-.8A15.95 15.95 0 0118 10c0 2.274-.475 4.44-1.332 6.4a1 1 0 11-1.832-.8A13.949 13.949 0 0016 10c0-1.993-.416-3.886-1.165-5.6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h1 className="ml-2 text-xl font-bold text-white">
                  TaskTrackerPro
                </h1>
              </div>

              {/* Navigation */}
              <nav className="px-2 space-y-1">
                <MobileLink
                  to="/"
                  icon={<BarChart2 className="w-5 h-5" />}
                  isActive={location === "/"}
                  onClick={closeSheet}
                >
                  Dashboard
                </MobileLink>
                <MobileLink
                  to="/pomodoro"
                  icon={<Clock className="w-5 h-5" />}
                  isActive={location === "/pomodoro"}
                  onClick={closeSheet}
                >
                  Pomodoro Timer
                </MobileLink>
                <MobileLink
                  to="/calendar"
                  icon={<Calendar className="w-5 h-5" />}
                  isActive={location === "/calendar"}
                  onClick={closeSheet}
                >
                  Calendar
                </MobileLink>
                <MobileLink
                  to="/books"
                  icon={<BookOpen className="w-5 h-5" />}
                  isActive={location === "/books"}
                  onClick={closeSheet}
                >
                  Books & PDFs
                </MobileLink>
                <MobileLink
                  to="/statistics"
                  icon={<TrendingUp className="w-5 h-5" />}
                  isActive={location === "/statistics"}
                  onClick={closeSheet}
                >
                  Statistics
                </MobileLink>
                <MobileLink
                  to="/notes"
                  icon={<StickyNote className="w-5 h-5" />}
                  isActive={location === "/notes"}
                  onClick={closeSheet}
                >
                  Notes
                </MobileLink>
                <MobileLink
                  to="/flashcards"
                  icon={<Layers className="w-5 h-5" />}
                  isActive={location === "/flashcards"}
                  onClick={closeSheet}
                >
                  Flashcards
                </MobileLink>
                <MobileLink
                  to="/community"
                  icon={<Users className="w-5 h-5" />}
                  isActive={location === "/community"}
                  onClick={closeSheet}
                >
                  Community
                </MobileLink>
                <MobileLink
                  to="/profile"
                  icon={<User className="w-5 h-5" />}
                  isActive={location === "/profile"}
                  onClick={closeSheet}
                >
                  Profile
                </MobileLink>
                <MobileLink
                  to="/settings"
                  icon={<Settings className="w-5 h-5" />}
                  isActive={location === "/settings"}
                  onClick={closeSheet}
                >
                  Settings
                </MobileLink>
              </nav>
            </div>

            {/* User profile */}
            <div className="flex items-center px-4 py-3 border-t border-green-900/30">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-200">
                  {user?.username || "User"}
                </p>
                <p className="text-xs font-medium text-gray-400">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <button
                className="p-1 ml-auto text-gray-400 rounded-full hover:text-green-400 focus:outline-none transition-colors"
                onClick={() => {
                  logout();
                  closeSheet();
                }}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center justify-center flex-1">
        <h1 className="text-lg font-bold text-white">TaskTrackerPro</h1>
      </div>

      <div className="flex items-center px-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </div>
  );
}
