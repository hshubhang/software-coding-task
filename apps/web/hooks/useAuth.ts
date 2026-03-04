"use client";

import { useEffect, useState } from "react";
import { getToken, removeToken } from "@/lib/auth";

function getEmailFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return payload.email || null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    if (token) {
      setEmail(getEmailFromToken(token));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setEmail(null);
    window.location.href = "/login";
  };

  return { isAuthenticated, email, loading, logout };
}
