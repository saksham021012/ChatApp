import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthenticated } from "@nhost/react";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthenticated();

  if (!isAuthenticated) {
    // Not logged in → redirect to landing page
    return <Navigate to="/" replace />;
  }

  return children; // Logged in → render the protected page
}
