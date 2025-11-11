"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function formatDate(date?: Date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  showDescription?: boolean;
  descriptionText?: string; // 🆕 dynamic description template
  fromDate?: Date; // Minimum selectable date
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  showDescription = true,
  descriptionText = "Your post will be published on {date}.", // default
  fromDate,
}) => {
  const [open, setOpen] = React.useState(false);

  // Set initial month to value, fromDate, or current date (whichever is latest)
  const initialMonth = React.useMemo(() => {
    if (value) return value;
    if (fromDate) return fromDate;
    return new Date();
  }, [value, fromDate]);

  const [month, setMonth] = React.useState<Date | undefined>(initialMonth);

  const finalDescription = value
    ? descriptionText.replace("{date}", formatDate(value))
    : "No date selected yet.";

  // Update month when fromDate changes and no value is set
  React.useEffect(() => {
    if (!value && fromDate) {
      setMonth(fromDate);
    }
  }, [value, fromDate]);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label htmlFor={label} className="px-1">
          {label}
        </Label>
      )}
      <div className="relative flex gap-2">
        <Input
          id={label}
          value={value ? formatDate(value) : ""}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className="bg-background pr-10 cursor-pointer"
          onClick={() => setOpen(true)}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                onChange?.(date);
                setOpen(false);
              }}
              fromDate={fromDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      {showDescription && (
        <div className="text-muted-foreground px-1 text-sm">
          {finalDescription}
        </div>
      )}
    </div>
  );
};
