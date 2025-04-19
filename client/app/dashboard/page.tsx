"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Code2, RefreshCw } from "lucide-react";
import { Target, CheckCircle2, Circle } from "lucide-react";
import type { ReactNode } from "react";
import { Clock, Check, X } from "lucide-react";

interface BentoGridProps {
  children: ReactNode;
}

// Update the BentoGrid component to make it fit the screen without scrolling
export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-screen overflow-hidden">
      {children}
    </div>
  );
}

interface BentoBoxProps {
  children: ReactNode;
  className?: string;
}

// Update the BentoBox component to make its content scrollable
export function BentoBox({ children, className = "" }: BentoBoxProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 overflow-auto max-h-full ${className}`}
    >
      {children}
    </div>
  );
}

interface Application {
  _id: string
  github_id: string
  organization_id: string
  status: string
  role?: string
  user_name: string
  user_image: string
}

// Update the PendingApplications component to include role selection
function PendingApplications() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/applications/${session?.user?.github_id}`
        );
        const data = await response.json();
        // Only show pending applications
        setApplications(
          (data.applications || []).filter(
            (app: Application) => app.status === "pending"
          )
        );
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.github_id) {
      fetchApplications();
    }
  }, [session]);

  const handleRoleChange = (applicationId: string, role: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [applicationId]: role,
    }));
  };

  const handleApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        "http://localhost:8000/update-application-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            application_id: applicationId,
            status,
            role: selectedRoles[applicationId] || "developer", // Use selected role or default
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      // Refresh applications
      const updatedResponse = await fetch(
        `http://localhost:8000/applications/${session?.user?.github_id}`
      );
      const updatedData = await updatedResponse.json();
      // Only show pending applications
      setApplications(
        (updatedData.applications || []).filter(
          (app: Application) => app.status === "pending"
        )
      );
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
        Pending Applications
      </h2>
      {applications.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">
          No pending applications
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className="flex flex-col p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={application.user_image}
                    alt={application.user_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">{application.user_name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">GitHub ID: {application.github_id}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Select Role
                </label>
                <select
                  className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                  value={selectedRoles[application._id] || "developer"}
                  onChange={(e) =>
                    handleRoleChange(application._id, e.target.value)
                  }
                >
                  <option value="developer">Dev Team</option>
                  <option value="admin">Admin</option>
                  <option value="product">Product Team</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplicationStatus(application._id, "approved")
                  }
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplicationStatus(application._id, "rejected")
                  }
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    description:
      "Integrate AI to automatically review pull requests and suggest improvements",
    status: "in-progress",
  },
  {
    id: "2",
    title: "Enhance developer productivity",
    description:
      "Add more automation tools and integrations to streamline development workflow",
    status: "pending",
  },
  {
    id: "3",
    title: "Improve code quality metrics",
    description: "Implement comprehensive code quality tracking and reporting",
    status: "completed",
  },
];

function ProductGoals() {
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

interface ReportContent {
  summary: string;
  changes: string[];
  issues: string[];
  suggestions: string[];
}

interface DevReportResponse {
  report: ReportContent;
}

export function DevReports() {
  const { data: session } = useSession();
  const [report, setReport] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDevReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/get-latest-dev-report/${session?.user?.github_id}`
      );
      const data: DevReportResponse = await response.json();
      setReport(data.report);
    } catch (error) {
      console.error("Error fetching dev report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.github_id) {
      fetchDevReport();
    }
  }, [session]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-500 mt-1" />
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
            Development Report
          </h2>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDevReport}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <div>
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Summary
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {report.summary}
              </p>
            </div>
          </div>

          {/* Changes */}
          {report.changes.length > 0 && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Recent Changes
              </h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                {report.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {report.issues.length > 0 && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Current Issues
              </h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                {report.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions.length > 0 && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
              <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Suggestions
              </h3>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                {report.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">
          No development report available
        </p>
      )}
    </div>
  );
}

interface Organization {
  _id: string;
  name: string;
  description: string;
  github_url: string;
  key: string;
  owner_id: string;
  image_url?: string;
}

// Update the OrganizationDashboard component to use the specified bento box layout
function OrganizationDashboard() {
  const { data: session } = useSession();
  const [showKey, setShowKey] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-organization/${session?.user?.github_id}`
        );
        const data = await response.json();
        setOrganization(data.organization);
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.github_id) {
      fetchOrganization();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex justify-center items-center h-screen">
        No organization found
      </div>
    );
  }

  const isAdmin = session?.user?.github_id === organization.owner_id;

  return (
    <div className="max-h-[95dvh] overflow-hidden p-8">
      {/* Bento Grid Layout with specific arrangement */}
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {/* First Row */}
        {/* Small card for org details */}
        <div className="col-span-1 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 overflow-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
              {organization.image_url ? (
                <img
                  src={organization.image_url || "/placeholder.svg"}
                  alt={`${organization.name} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-zinc-400">
                  {organization.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                {organization.name}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                {organization.description}
              </p>
              <Button
                size="sm"
                onClick={() => window.open(organization.github_url, "_blank")}
                className="flex items-center justify-center gap-2 w-full"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </div>

            {/* Organization Key (Admin Only) */}
            {isAdmin && (
              <div className="w-full mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Organization Key
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={organization.key}
                    readOnly
                    className="w-full p-3 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wide card for today's dev reports */}
        <div className="col-span-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 overflow-auto">
          <DevReports />
        </div>

        {/* Second Row */}
        {/* Wide card for product goals */}
        <div className="col-span-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 overflow-auto">
          <ProductGoals />
        </div>

        {/* Small card for org applications (admin only) or relevant content */}
        <div className="col-span-1 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 overflow-auto">
          {isAdmin ? (
            <PendingApplications />
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
                  Your Activity
                </h2>
              </div>
              <div className="space-y-6">
                <div className="p-5 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Recent Contributions
                  </h3>
                  <ul className="list-disc list-inside space-y-3 text-zinc-600 dark:text-zinc-400 text-sm">
                    <li>Submitted 3 pull requests this week</li>
                    <li>Resolved 5 issues in the last sprint</li>
                    <li>Contributed to documentation updates</li>
                  </ul>
                </div>
                <div className="p-5 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                  <h3 className="font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Your Tasks
                  </h3>
                  <ul className="list-disc list-inside space-y-3 text-zinc-600 dark:text-zinc-400 text-sm">
                    <li>Review pending PR #142</li>
                    <li>Complete API documentation</li>
                    <li>Prepare for next sprint planning</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Update the main DashboardPage component
export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-[90dvh] overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900">
      <OrganizationDashboard />
    </div>
  );
}
