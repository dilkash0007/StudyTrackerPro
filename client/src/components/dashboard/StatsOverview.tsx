import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Stats } from "@/types";
import { Clock, CheckSquare, Target, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/contexts/ThemeContext";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/study-sessions/stats"],
  });
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  return (
    <div className="mt-8">
      <h3
        className={`text-lg font-medium bg-gradient-to-r ${
          isRedTheme ? "from-rose-300 to-red-300" : "from-teal-300 to-cyan-300"
        } text-transparent bg-clip-text`}
      >
        This week's overview
      </h3>
      <div className="grid grid-cols-1 gap-5 mt-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Study Hours Stats */}
        <Card className="overflow-hidden backdrop-blur-sm bg-gray-900/50 border-0 shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 p-3 rounded-md ${
                  isRedTheme
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-teal-500/20 text-teal-400"
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Study Hours
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 bg-gray-800" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-100">
                        {stats?.studyHours || "0"}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                        <svg
                          className="self-center flex-shrink-0 h-5 w-5 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
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
        <Card className="overflow-hidden backdrop-blur-sm bg-gray-900/50 border-0 shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-500/20 text-green-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Tasks Completed
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 bg-gray-800" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-100">
                        {stats?.tasksCompleted || 0}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                        <svg
                          className="self-center flex-shrink-0 h-5 w-5 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
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
        <Card className="overflow-hidden backdrop-blur-sm bg-gray-900/50 border-0 shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-yellow-500/20 text-yellow-400">
                <Target className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Focus Score
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 bg-gray-800" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-100">
                        {stats?.focusScore || "0%"}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-400">
                        <svg
                          className="self-center flex-shrink-0 h-5 w-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
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
        <Card className="overflow-hidden backdrop-blur-sm bg-gray-900/50 border-0 shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-red-500/20 text-red-400">
                <Flame className="w-5 h-5" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-400 truncate">
                  Current Streak
                </dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 bg-gray-800" />
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-gray-100">
                        {stats?.streak || "0"} days
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                        <svg
                          className="self-center flex-shrink-0 h-5 w-5 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="sr-only">Increased by</span>1 day
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
