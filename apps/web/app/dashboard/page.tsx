"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@workspace/ui/components/button";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
      <p className="text-muted-foreground">Dashboard charts coming soon...</p>
    </div>
  );
}
