import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { DispatchProvider } from "@/context/DispatchContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Toolbox | Route Planner",
  description: "Premium internal logistics and route optimization tool.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${outfit.className} h-full antialiased overflow-hidden`}>
        <DispatchProvider>
          {children}
        </DispatchProvider>
      </body>
    </html>
  );
}
