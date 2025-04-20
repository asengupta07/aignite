"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoBox } from "./BentoGrid";
import { PendingApplications } from "./PendingApplications";
import { DevReports } from "./DevReports";
import { ProductGoals } from "./ProductGoals";

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-organization/${session?.user?.github_id}`
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Organization Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
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
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
              {organization.name}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {organization.description}
            </p>
            <Button
              onClick={() => window.open(organization.github_url, "_blank")}
              className="flex items-center justify-center gap-2"
            >
              <Github className="w-5 h-5" />
              Visit GitHub Repository
            </Button>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <BentoGrid>
        {/* Organization Key (Admin Only) */}
        {isAdmin && (
          <BentoBox className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
                Organization Key
              </h2>
              <Button
                variant="ghost"
                size="sm"
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
                className="w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 pr-12"
              />
            </div>
          </BentoBox>
        )}

        {/* Pending Applications */}
        {isAdmin && (
          <BentoBox className="md:col-span-2">
            <PendingApplications />
          </BentoBox>
        )}

        {/* Dev Reports */}
        <BentoBox className="md:col-span-2">
          <DevReports />
        </BentoBox>

        {/* Product Goals */}
        <BentoBox className="md:col-span-2">
          <ProductGoals />
        </BentoBox>
      </BentoGrid>
    </div>
  );
}
