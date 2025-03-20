"use client";

import SessionCheck from "@/components/auth/SessionCheck";
import { AuthProvider } from "@/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { IntlProvider } from "react-intl";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <SessionCheck>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <IntlProvider locale="en">{children}</IntlProvider>
          </QueryClientProvider>
        </AuthProvider>
      </SessionCheck>
    </SessionProvider>
  );
}
