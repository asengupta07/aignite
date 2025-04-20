"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Organization {
  _id: string;
  owner_id: string;
}

interface DevTeamMember {
  _id: string;
  organization_id: string;
  github_id: string;
  role: string;
  name: string;
  image: string;
  email: string;
}

interface Goal {
  _id?: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string;
  assignee: string;
  tags: string[];
}

export default function SetGoalsPage() {
  const { data: session } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [devTeam, setDevTeam] = useState<DevTeamMember[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newGoal, setNewGoal] = useState<Goal>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    assignee: "",
    tags: [],
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-organization/${session?.user?.github_id}`
        );
        const data = await response.json();
        setOrganization(data.organization);

        // Fetch dev team after getting organization
        if (data.organization?._id) {
          const devTeamResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-dev-team/${data.organization._id}`
          );
          const devTeamData = await devTeamResponse.json();
          console.log("devTeamData", devTeamData);
          setDevTeam(devTeamData.dev_team || []);

          // Fetch goals after getting organization
          const goalsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-product-goals/${data.organization._id}`
          );
          const goalsData = await goalsResponse.json();
          setGoals(goalsData.product_goals || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (session?.user?.github_id) {
      fetchOrganization();
    }
  }, [session]);

  const handleAddTag = () => {
    if (newTag && !newGoal.tags.includes(newTag)) {
      setNewGoal({ ...newGoal, tags: [...newGoal.tags, newTag] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewGoal({
      ...newGoal,
      tags: newGoal.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddGoal = async () => {
    if (
      !newGoal.title ||
      !newGoal.description ||
      !newGoal.due_date ||
      !organization?._id
    )
      return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/create-product-goals/${organization._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newGoal,
            due_date: new Date(newGoal.due_date).toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create goal");

      // Refresh goals list
      const goalsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-product-goals/${organization._id}`
      );
      const goalsData = await goalsResponse.json();
      setGoals(goalsData.product_goals);

      // Reset form
      setNewGoal({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
        assignee: "",
        tags: [],
      });
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  return (
    <div className="h-full space-y-8 p-8">
      <div className="flex items-center gap-2">
        <Target className="w-6 h-6 text-indigo-500" />
        <h1 className="text-2xl font-bold">Set Organization Goals</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Create New Goal</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Title</label>
              <Input
                placeholder="Enter goal title"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter goal description"
                className="min-h-[100px]"
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newGoal.status}
                  onValueChange={(
                    value: "pending" | "in_progress" | "completed"
                  ) => setNewGoal({ ...newGoal, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newGoal.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setNewGoal({ ...newGoal, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="datetime-local"
                value={newGoal.due_date}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, due_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Select
                value={newGoal.assignee}
                onValueChange={(value: string) =>
                  setNewGoal({ ...newGoal, assignee: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {newGoal.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={
                              devTeam.find(
                                (member) => member.name === newGoal.assignee
                              )?.image
                            }
                            alt={newGoal.assignee}
                          />
                          <AvatarFallback>
                            {newGoal.assignee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{newGoal.assignee}</span>
                      </div>
                    ) : (
                      "Select assignee"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {devTeam.map((member) => (
                    <SelectItem
                      key={member.github_id}
                      value={member.name}
                      className="flex items-center gap-2 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newGoal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newGoal.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleAddGoal} className="w-full">
              Add Goal
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Current Goals</h2>
          <div className="grid gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {goals.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                No goals set yet.
              </p>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal._id}
                  className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
