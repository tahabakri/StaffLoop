import { ReactNode } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  action?: {
    label: string;
    color: string;
  };
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  action,
  onClick
}: StatsCardProps) {
  return (
    <Card className="bg-white rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium">{title}</h3>
          <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm text-gray-500">{subtitle}</div>
          </div>
          {action && (
            <div 
              className={`text-sm ${action.color} cursor-pointer`}
              onClick={onClick}
            >
              {action.label}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
