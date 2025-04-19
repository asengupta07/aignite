"use client";

import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
}

export function BentoGrid({ children }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {children}
    </div>
  );
}

interface BentoBoxProps {
  children: ReactNode;
  className?: string;
}

export function BentoBox({ children, className = "" }: BentoBoxProps) {
  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
} 