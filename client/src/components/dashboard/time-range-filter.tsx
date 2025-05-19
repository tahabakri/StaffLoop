import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface TimeRangeFilterProps {
  onRangeChange: (range: string, startDate?: Date, endDate?: Date) => void;
}

export function TimeRangeFilter({ onRangeChange }: TimeRangeFilterProps) {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onRangeChange("custom", selectedDate, selectedDate);
      setIsOpen(false);
    }
  };

  const handlePresetSelect = (range: string) => {
    const today = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (range) {
      case "today":
        startDate = today;
        endDate = today;
        break;
      case "week":
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
        break;
      case "month":
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        endDate = new Date();
        break;
      case "custom":
        setIsOpen(true);
        return;
    }

    onRangeChange(range, startDate, endDate);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={date ? "default" : "outline"}
        onClick={() => handlePresetSelect("today")}
        className={cn(
          "justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
      >
        Today
      </Button>
      <Button
        variant="outline"
        onClick={() => handlePresetSelect("week")}
        className="justify-start text-left font-normal"
      >
        Last 7 Days
      </Button>
      <Button
        variant="outline"
        onClick={() => handlePresetSelect("month")}
        className="justify-start text-left font-normal"
      >
        Last 30 Days
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Custom Range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 