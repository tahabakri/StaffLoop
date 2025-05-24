import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BellIcon, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// AuthContext type definition
// In a real app, this would be imported from a separate file
interface AuthUser {
  name: string;
  profileImage?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  logout: () => Promise<void>;
}

// Mock AuthContext for demonstration
// Replace this with your actual AuthContext implementation
const useAuth = (): AuthContextType => {
  return {
    user: { name: "Alex" },
    logout: async () => {
      // This would call your actual logout implementation
      localStorage.removeItem("authToken");
      console.log("User logged out");
    }
  };
};

// Navigation items
const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Events", path: "/events" },
  { name: "Staff", path: "/staff" },
  { name: "Reports", path: "/reports" },
  { name: "Tasks", path: "/tasks" },
  { name: "Settings", path: "/settings" },
];

// Sample notifications
const mockNotifications = [
  {
    id: "1",
    message: "New event created: Summer Festival",
    timestamp: "5 mins ago",
  },
  {
    id: "2",
    message: "Staff John Doe checked in",
    timestamp: "10 mins ago",
  },
  {
    id: "3",
    message: "5 staff members yet to check in",
    timestamp: "15 mins ago",
  },
];

// Helper function to get user initials
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Hardcoded notification count for demonstration
  const notificationCount = 3;

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear auth token from localStorage
      localStorage.removeItem("authToken");
      
      // Call the logout method from AuthContext
      await logout();
      
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">StaffLoop</span>
          </Link>

          {/* Navigation */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto w-full sm:w-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-base font-medium transition-colors hover:text-blue-500 ${
                  location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right-side items: Notifications and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-64 overflow-y-auto">
                  {mockNotifications.length > 0 ? (
                    mockNotifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="cursor-pointer p-3 hover:bg-gray-50">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{notification.message}</span>
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No new notifications</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-2 cursor-pointer text-blue-600 text-center justify-center">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 rounded-md hover:bg-gray-100 px-2 py-1 transition-colors"
                    aria-label="User profile menu"
                  >
                    <Avatar className="h-8 w-8">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-lg font-medium text-blue-600 hidden sm:inline-block">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white shadow-md rounded-md">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="h-4 w-4 mr-2" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/settings" className="flex items-center w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 