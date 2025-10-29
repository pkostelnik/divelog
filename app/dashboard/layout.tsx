import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-100 py-12">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
