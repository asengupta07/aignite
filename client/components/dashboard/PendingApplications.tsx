"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Application {
  _id: string;
  github_id: string;
  organization_id: string;
  status: string;
  role?: string;
}

export function PendingApplications() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/applications/${session?.user?.githubId}`
        );
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.githubId) {
      fetchApplications();
    }
  }, [session]);

  const handleApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch("http://localhost:8000/update-application-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: applicationId,
          status,
          role: "developer", // Default role for now
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      // Refresh applications
      const updatedResponse = await fetch(
        `http://localhost:8000/applications/${session?.user?.githubId}`
      );
      const updatedData = await updatedResponse.json();
      setApplications(updatedData.applications || []);
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
        <p className="text-zinc-500 dark:text-zinc-400">No pending applications</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    GitHub ID: {application.github_id}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Status: {application.status}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplicationStatus(application._id, "approved")}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplicationStatus(application._id, "rejected")}
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