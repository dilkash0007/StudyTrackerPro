import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Stats } from "@/types";
import { Clock, CheckSquare, Target, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/study-sessions/stats"],
  });

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium leading-6 text-gray-900">This week's overview</h3>
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Study Hours Stats */}
        <Card className="overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-primary-50 text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Study Hours
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats?.studyHours || "0"}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="sr-only">Increased by</span>
                        4.1%
                      </div>
                    </>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        {/* Tasks Completed Stats */}
        <Card className="overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-50 text-green-500">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Tasks Completed
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats?.tasksCompleted || 0}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="sr-only">Increased by</span>
                        12%
                      </div>
                    </>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        {/* Focus Score Stats */}
        <Card className="overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-yellow-50 text-yellow-500">
                <Target className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Focus Score
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats?.focusScore || "0%"}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <svg className="self-center flex-shrink-0 h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="sr-only">Decreased by</span>
                        2%
                      </div>
                    </>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        {/* Streak Stats */}
        <Card className="overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-red-50 text-red-500">
                <Flame className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Current Streak
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats?.streak || "0 days"}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="sr-only">Increased by</span>
                        1 day
                      </div>
                    </>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
