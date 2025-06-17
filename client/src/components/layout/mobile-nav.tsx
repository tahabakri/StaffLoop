import { useLocation } from "wouter";
import { Home, Users, Calendar, FileText, Settings, BarChart, ClipboardList, MessagesSquare } from "lucide-react";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [location, setLocation] = useLocation();

  const isActive = (path: string, matchSubRoutes = false) => {
    if (matchSubRoutes) {
      return location.startsWith(path);
    }
    return location === path;
  };

  const navItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Dashboard",
      path: "/",
      active: isActive("/"),
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: "Staff",
      path: "/staff",
      active: isActive("/staff"),
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: "Events",
      path: "/events",
      active: isActive("/events", true),
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      label: "Reports",
      path: "/reports",
      active: isActive("/reports"),
    },
    {
      icon: <MessagesSquare className="h-6 w-6" />,
      label: "Messages",
      path: "/messages",
      active: isActive("/messages"),
    },
    {
      icon: <Settings className="h-6 w-6" />,
      label: "Settings",
      path: "/settings",
      active: isActive("/settings"),
    },
  ];

  return (
    <div className={`lg:hidden flex items-center justify-around border-t border-gray-200 bg-white py-2 ${className}`}>
      {navItems.map((item, index) => (
        <a
          key={index}
          href={item.path}
          className={`flex flex-col items-center py-2 px-3 ${
            item.active
              ? "text-primary border-t-2 border-primary"
              : "text-gray-500 border-t-2 border-transparent"
          }`}
          onClick={(e) => {
            e.preventDefault();
            setLocation(item.path);
          }}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.label}</span>
        </a>
      ))}
    </div>
  );
}
