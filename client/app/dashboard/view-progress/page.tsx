"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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

        // Then get the goals using organization ID
        if (orgData.organization?._id) {
          const goalsResponse = await fetch(
            `http://localhost:8000/get-product-goals/${orgData.organization._id}`
          );
          if (!goalsResponse.ok) throw new Error("Failed to fetch goals");

          const goalsData = await goalsResponse.json();
          setGoals(goalsData.product_goals || []);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading goals...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">Goals Progress</h1>
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

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid gap-6">
          {filteredGoals.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">No goals found.</p>
          ) : (
            filteredGoals.map((goal) => (
              <div
                key={goal._id}
                className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{goal.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : goal.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-300"
                      }`}
                    >
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

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">{goal.progress}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {goal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>

                <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Assignee: {goal.assignee}</span>
                  <span>
                    Due: {new Date(goal.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
