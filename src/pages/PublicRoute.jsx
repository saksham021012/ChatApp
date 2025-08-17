import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthenticated } from "@nhost/react";

export default function PublicRoute({ children }) {
  const isAuthenticated = useAuthenticated();

  if (isAuthenticated) {
    // Already logged in → redirect to chat
    return <Navigate to="/chatapp" replace />;
  }

  return children; // Not logged in → render the public page
}
