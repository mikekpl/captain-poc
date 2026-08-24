import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/src/components/NavBar";

export const metadata: Metadata = {
  title: "Captain PDF Parser",
  description: "Parse and understand your billing PDF at a glance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
