"use client";

import dynamic from "next/dynamic";
import AuthGuard from "@/components/AuthGuard";

const RoutePlanner = dynamic(() => import("./RoutePlanner"), { ssr: false });

export default function Page() {
  return (
    <AuthGuard>
      <RoutePlanner />
    </AuthGuard>
  );
}
