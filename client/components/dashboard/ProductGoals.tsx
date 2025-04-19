"use client";

import { Target, CheckCircle2, Circle } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
}

const goals: Goal[] = [
  {
    id: "1",
    title: "Implement AI-powered code review",
    description: "Integrate AI to automatically review pull requests and suggest improvements",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Enhance developer productivity",
    description: "Add more automation tools and integrations to streamline development workflow",
    status: "pending",
  },
  {
    id: "3",
    title: "Improve code quality metrics",
    description: "Implement comprehensive code quality tracking and reporting",
    status: "completed",
  },
];

export function ProductGoals() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
          Product Goals
        </h2>
      </div>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
          >
            <div className="flex items-start gap-3">
              {goal.status === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              ) : goal.status === "in-progress" ? (
                <Circle className="w-5 h-5 text-yellow-500 mt-1" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-400 mt-1" />
              )}
              <div>
                <h3 className="font-medium text-zinc-700 dark:text-zinc-300">
                  {goal.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {goal.description}
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      goal.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : goal.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300"
                    }`}
                  >
                    {goal.status === "completed"
                      ? "Completed"
                      : goal.status === "in-progress"
                      ? "In Progress"
                      : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 