"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the agent console by default
    router.replace("/admin/agent/console");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to AI Agent Console...</p>
      </div>
    </div>
  );
}
