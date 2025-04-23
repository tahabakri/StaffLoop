import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(3);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center relative">
              <BellIcon className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            <div className="hidden lg:block">
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
        </div>
        
        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {/* Page Title */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-800">{title}</h1>}
              {subtitle && <div className="mt-1 text-sm text-gray-500">{subtitle}</div>}
            </div>
          )}
          
          {/* Page Content */}
          {children}
        </div>
        
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
