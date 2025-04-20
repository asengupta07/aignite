"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Target,
  BarChart,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  _id: string;
  owner_id: string;
}

interface ProgressReport {
  expected_progress: string;
  confirmed_progress: string;
  issues: string[];
  suggestions: string[];
  todos?: string[];
  risks?: string[];
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
  assignee: string;
  tags: string[];
  progress: number;
  progress_report?: ProgressReport;
}

export default function ViewProgressPage() {
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get the organization
        const orgResponse = await fetch(
          `http://localhost:8000/get-organization/${session?.user?.github_id}`
        );
        const orgData = await orgResponse.json();
        setOrganization(orgData.organization);

        // Then get the goals and progress reports using organization ID
        if (orgData.organization?._id) {
          const [goalsResponse, progressResponse] = await Promise.all([
            fetch(
              `http://localhost:8000/get-product-goals/${orgData.organization._id}`
            ),
            fetch(
              `http://localhost:8000/get-progress-report/${orgData.organization._id}`
            ),
          ]);

          if (!goalsResponse.ok) throw new Error("Failed to fetch goals");
          if (!progressResponse.ok)
            throw new Error("Failed to fetch progress reports");

          const goalsData = await goalsResponse.json();
          const progressData = await progressResponse.json();

          console.log(progressData);

          // Merge progress reports with goals
          const goalsWithReports = goalsData.product_goals.map((goal: Goal) => {
            const report = progressData.progress_reports.find(
              (report: any) => report.goal_id === goal._id
            );
            return {
              ...goal,
              progress_report: report,
            };
          });

          setGoals(goalsWithReports || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.github_id) {
      fetchData();
    }
  }, [session]);

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/update-goal-progress/${goalId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ progress: newProgress }),
        }
      );

      if (!response.ok) throw new Error("Failed to update progress");

      // Update local state
      setGoals(
        goals.map((goal) =>
          goal._id === goalId ? { ...goal, progress: newProgress } : goal
        )
      );
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const filteredGoals = goals.filter((goal) =>
    filter === "all" ? true : goal.status === filter
  );

  if (filteredGoals) console.log(filteredGoals);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">
          Loading goals...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-8 p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-lg">
            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Goals Progress
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Track and manage your team's objectives
            </p>
          </div>
        </div>
        <Select
          value={filter}
          onValueChange={(
            value: "all" | "pending" | "in_progress" | "completed"
          ) => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Goals</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              No goals found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-md">
              Try changing your filter or create new goals to track your
              progress.
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal._id}
              className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md border border-zinc-100 dark:border-zinc-700 space-y-5 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 line-clamp-2">
                    {goal.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      goal.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : goal.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        goal.status === "completed"
                          ? "bg-green-500"
                          : goal.status === "in_progress"
                          ? "bg-yellow-500"
                          : "bg-zinc-500"
                      }`}
                    ></span>
                    {goal.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : goal.priority === "medium"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {goal.priority}
                  </span>
                </div>
              </div>

              {/* <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={goal.progress} className="h-2" />
                </div>
                <span className="text-sm font-medium">{goal.progress}%</span>
              </div> */}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {goal.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {/* <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateProgress(
                        goal._id,
                        Math.max(0, (goal.progress || 0) - 10)
                      )
                    }
                    disabled={!goal.progress}
                  >
                    -10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUpdateProgress(
                        goal._id,
                        Math.min(100, (goal.progress || 0) + 10)
                      )
                    }
                    disabled={goal.progress === 100}
                  >
                    +10%
                  </Button>
                </div> */}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {goal.assignee.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {goal.assignee}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Due: {new Date(goal.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {goal.progress_report && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-6">
                  <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                    <div className="bg-white dark:bg-indigo-800/30 p-1.5 rounded-md shadow-sm">
                      <BarChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h4 className="text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      AI Progress Analysis
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow duration-200">
                        <h5 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                          Expected Progress
                        </h5>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress
                              value={Number.parseInt(
                                goal.progress_report.expected_progress
                              )}
                              className="h-2.5 bg-zinc-200 dark:bg-zinc-700 [&>div]:bg-indigo-500 [&>div]:animate-pulse"
                            />
                          </div>
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {goal.progress_report.expected_progress}%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                          Based on recent commits and activity
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-700/50 p-4 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow duration-200">
                        <h5 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                          Confirmed Progress
                        </h5>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress
                              value={Number.parseInt(
                                goal.progress_report.confirmed_progress
                              )}
                              className="h-2.5 bg-zinc-200 dark:bg-zinc-700 [&>div]:bg-green-500 [&>div]:animate-pulse"
                            />
                          </div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {goal.progress_report.confirmed_progress}%
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                          Based on completed PRs and reviews
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {goal.progress_report.issues.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <h5 className="text-sm font-medium text-red-600 dark:text-red-400">
                              Potential Issues
                            </h5>
                          </div>
                          <ul className="space-y-2">
                            {goal.progress_report.issues.map((issue, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-red-500">•</span>
                                <span className="text-sm text-red-600 dark:text-red-400">
                                  {issue}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {goal.progress_report.suggestions.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-blue-500" />
                            <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              Suggestions
                            </h5>
                          </div>
                          <ul className="space-y-2">
                            {goal.progress_report.suggestions.map(
                              (suggestion, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-blue-500">•</span>
                                  <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {suggestion}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900/30 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <h5 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Remaining Tasks
                          </h5>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 dark:text-purple-400">
                              Progress Gap
                            </span>
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              {Number.parseInt(
                                goal.progress_report.expected_progress
                              ) -
                                Number.parseInt(
                                  goal.progress_report.confirmed_progress
                                )}
                              %
                            </span>
                          </div>
                          <div className="flex-1">
                            <Progress
                              value={
                                Number.parseInt(
                                  goal.progress_report.expected_progress
                                ) -
                                Number.parseInt(
                                  goal.progress_report.confirmed_progress
                                )
                              }
                              className="h-2.5 bg-purple-200 dark:bg-purple-700 [&>div]:bg-purple-500 [&>div]:animate-pulse"
                            />
                          </div>
                          <div className="mt-2">
                            <h6 className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
                              Key Areas to Focus On:
                            </h6>
                            <ul className="space-y-1">
                              {goal.progress_report.issues.map(
                                (issue, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-purple-500">•</span>
                                    <span className="text-xs text-purple-600 dark:text-purple-400">
                                      {issue}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {goal.progress_report.todos &&
                        goal.progress_report.todos.length > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-amber-500" />
                              <h5 className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                Action Items
                              </h5>
                            </div>
                            <div className="space-y-2">
                              {goal.progress_report.todos.map((todo, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 p-2.5 bg-white dark:bg-amber-800/30 rounded-md shadow-sm border border-amber-200 dark:border-amber-800/50"
                                >
                                  <span className="text-amber-500 mt-1">•</span>
                                  <span className="text-sm text-amber-600 dark:text-amber-400">
                                    {todo}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {goal.progress_report.risks &&
                        goal.progress_report.risks.length > 0 && (
                          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg shadow-sm border border-rose-100 dark:border-rose-900/30 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                              <h5 className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                Risks & Blockers
                              </h5>
                            </div>
                            <div className="space-y-2">
                              {goal.progress_report.risks.map((risk, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-2 p-2.5 bg-white dark:bg-rose-800/30 rounded-md shadow-sm border border-rose-200 dark:border-rose-800/50"
                                >
                                  <span className="text-rose-500 mt-1">•</span>
                                  <span className="text-sm text-rose-600 dark:text-rose-400">
                                    {risk}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
