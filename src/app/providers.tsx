import type { ReactNode } from "react";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        theme="light"
        toastOptions={{
          className:
            "!rounded-lg !border !border-border !bg-card !text-card-foreground !shadow-lg",
        }}
      />
    </>
  );
}