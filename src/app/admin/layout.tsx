import SessionProvider from "@/components/admin/SessionProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">{children}</div>
    </SessionProvider>
  );
}
