'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1';

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '', phone: '',
    tenantId: '', roles: ['PHARMACIST'], enabled: true
  });

  useEffect(() => {
    const loadTenants = async () => {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8080/api/v1/super-admin/tenants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    };
    loadTenants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('سيتم ربط إضافة المستخدم بالباك-إند قريباً');
    router.push('/super-admin/users');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/users" className="flex items-center text-gray-600">
          <ArrowRight className="ml-2 h-4 w-4" />العودة
        </Link>
        <h1 className="text-2xl font-bold">إضافة مستخدم جديد</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>بيانات المستخدم</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>اسم المستخدم *</Label><Input required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} /></div>
              <div><Label>كلمة المرور *</Label><Input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
              <div><Label>الاسم الكامل *</Label><Input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} /></div>
              <div><Label>رقم الهاتف</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <div><Label>الصيدلية</Label><Select value={formData.tenantId} onValueChange={(v) => setFormData({...formData, tenantId: v})}><SelectTrigger><SelectValue placeholder="اختر الصيدلية" /></SelectTrigger><SelectContent>{tenants.map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>الدور *</Label><Select value={formData.roles[0]} onValueChange={(v) => setFormData({...formData, roles: [v]})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ADMIN">مدير</SelectItem><SelectItem value="PHARMACIST">صيدلي</SelectItem><SelectItem value="ACCOUNTANT">محاسب</SelectItem><SelectItem value="STOCK_KEEPER">أمين مستودع</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end gap-4">
              <Link href="/super-admin/users"><Button type="button" variant="outline">إلغاء</Button></Link>
              <Button type="submit" disabled={loading}><Save className="ml-2 h-4 w-4" />حفظ</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
