"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Target, BarChart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Organization {
  _id: string;
  owner_id: string;
}

const adminSidebarItems = [
  {
    name: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    name: "Set Goals",
    icon: Target,
    href: "/dashboard/set-goals",
  },
  {
    name: "View Progress",
    icon: BarChart,
    href: "/dashboard/view-progress",
  },
  {
    name: "Documentation",
    icon: FileText,
    href: "/dashboard/documentation",
  },
];

const developerSidebarItems = [
  {
    name: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    name: "View Goals",
    icon: Target,
    href: "/dashboard/view-goals",
  },
  {
    name: "Documentation",
    icon: FileText,
    href: "/dashboard/documentation",
  },
];

const productSidebarItems = [
  {
    name: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    name: "Set Goals",
    icon: Target,
    href: "/dashboard/set-goals",
  },
  {
    name: "View Progress",
    icon: BarChart,
    href: "/dashboard/view-progress",
  },
  {
    name: "Documentation",
    icon: FileText,
    href: "/dashboard/documentation",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-organization/${session?.user?.github_id}`
        );
        const data = await response.json();
        const organization: Organization = data.organization;

        // If user is owner, they are admin
        if (session?.user?.github_id === organization.owner_id) {
          setUserRole("admin");
        } else {
          // Fetch user's role from organization members
          const membersResponse = await fetch(
            `http://localhost:8000/organizations/${organization._id}/members`
          );
          const membersData = await membersResponse.json();
          const userMember = membersData.members.find(
            (member: any) => member.github_id === session?.user?.github_id
          );
          setUserRole(userMember?.role || null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.github_id) {
      fetchUserRole();
    }
  }, [session]);

  const getSidebarItems = () => {
    switch (userRole) {
      case "admin":
        return [...adminSidebarItems];
      case "developer":
        return developerSidebarItems;
      case "product":
        return productSidebarItems;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-900">
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
            {getSidebarItems().map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
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
