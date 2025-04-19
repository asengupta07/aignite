"use client";

import { useState } from "react";
import { Eye, EyeOff, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface Organization {
  _id: string;
  name: string;
  description: string;
  github_url: string;
  key: string;
  owner_id: string;
  image_url?: string;
}

export default function OrganizationDashboard() {
  const { data: session } = useSession();
  const [showKey, setShowKey] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/get-organization/${session?.user?.githubId}`
        );
        const data = await response.json();
        setOrganization(data.organization);
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.githubId) {
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

  const isAdmin = session?.user?.githubId === organization.owner_id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
        {/* Organization Logo and Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mb-4 overflow-hidden">
            {organization.image_url ? (
              <img
                src={organization.image_url}
                alt={`${organization.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-zinc-400">
                {organization.name.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">
            {organization.name}
          </h1>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            Description
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {organization.description}
          </p>
        </div>

        {/* GitHub Link */}
        <div className="mb-8">
          <Button
            onClick={() => window.open(organization.github_url, "_blank")}
            className="w-full flex items-center justify-center gap-2"
          >
            <Github className="w-5 h-5" />
            Visit GitHub Repository
          </Button>
        </div>

        {/* Organization Key (Admin Only) */}
        {isAdmin && (
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
            <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
              Organization Key
            </h2>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={organization.key}
                readOnly
                className="w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 pr-12"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {showKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
