"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Code2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevReport {
  report: string;
  timestamp: string;
}

export function DevReports() {
  const { data: session } = useSession();
  const [report, setReport] = useState<DevReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDevReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/get-latest-dev-report/${session?.user?.githubId}`
      );
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching dev report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.githubId) {
      fetchDevReport();
    }
  }, [session]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
          Development Report
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDevReport}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : report ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <Code2 className="w-5 h-5 text-indigo-500 mt-1" />
            <div>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {report.report}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Last updated: {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">
          No development report available
        </p>
      )}
    </div>
  );
} 