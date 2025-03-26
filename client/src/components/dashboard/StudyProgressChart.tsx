import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays, eachDayOfInterval } from "date-fns";
import { StudySession } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudyProgressChart() {
  const { data: studySessions, isLoading } = useQuery<StudySession[]>({
    queryKey: ["/api/study-sessions"],
  });

  // State for the time period filter
  const activePeriod = "Day"; // Could be enhanced with useState

  // Calculate study hours per day of the week
  const calculateStudyHoursByDay = () => {
    if (!studySessions || studySessions.length === 0) {
      return Array(7).fill(0);
    }

    const currentDate = new Date();
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as start of week
    
    // Create array of all days in the week
    const daysOfWeek = eachDayOfInterval({
      start: startOfWeekDate,
      end: addDays(startOfWeekDate, 6)
    });

    // Initialize hours array with zeros
    const studyHoursByDay = Array(7).fill(0);

    // Calculate total minutes for each day
    studySessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      // Only count sessions from this week
      if (sessionDate >= startOfWeekDate && sessionDate <= daysOfWeek[6]) {
        const dayIndex = daysOfWeek.findIndex(day => 
          format(day, 'yyyy-MM-dd') === format(sessionDate, 'yyyy-MM-dd')
        );
        
        if (dayIndex !== -1 && session.duration) {
          // Convert minutes to hours
          studyHoursByDay[dayIndex] += session.duration / 60;
        }
      }
    });

    return studyHoursByDay;
  };

  const studyHours = calculateStudyHoursByDay();
  const maxStudyHours = Math.max(...studyHours, 5); // Set minimum max to 5h for visual scale
  
  // Calculate total study hours for the week
  const totalHours = studyHours.reduce((sum, hours) => sum + hours, 0);
  
  // Find most productive day
  const mostProductiveDayIndex = studyHours.indexOf(Math.max(...studyHours));
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mostProductiveDay = daysOfWeek[mostProductiveDayIndex];
  
  // Weekly goal progress (assuming 20h weekly goal)
  const weeklyGoal = 20;
  const weeklyProgress = Math.round((totalHours / weeklyGoal) * 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Study Progress</CardTitle>
        <div className="flex text-sm">
          <Button variant="ghost" className="px-3 py-1 text-primary">Day</Button>
          <Button variant="ghost" className="px-3 py-1">Week</Button>
          <Button variant="ghost" className="px-3 py-1">Month</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64">
            <div className="relative h-full">
              <div className="absolute bottom-0 left-0 right-0 flex h-full">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="w-1/7 px-1">
                    <div className="flex flex-col h-full justify-end">
                      <div 
                        className={`${index === 6 ? 'bg-orange-500' : 'bg-primary'} w-full rounded-t-sm`} 
                        style={{ height: `${(studyHours[index] / maxStudyHours) * 100}%` }}
                      ></div>
                      <div className="text-xs text-center text-gray-500 mt-2">
                        {day.substring(0, 3)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute left-0 right-0 flex flex-col justify-between h-full pointer-events-none">
                {[5, 4, 3, 1, 0].map((hour, index) => (
                  <div key={index} className="border-t border-gray-200 h-0 w-full">
                    <span className="text-xs text-gray-500 absolute -mt-4">{hour}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-1 gap-4 bg-gray-50 border-t sm:grid-cols-3 px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-500">Total Hours This Week</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{totalHours.toFixed(1)} hours</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Most Productive Day</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">{mostProductiveDay}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">Weekly Goal Progress</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">
            {weeklyProgress}% <span className="text-sm font-normal text-gray-500">({weeklyGoal}h goal)</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
