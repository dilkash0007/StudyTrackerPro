import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen, CheckSquare, Clock, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activity"],
  });

  const getIconForActivityType = (type: string) => {
    switch (type) {
      case 'study-session':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'task-completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'note':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-primary" />;
    }
  };

  const getBackgroundForActivityType = (type: string) => {
    switch (type) {
      case 'study-session':
        return 'bg-yellow-50';
      case 'task-completed':
        return 'bg-green-50';
      case 'note':
        return 'bg-indigo-50';
      default:
        return 'bg-primary-50';
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <li key={index} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <span className={`flex items-center justify-center w-8 h-8 ${getBackgroundForActivityType(activity.type)} rounded-full`}>
                      {getIconForActivityType(activity.type)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.title}</span> - {activity.subtitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                No recent activity. Start studying to see your activity here!
              </div>
            )}
          </ul>
        )}
      </CardContent>
      <CardFooter className="px-4 py-4 text-center bg-gray-50 border-t">
        <Button variant="link" className="text-primary">
          View all activity <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
