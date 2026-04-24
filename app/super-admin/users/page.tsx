'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, RefreshCw, Users } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8080/api/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('فشل تحميل المستخدمين:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><p>جاري التحميل...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadUsers}><RefreshCw className="ml-2 h-4 w-4" />تحديث</Button>
          <Link href="/super-admin/users/new"><Button><Plus className="ml-2 h-4 w-4" />إضافة مستخدم</Button></Link>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>جميع المستخدمين</CardTitle></CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">لا يوجد مستخدمين</p>
              <Link href="/super-admin/users/new"><Button variant="outline" className="mt-4"><Plus className="ml-2 h-4 w-4" />إضافة أول مستخدم</Button></Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>الصيدلية</TableHead>
                  <TableHead>الأدوار</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.tenant?.name || '—'}</TableCell>
                    <TableCell>{u.roles?.map((r: any) => r.name).join(', ')}</TableCell>
                    <TableCell>{u.enabled ? '✅ نشط' : '❌ معطل'}</TableCell>
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
