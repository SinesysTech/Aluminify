"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SuperadminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/superadmin/auth", { method: "DELETE" });
      router.push("/superadmin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
    >
      {loading ? "..." : "Sair"}
    </button>
  );
}
