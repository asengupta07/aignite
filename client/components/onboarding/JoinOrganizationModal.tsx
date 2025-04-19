"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface JoinOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinOrganizationModal({
  isOpen,
  onClose,
}: JoinOrganizationModalProps) {
  const [organizationKey, setOrganizationKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement join organization logic
    console.log("Joining organization with key:", organizationKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">
          Join Organization
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Enter the organization key provided by your manager or CEO to join an
          existing organization.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="organizationKey"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Organization Key
            </label>
            <input
              type="text"
              id="organizationKey"
              value={organizationKey}
              onChange={(e) => setOrganizationKey(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              placeholder="Enter organization key"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join Organization
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
