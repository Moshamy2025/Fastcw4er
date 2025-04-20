import { ReactNode } from "react";
import { AuthProvider as AuthProviderImplementation } from "@/hooks/use-auth";

// Re-export AuthProvider from hooks/use-auth
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderImplementation>{children}</AuthProviderImplementation>;
}

// Export useAuth from hooks/use-auth
export { useAuth } from "@/hooks/use-auth";