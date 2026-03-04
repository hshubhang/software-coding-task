"use client";

import { useEffect, useState } from "react";
import { getToken, removeToken } from "@/lib/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return { isAuthenticated, loading, logout };
}
