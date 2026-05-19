import type { ReactNode } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";

export const metadata = { title: "Dashboard — Chris Gramly" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <Sidebar />
      <main className="md:ml-60 px-5 md:px-10 py-8 md:py-12">{children}</main>
    </div>
  );
}
