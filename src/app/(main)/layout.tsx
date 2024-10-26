import Navbar from "@/components/navbar";
import { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex h-full flex-col">
      <Navbar />

      <div className="h-full bg-gradient-to-b from-primary/20 to-background">
        {children}
      </div>
    </div>
  );
}
