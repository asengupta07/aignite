"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  BarChart2,
  GitPullRequest,
  GitCommit,
  MessageSquare,
  Code2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Organization {
  _id: string;
  owner_id: string;
}

const ownerSidebarItems = [
  {
    name: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    name: "Metrics",
    icon: BarChart2,
    href: "/dashboard/metrics",
  },
  {
    name: "PR Summaries",
    icon: GitPullRequest,
    href: "/dashboard/pr-summaries",
  },
  {
    name: "Commit Summaries",
    icon: GitCommit,
    href: "/dashboard/commit-summaries",
  },
  {
    name: "Status Assistant",
    icon: MessageSquare,
    href: "/dashboard/status-assistant",
  },
];

const developerSidebarItems = [
  {
    name: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    name: "Query Codebase",
    icon: Code2,
    href: "/dashboard/query-codebase",
  },
  {
    name: "Generate Documentation",
    icon: FileText,
    href: "/dashboard/generate-docs",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-organization/${session?.user?.github_id}`
        );
        const data = await response.json();
        const organization: Organization = data.organization;
        setIsOwner(session?.user?.github_id === organization.owner_id);
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

  const sidebarItems = isOwner ? ownerSidebarItems : developerSidebarItems;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-white dark:bg-zinc-800 shadow-lg transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1
              className={cn(
                "text-xl font-bold",
                isCollapsed ? "hidden" : "block"
              )}
            >
              Dashboard
            </h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
