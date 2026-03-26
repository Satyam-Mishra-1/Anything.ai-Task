import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

