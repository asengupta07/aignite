"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200">
            Welcome to IntersectAI
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Sign in to continue
          </p>
        </div>
        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full border-gradient-animated rounded-full py-6 text-lg"
        >
          <Github className="mr-2 h-5 w-5" />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}
