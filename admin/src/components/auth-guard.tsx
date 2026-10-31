"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe, type AuthUser } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((u) => {
        if (cancelled) return;
        if (u.role !== "ADMIN") {
          router.replace("/login");
          return;
        }
        setUser(u);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}