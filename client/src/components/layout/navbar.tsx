import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon, Check, Clock, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock notification data
interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "New event created: Summer Festival",
    timestamp: "21 May 2025, 07:10 PM +04",
    read: false,
  },
  {
    id: "2",
    message: "Staff John Doe checked in",
    timestamp: "21 May 2025, 06:00 PM +04",
    read: false,
  },
  {
    id: "3",
    message: "5 staff members yet to check in",
    timestamp: "21 May 2025, 05:45 PM +04",
    read: false,
  },
];

export function Navbar() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Count unread notifications
  const notificationCount = notifications.filter(n => !n.read).length;

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  // Handle profile actions
  const handleProfileAction = (action: string) => {
    switch (action) {
      case "profile":
        window.location.href = "/profile";
        break;
      case "settings":
        window.location.href = "/settings";
        break;
      case "logout":
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
        // In a real app, this would call an actual logout function
        window.location.href = "/";
        break;
    }
  };

  return (
    <header className="bg-white shadow-sm h-16 fixed top-0 left-0 right-0 z-50">
      <div className="w-full h-full px-4 flex items-center justify-between">
        {/* Logo Area */}
        <a href="/dashboard" className="flex items-center">
          <Logo />
        </a>

        {/* Right Aligned Items (Notifications, Profile) */}
        <div className="flex items-center space-x-4">
          <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center relative"
                aria-label="View notifications"
              >
                <BellIcon className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <div className="flex items-center justify-between py-2 px-3 border-b">
                <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                {notificationCount > 0 && (
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <DropdownMenuGroup className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="cursor-default p-0">
                      <div className={`w-full p-3 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-6 w-6 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'} items-center justify-center`}>
                            {notification.read ? 
                              <Check className="h-3.5 w-3.5 text-gray-500" /> : 
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-6 px-4 text-center">
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center p-2">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all notifications
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center space-x-3 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="User profile menu"
                >
                  <Avatar className="w-10 h-10">
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm hidden md:block">
                    <div className="flex items-center">
                      <span className="font-medium">{user.name}</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                    <div className="text-gray-500">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleProfileAction("profile")}>
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProfileAction("settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProfileAction("logout")}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 