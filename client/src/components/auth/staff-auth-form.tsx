import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { QrCode, Scan } from "lucide-react";

// Staff login schema
const staffLoginSchema = z.object({
  phone: z
    .string()
    .min(9, { message: "Please enter a valid phone number" })
    .max(10, { message: "Please enter a valid phone number" }),
  countryCode: z.string().default("+971"),
});

type StaffLoginFormValues = z.infer<typeof staffLoginSchema>;

interface StaffAuthFormProps {
  onOrganizerLoginClick: () => void;
  onSuccessfulLogin: () => void;
}

export function StaffAuthForm({ onOrganizerLoginClick, onSuccessfulLogin }: StaffAuthFormProps) {
  const { staffLoginMutation } = useAuth();
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Staff Login form
  const staffLoginForm = useForm<StaffLoginFormValues>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: {
      phone: "",
      countryCode: "+971",
    },
  });

  const onStaffLoginSubmit = (data: StaffLoginFormValues) => {
    // Format phone with country code
    const formattedPhone = `${data.countryCode}${data.phone}`;
    
    staffLoginMutation.mutate({ phone: formattedPhone }, {
      onSuccess: () => {
        onSuccessfulLogin();
      }
    });
  };

  const handleScanQrCode = () => {
    setShowQrScanner(!showQrScanner);
    // In a real app, we would activate the QR code scanner here
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-10">
        <Logo size="lg" />
      </div>
      
      {/* Staff Login Card */}
      <Card className="bg-white rounded-2xl shadow-card">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Check-In</h2>
          <p className="text-gray-600 mb-8">Enter your phone number to continue</p>
          
          <form onSubmit={staffLoginForm.handleSubmit(onStaffLoginSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</Label>
              <div className="flex">
                <Select
                  value={staffLoginForm.watch("countryCode")}
                  onValueChange={(value) => staffLoginForm.setValue("countryCode", value)}
                >
                  <SelectTrigger className="w-24 rounded-l-xl rounded-r-none bg-gray-50">
                    <SelectValue placeholder="+971" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+971">+971</SelectItem>
                    <SelectItem value="+966">+966</SelectItem>
                    <SelectItem value="+965">+965</SelectItem>
                    <SelectItem value="+974">+974</SelectItem>
                    <SelectItem value="+973">+973</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="5X XXX XXXX"
                  {...staffLoginForm.register("phone")}
                  className="flex-1 rounded-l-none rounded-r-xl"
                />
              </div>
              {staffLoginForm.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {staffLoginForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 py-3 px-4 rounded-xl text-gray-700"
                onClick={handleScanQrCode}
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan Event QR Code
              </Button>
            </div>
            
            {showQrScanner && (
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <Scan className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-600">Point your camera at the event QR code</p>
                <p className="text-xs text-gray-500 mt-1">QR scanning simulation</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={staffLoginMutation.isPending}
            >
              {staffLoginMutation.isPending ? (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
              ) : null}
              Continue to Check-In
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">Are you an event organizer?</p>
            <Button
              variant="link"
              className="mt-2 text-primary font-medium hover:text-primary-dark"
              onClick={onOrganizerLoginClick}
            >
              Organizer Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
