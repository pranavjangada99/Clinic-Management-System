import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <Header />

      <main className="ml-72 pt-[72px]">
        <div className="min-h-[calc(100vh-72px)] p-8">
          {children}
        </div>
      </main>

    </div>
  );
}