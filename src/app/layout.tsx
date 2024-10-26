import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Picks Leagues",
  description: "NFL Picks Leagues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-full flex-col">
            <Navbar />

            <div className="h-full bg-gradient-to-b from-primary/20 to-background p-4">
              {children}
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
