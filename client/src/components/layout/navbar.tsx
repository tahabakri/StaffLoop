import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
  const { user, isLoading } = useAuth();
  const [notificationCount] = useState(3);

  return (
    <header className="bg-white shadow-sm h-16 fixed top-0 left-0 right-0 z-50">
      <div className="w-full h-full flex items-center justify-between">
        {/* Logo Area */}
        <a href="/dashboard" className="flex items-center">
          <Logo />
        </a>

        {/* Right Aligned Items (Notifications, Profile) */}
        <div className="flex items-center space-x-4">
          <button className="w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center relative">
            <BellIcon className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {user && (
            <div className="flex items-center">
              <Avatar className="w-10 h-10 mr-3">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.name} />
                ) : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 