import { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart,
  Settings,
  CreditCard,
  HelpCircle,
  Bell,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  matchSubRoutes?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Staff", path: "/staff" },
  { icon: Calendar, label: "Events", path: "/events", matchSubRoutes: true },
  { icon: ClipboardList, label: "Templates", path: "/messages" },
  { icon: BarChart, label: "Reports", path: "/reports" },
];

const settingsNavItems: NavItem[] = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

export function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showChecklist, setShowChecklist] = useState(
    location.pathname === "/dashboard"
  );

  // Helper function to check if a path is active, considering sub-routes
  const isPathActive = (path: string, matchSubRoutes?: boolean) => {
    if (matchSubRoutes) {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show checklist only on dashboard
    setShowChecklist(location.pathname === "/dashboard");
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Blur effect when modal is open
  const blurClass = showChecklist ? "filter blur-sm pointer-events-none select-none" : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-30">
          <nav className="flex-1 py-8 px-4 flex flex-col gap-8 overflow-y-auto">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-2">Main</div>
              <ul className="space-y-1">
                {mainNavItems.map((item) => (
                  <SidebarNavItem
                    key={item.path}
                    {...item}
                    isActive={isPathActive(item.path, item.matchSubRoutes)}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-2">Settings</div>
              <ul className="space-y-1">
                {settingsNavItems.map((item) => (
                  <SidebarNavItem
                    key={item.path}
                    {...item}
                    isActive={isPathActive(item.path, item.matchSubRoutes)}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </ul>
            </div>
          </nav>
        </aside>
        {/* Main Content Area - Make it properly scrollable */}
        <main className={cn("flex-1 ml-64 p-8 pt-24 transition-all duration-300 overflow-y-auto min-h-[calc(100vh-4rem)]", blurClass)}>
          <div className="w-full pb-12"> {/* Container for page content */}
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </main>
        {/* Modal overlay for Welcome Modal */}
        {showChecklist && location.pathname === "/dashboard" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <WelcomeModal onDismiss={() => setShowChecklist(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarNavItem({ icon: Icon, label, path, isActive, onClick, matchSubRoutes }: NavItem & { isActive: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "flex items-center w-full px-4 py-2 rounded-lg transition-colors group",
          isActive
            ? "bg-blue-50 text-primary font-bold shadow-sm"
            : "text-gray-700 hover:bg-gray-100 hover:text-primary"
        )}
      >
        <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-primary" : "text-gray-400 group-hover:text-primary")}/>
        <span>{label}</span>
      </button>
    </li>
  );
}
