"use client";

import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { CursorGlow, PageLoader, SmoothScroll } from "@/components/chrome";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScroll>
          <PageLoader />
          <CursorGlow />
          {children}
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(16,16,19,0.92)",
                border: "1px solid rgba(226,182,79,0.25)",
                color: "#f4f2ee",
                backdropFilter: "blur(20px)",
              },
            }}
          />
        </SmoothScroll>
      </AuthProvider>
    </QueryClientProvider>
  );
}
