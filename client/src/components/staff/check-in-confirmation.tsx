import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import { User, MapPin, Clock, Phone } from "lucide-react";

interface ConfirmationData {
  staffId: number;
  eventId: number;
  checkInTime: string;
  staffName: string;
  staffRole: string;
  staffImage?: string;
  eventName: string;
  eventLocation: string;
  timeStatus: string;
  supervisorContact?: {
    name: string;
    role: string;
    image?: string;
    phone?: string;
  };
  schedule?: {
    items: {
      title: string;
      timeRange: string;
    }[];
  };
}

interface CheckInConfirmationProps {
  confirmationData: ConfirmationData;
}

export function CheckInConfirmation({ confirmationData }: CheckInConfirmationProps) {
  const { data: event } = useQuery({
    queryKey: [`/api/events/${confirmationData.eventId}`],
    enabled: !!confirmationData.eventId,
  });

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* User info card */}
      <Card className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            {confirmationData.staffImage ? (
              <AvatarImage src={confirmationData.staffImage} alt={confirmationData.staffName} />
            ) : null}
            <AvatarFallback className="text-lg">{getInitials(confirmationData.staffName)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{confirmationData.staffName}</h2>
            <p className="text-gray-600">{confirmationData.staffRole}</p>
          </div>
        </div>
      </Card>
      
      {/* Check-in status card */}
      <Card className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-200">
        <div className="flex items-center mb-4">
          <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mr-4">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Successfully Checked In</h3>
            <p className="text-green-700">
              {formatTime(confirmationData.checkInTime)} • {formatDate(confirmationData.checkInTime)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 text-sm text-gray-600">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            <span>{confirmationData.eventLocation}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            <span>{confirmationData.timeStatus}</span>
          </div>
        </div>
      </Card>
      
      {/* Schedule card */}
      {confirmationData.schedule && (
        <Card className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {confirmationData.schedule.items.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                <div className="text-sm">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-500">{item.timeRange}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Supervisor contact card */}
      {confirmationData.supervisorContact && (
        <Card className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-gray-800 mb-4">Supervisor Contact</h3>
          <div className="flex items-center">
            <Avatar className="w-12 h-12 mr-4">
              {confirmationData.supervisorContact.image ? (
                <AvatarImage src={confirmationData.supervisorContact.image} alt="Supervisor" />
              ) : null}
              <AvatarFallback>{getInitials(confirmationData.supervisorContact.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{confirmationData.supervisorContact.name}</h4>
              <p className="text-gray-600 text-sm">{confirmationData.supervisorContact.role}</p>
            </div>
            <a
              href={`tel:${confirmationData.supervisorContact.phone}`}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}

// Export the Check icon separately
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
