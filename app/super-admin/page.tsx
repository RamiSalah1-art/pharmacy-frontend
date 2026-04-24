'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function SuperAdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/super-admin/tenants"><Card className="cursor-pointer hover:shadow-lg"><CardContent className="p-6"><h3 className="font-bold text-lg">إدارة الصيدليات</h3><p className="text-gray-600">عرض وإضافة الصيدليات</p></CardContent></Card></Link>
        <Link href="/super-admin/tenants/new"><Card className="cursor-pointer hover:shadow-lg"><CardContent className="p-6"><h3 className="font-bold text-lg">إضافة صيدلية</h3><p className="text-gray-600">تسجيل صيدلية جديدة</p></CardContent></Card></Link>
      </div>
    </div>
  );
}
