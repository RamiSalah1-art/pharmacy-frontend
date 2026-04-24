'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Building2, Settings, LogOut } from 'lucide-react';
import { isSuperAdmin, logout } from '@/lib/auth';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => { if (!isSuperAdmin()) router.push('/'); }, [router]);
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white p-4"><div className="container mx-auto flex justify-between"><h1 className="text-xl font-bold">ديوان التقنية - لوحة التحكم الرئيسية</h1><Button variant="ghost" className="text-white" onClick={logout}><LogOut className="ml-2 h-4 w-4" />تسجيل الخروج</Button></div></header>
      <div className="flex">
        <aside className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-2">
            <Link href="/super-admin" className="flex items-center gap-3 text-gray-300 hover:text-white p-3"><LayoutDashboard />لوحة التحكم</Link>
            <Link href="/super-admin/tenants" className="flex items-center gap-3 text-gray-300 hover:text-white p-3"><Building2 />إدارة الصيدليات</Link>
            <Link href="/super-admin/users" className="flex items-center gap-3 text-gray-300 hover:text-white p-3"><Users />إدارة المستخدمين</Link>
            <Link href="/super-admin/settings" className="flex items-center gap-3 text-gray-300 hover:text-white p-3"><Settings />الإعدادات</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
