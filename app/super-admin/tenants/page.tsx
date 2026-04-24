'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, RefreshCw, Building2 } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1/super-admin';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/tenants`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setTenants(data); }
    } catch (error) { console.error('فشل التحميل:', error); } finally { setLoading(false); }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = { 'ACTIVE': 'bg-green-100 text-green-800', 'SUSPENDED': 'bg-yellow-100 text-yellow-800', 'EXPIRED': 'bg-red-100 text-red-800' };
    const labels: Record<string, string> = { 'ACTIVE': 'نشط', 'SUSPENDED': 'موقوف', 'EXPIRED': 'منتهي' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><p>جاري التحميل...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة الصيدليات</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTenants}><RefreshCw className="ml-2 h-4 w-4" />تحديث</Button>
          <Link href="/super-admin/tenants/new"><Button><Plus className="ml-2 h-4 w-4" />إضافة صيدلية</Button></Link>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>جميع الصيدليات المسجلة</CardTitle></CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">لا توجد صيدليات مسجلة</p>
              <Link href="/super-admin/tenants/new"><Button variant="outline" className="mt-4"><Plus className="ml-2 h-4 w-4" />إضافة أول صيدلية</Button></Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>رقم الترخيص</TableHead>
                  <TableHead>المالك</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الباقة</TableHead>
                  <TableHead>انتهاء الاشتراك</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.licenseNumber}</TableCell>
                    <TableCell>{t.ownerName}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.phone}</TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell>{t.plan}</TableCell>
                    <TableCell>{t.subscriptionEnd}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
