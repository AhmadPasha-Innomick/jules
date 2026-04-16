import { ThemeProvider } from "@/context/ThemeContext";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 sm:p-0">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row">
          {children}
        </div>
      </ThemeProvider>
    </div>
  );
}
