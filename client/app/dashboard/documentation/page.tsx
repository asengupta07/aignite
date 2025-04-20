"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  GitCommit,
  GitPullRequest,
  ChevronRight,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

interface PullRequest {
  number: number;
  title: string;
  created_at: string;
  body: string;
  state: string;
}

interface Documentation {
  content: string;
  generated_at: string;
  metadata: {
    summary: string;
    purpose: string;
    technical_details: string;
    impact: string;
    testing_recommendations?: string;
    testing_considerations?: string;
    review_checklist?: string[];
    risks?: string[];
  };
}

export default function DocumentationPage() {
  const { data: session } = useSession();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<Documentation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session?.user?.github_id) {
          // Fetch organization details
          const orgResponse = await fetch(
            `http://localhost:8000/get-organization/${session.user.github_id}`
          );
          const orgData = await orgResponse.json();

          // Fetch user's commits and PRs
          const [commitsResponse, prsResponse] = await Promise.all([
            fetch(
              `http://localhost:8000/get-user-commits/${orgData.organization._id}/${session.user.github_id}`
            ),
            fetch(
              `http://localhost:8000/get-user-prs/${orgData.organization._id}/${session.user.github_id}`
            ),
          ]);

          const commitsData = await commitsResponse.json();
          const prsData = await prsResponse.json();

          setCommits(commitsData.commits);
          setPullRequests(prsData.pull_requests);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const generateDocumentation = async (type: "commit" | "pr", id: string) => {
    try {
      setGenerating(true);
      const response = await fetch(
        "http://localhost:8000/generate-documentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            id,
            github_id: session?.user?.github_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate documentation");
      }

      const data = await response.json();
      setDocumentation(data);
    } catch (error) {
      console.error("Error generating documentation:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
        <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">
          Loading your contributions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-8 p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-lg">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Documentation Generator
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Generate documentation for your commits and pull requests
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="commits" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="commits" className="w-1/2">
                <GitCommit className="w-4 h-4 mr-2" />
                Commits
              </TabsTrigger>
              <TabsTrigger value="prs" className="w-1/2">
                <GitPullRequest className="w-4 h-4 mr-2" />
                Pull Requests
              </TabsTrigger>
            </TabsList>
            <TabsContent value="commits" className="mt-4 space-y-4">
              {commits.map((commit) => (
                <Card
                  key={commit.sha}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedItem === commit.sha
                      ? "ring-2 ring-indigo-500"
                      : "hover:ring-1 hover:ring-indigo-500"
                  }`}
                  onClick={() => {
                    setSelectedItem(commit.sha);
                    generateDocumentation("commit", commit.sha);
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="truncate">{commit.commit.message}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </CardTitle>
                    <CardDescription>
                      {new Date(commit.commit.author.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="prs" className="mt-4 space-y-4">
              {pullRequests.map((pr) => (
                <Card
                  key={pr.number}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedItem === String(pr.number)
                      ? "ring-2 ring-indigo-500"
                      : "hover:ring-1 hover:ring-indigo-500"
                  }`}
                  onClick={() => {
                    setSelectedItem(String(pr.number));
                    generateDocumentation("pr", String(pr.number));
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span className="truncate">{pr.title}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </CardTitle>
                    <CardDescription>
                      {new Date(pr.created_at).toLocaleDateString()} -{" "}
                      <span
                        className={`capitalize ${
                          pr.state === "open"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {pr.state}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700 min-h-[500px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Generating documentation...
                </p>
              </div>
            ) : documentation ? (
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: documentation.content }}
                  />
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="metadata">
                      <AccordionTrigger className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Additional Information
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {Object.entries(documentation.metadata).map(
                            ([key, value]) => {
                              if (
                                !value ||
                                (Array.isArray(value) && value.length === 0)
                              )
                                return null;

                              return (
                                <div key={key} className="space-y-2">
                                  <h4 className="font-medium text-sm capitalize text-zinc-700 dark:text-zinc-300">
                                    {key.replace(/_/g, " ")}
                                  </h4>
                                  {Array.isArray(value) ? (
                                    <ul className="list-disc list-inside space-y-1">
                                      {value.map((item, index) => (
                                        <li
                                          key={index}
                                          className="text-sm text-zinc-600 dark:text-zinc-400"
                                        >
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                      {value}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Generated on:{" "}
                  {new Date(documentation.generated_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                <FileText className="w-12 h-12 mb-4" />
                <p>Select a commit or pull request to generate documentation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
