import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 sm:p-3 w-full", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-3 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-3 sm:space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-xs sm:text-sm font-medium text-gray-100",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border-teal-500/30 text-gray-100 backdrop-blur-sm"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-300 rounded-md w-7 sm:w-9 font-normal text-[0.7rem] sm:text-[0.8rem]",
        row: "flex w-full mt-1 sm:mt-2",
        cell: "h-7 w-7 sm:h-9 sm:w-9 text-center text-xs sm:text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-gray-800/70 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 text-gray-100 hover:bg-gray-800/70 hover:text-gray-100 backdrop-blur-sm"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-teal-500 text-gray-900 hover:bg-teal-600 hover:text-gray-900 focus:bg-teal-500 focus:text-gray-900",
        day_today: "bg-teal-500/20 text-teal-300 font-medium",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-500 aria-selected:opacity-40",
        day_disabled: "text-gray-600 opacity-50",
        day_range_middle:
          "aria-selected:bg-gray-800/70 aria-selected:text-gray-100 backdrop-blur-sm",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
