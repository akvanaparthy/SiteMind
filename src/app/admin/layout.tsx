import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-0">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
}
