import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { format, isSameDay, addDays } from "date-fns";
import { Clock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter and sort events to get upcoming ones
  const getUpcomingEvents = () => {
    if (!events || events.length === 0) return [];
    
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  };

  const upcomingEvents = getUpcomingEvents();

  // Function to format event time
  const formatEventTime = (startTime: Date | string, endTime: Date | string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  // Function to determine event date display
  const getEventDateDisplay = (date: Date | string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (isSameDay(eventDate, today)) {
      return "Today";
    } else if (isSameDay(eventDate, tomorrow)) {
      return "Tomorrow";
    } else {
      return format(eventDate, "MMM dd");
    }
  };

  // Function to get background color for event date
  const getEventDateColor = (colorHex: string = "#4F46E5") => {
    // Map of color hex values to tailwind color classes
    const colorMap: Record<string, string> = {
      "#4F46E5": "bg-primary-50 text-primary-700", // Default blue
      "#10B981": "bg-green-50 text-green-700", // Green
      "#EF4444": "bg-red-50 text-red-700", // Red
      "#F97316": "bg-orange-50 text-orange-700", // Orange
      "#8B5CF6": "bg-purple-50 text-purple-700", // Purple
    };
    
    return colorMap[colorHex] || colorMap["#4F46E5"];
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <li key={event.id} className="py-3">
                  <div className="flex space-x-3">
                    <div className={`flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-md ${getEventDateColor(event.color)}`}>
                      <span className="text-xs font-semibold">{format(new Date(event.startTime), "MMM").toUpperCase()}</span>
                      <span className="text-lg font-bold">{format(new Date(event.startTime), "d")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatEventTime(event.startTime, event.endTime)}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500">
                No upcoming events. Add some to your calendar!
              </div>
            )}
          </ul>
        )}
      </CardContent>
      <CardFooter className="px-4 py-4 text-center bg-gray-50 border-t">
        <Link to="/calendar">
          <Button variant="link" className="text-primary">
            View Calendar <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
