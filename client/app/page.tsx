"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Code,
  FileText,
  LayoutDashboard,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center container mx-auto px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-30 dark:opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-400 dark:bg-cyan-700 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight text-zinc-800 dark:text-zinc-200"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Driving Success Where Business and Tech{" "}
            <span className="text-gradient">Intersect</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-5xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Eliminate <span>miscommunication bottlenecks</span> and{" "}
            <span>automate documentation</span> with our{" "}
            <span className="text-gradient font-semibold">AI-powered</span>{" "}
            platform that translates <span>technical complexity</span> into{" "}
            <span className="text-gradient font-semibold">
              business clarity
            </span>
            .
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={() => {
                if (!session) {
                  router.push("/api/auth/signin/github");
                } else {
                  router.push("/onboarding");
                }
              }}
              className="gradient-button rounded-full text-zinc-100 dark:text-zinc-900 px-8 py-6 text-lg transition-all duration-300"
            >
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <ScrollRevealSection>
        <section className="container mx-auto py-20 px-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-zinc-800 dark:text-zinc-200">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={
                  <Code className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                }
                title="Commit Summaries → Business Insights"
                description="Our AI translates technical commits into business-friendly insights, making development progress transparent to all stakeholders."
                delay={0.2}
              />

              <FeatureCard
                icon={
                  <FileText className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                }
                title="Dynamic Documentation"
                description="Automatically generate and update documentation as your codebase evolves, ensuring everyone has access to the latest information."
                delay={0.4}
              />

              <FeatureCard
                icon={
                  <LayoutDashboard className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />
                }
                title="Unified Dashboard"
                description="A single source of truth that brings technical and business metrics together, enabling better decision-making and alignment."
                delay={0.6}
              />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Success Metrics Section */}
      <ScrollRevealSection>
        <section className="container mx-auto py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-zinc-800 dark:text-zinc-200">
              Success Metrics
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <MetricCard
                title="99% Summary Accuracy"
                description="Our AI consistently delivers accurate technical-to-business translations."
                delay={0.2}
              />

              <MetricCard
                title="85% Documentation Automation"
                description="Reduce manual documentation efforts by automating the majority of the process."
                delay={0.3}
              />

              <MetricCard
                title="Real-time Dashboard Updates"
                description="Stay current with dashboards that refresh as your projects evolve."
                delay={0.4}
              />

              <MetricCard
                title="90% Stakeholder Alignment"
                description="Improve cross-team understanding and collaboration with clear communication."
                delay={0.5}
              />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Final CTA Section */}
      <ScrollRevealSection>
        <section className="container mx-auto py-20 px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-200">
              Ready to transform your team communication?
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Join hundreds of teams who have eliminated the gap between
              technical and business stakeholders.
            </p>
            <Button className="border-gradient-animated rounded-full px-8 py-6 text-lg transition-all duration-300">
              Know more about us
            </Button>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Footer */}
      <footer className="container mx-auto py-8 px-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-zinc-500 mb-4 md:mb-0">
            © 2025 BridgeAI. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Animation Components
function ScrollRevealSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="bg-white dark:bg-zinc-800/50 w-full p-8 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </motion.div>
  );
}

function MetricCard({
  title,
  description,
  delay = 0,
}: {
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="bg-white dark:bg-zinc-800/30 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </motion.div>
  );
}
