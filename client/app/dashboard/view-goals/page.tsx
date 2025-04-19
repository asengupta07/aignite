"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}

export default function ViewGoalsPage() {
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading goals...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="w-6 h-6 text-indigo-500" />
        <h1 className="text-2xl font-bold">Organization Goals</h1>
      </div>

      {goals.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No goals set yet.</p>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div
              key={goal._id}
              className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{goal.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {goal.description}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                    Due: {new Date(goal.due_date).toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    Assignee: {goal.assignee}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {goal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
