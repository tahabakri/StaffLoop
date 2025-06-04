import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  HelpCircle,
  LogOut,
  MessageSquare,
  BarChart,
  ClipboardList
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string, matchSubRoutes = false) => {
    if (matchSubRoutes) {
      return location.startsWith(path);
    }
    return location === path;
  };

  const navigation = [
    {
      label: "Main",
      items: [
        {
          icon: <Home className="h-5 w-5 mr-3" />,
          label: "Dashboard",
          path: "/",
          active: isActive("/"),
        },
        {
          icon: <Users className="h-5 w-5 mr-3" />,
          label: "Staff",
          path: "/staff",
          active: isActive("/staff"),
        },
        {
          icon: <Calendar className="h-5 w-5 mr-3" />,
          label: "Events",
          path: "/events",
          active: isActive("/events", true),
        },
        {
          icon: <ClipboardList className="h-5 w-5 mr-3" />,
          label: "Templates",
          path: "/messages",
          active: isActive("/messages"),
        },
        {
          icon: <BarChart className="h-5 w-5 mr-3" />,
          label: "Reports",
          path: "/reports",
          active: isActive("/reports"),
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          icon: <Settings className="h-5 w-5 mr-3" />,
          label: "Settings",
          path: "/settings",
          active: isActive("/settings"),
        },
        {
          icon: <HelpCircle className="h-5 w-5 mr-3" />,
          label: "Help",
          path: "/help",
          active: isActive("/help"),
        },
      ],
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:bg-white ${className}`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="h-10">
          <Logo />
        </div>
      </div>
      
      {/* Navigation */}
      <div className="overflow-y-auto flex-1 py-4">
        {navigation.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.label}
            </div>
            
            {group.items.map((item, itemIndex) => (
              <a
                key={itemIndex}
                href={item.path}
                className={`flex items-center px-4 py-2 mb-1 ${
                  item.active
                    ? "text-primary bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation(item.path);
                }}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            {user.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.name} />
            ) : null}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium truncate">{user.name}</div>
            <div className="text-gray-500 text-sm">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
