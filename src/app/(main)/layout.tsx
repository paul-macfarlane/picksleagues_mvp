import Navbar from "@/components/navbar";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />

      <div className="h-full bg-gradient-to-b from-primary/20 to-background p-4">
        {children}
      </div>
    </>
  );
}
