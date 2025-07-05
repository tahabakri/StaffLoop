import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface BroadcastMessageModalProps {
  eventId: string;
  eventName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function BroadcastMessageModal({
  eventId,
  eventName,
  isOpen,
  onOpenChange,
  trigger
}: BroadcastMessageModalProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Available placeholders for the message
  const placeholders = [
    { name: "[Event Name]", description: "The name of the event" },
    { name: "[Event Date]", description: "The date of the event" },
    { name: "[Event Time]", description: "The start time of the event" },
    { name: "[Location]", description: "The event venue/location" },
    { name: "[Organizer Company Name]", description: "The name of the organizing company" },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageContent: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send broadcast message");
      }

      const result = await response.json();
      const staffCount = result.staffCount || 0;

      toast({
        title: "Message Sent Successfully",
        description: `Message broadcasted successfully to ${staffCount} staff member${staffCount !== 1 ? 's' : ''}.`,
      });

      // Reset form and close modal
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast({
        title: "Failed to Send Message",
        description: "Failed to send broadcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Update to Staff for {eventName}</DialogTitle>
          <DialogDescription>
            Compose a message to be sent via WhatsApp to all staff currently assigned to this event.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Recipients Info */}
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              Recipients: All Staff Assigned to {eventName}
            </p>
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your update here..."
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>

          {/* Available Placeholders */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Available Placeholders:</p>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder) => (
                <Badge
                  key={placeholder.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-100"
                  title={placeholder.description}
                  onClick={() => setMessage(prev => prev + placeholder.name)}
                >
                  {placeholder.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Click on a placeholder to add it to your message. These will be automatically replaced with actual values when sent.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? "Sending..." : "Send Message via WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 