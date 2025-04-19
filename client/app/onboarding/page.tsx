"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import JoinOrganizationModal from "@/components/onboarding/JoinOrganizationModal";
import CreateOrganizationModal from "@/components/onboarding/CreateOrganizationModal";

export default function OnboardingPage() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors duration-300">
      <div className="max-w-7xl w-full mx-auto p-8">
        <motion.div
          className="text-center space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-200">
              Welcome to Intersect
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Let's get you started with your organization
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              onClick={() => setShowJoinModal(true)}
              className="w-full md:w-1/2 p-10 rounded-2xl bg-white dark:bg-zinc-800 cursor-pointer relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-zinc-800" />
              <div className="relative flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-zinc-600 dark:text-zinc-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
                  Join Organization
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-center text-lg">
                  Join an existing organization and start collaborating with
                  your team
                </p>
              </div>
            </motion.div>

            <motion.div
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-1/2 p-10 rounded-2xl bg-white dark:bg-zinc-800 cursor-pointer relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-zinc-800" />
              <div className="relative flex flex-col items-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-zinc-600 dark:text-zinc-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
                  Create Organization
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-center text-lg">
                  Start your own organization and invite team members to
                  collaborate
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {showJoinModal && (
        <JoinOrganizationModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateOrganizationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
