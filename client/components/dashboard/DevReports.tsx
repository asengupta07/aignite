"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Code2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-latest-dev-report/${session?.user?.github_id}`
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
        <div className="space-y-6">
          {/* Summary */}
          <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <Code2 className="w-5 h-5 text-indigo-500 mt-1" />
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