"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, Sparkles } from "lucide-react";

interface CodebaseQuery {
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
}

export default function DocumentationPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<CodebaseQuery | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<CodebaseQuery[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setQueryLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze-codebase/${session?.user?.github_id}?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to analyze codebase");
      }

      const data = await response.json();
      setQueryResult(data);
      setChatHistory(prev => [...prev, data]);
      setQuery("");
    } catch (error) {
      console.error("Error querying codebase:", error);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Query Your Product
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 mt-2">
              Ask anything about your codebase and get instant insights
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700 min-h-[600px] flex flex-col overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="flex-1 p-8 overflow-y-auto space-y-8 scroll-smooth"
          >
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 space-y-6">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl">
                  <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-medium">Welcome to Codebase Assistant</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Ask questions about your codebase to get started
                  </p>
                </div>
              </div>
            ) : (
              chatHistory.map((item, index) => (
                <div key={index} className="space-y-6 animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                      <svg
                        className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        {item.query}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-2.5 rounded-xl">
                      <svg
                        className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-zinc-600 dark:text-zinc-300">
                          {item.answer}
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Confidence: {(item.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        {item.sources.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                              Sources:
                            </p>
                            <ul className="space-y-1">
                              {item.sources.map((source, sourceIndex) => (
                                <li 
                                  key={sourceIndex}
                                  className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {source}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-700 p-6 bg-zinc-50 dark:bg-zinc-800/50">
            <form onSubmit={handleQuerySubmit} className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your codebase..."
                className="flex-1 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
              />
              <button
                type="submit"
                disabled={queryLoading || !query.trim()}
                className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {queryLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg">Thinking...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="text-lg">Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
