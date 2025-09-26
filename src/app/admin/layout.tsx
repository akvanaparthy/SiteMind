"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ToastContainer, useToast } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-0">
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
          </div>
          <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
