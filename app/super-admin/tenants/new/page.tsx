'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save } from 'lucide-react';

const API_URL = 'http://localhost:8080/api/v1/super-admin';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    ownerName: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    subscriptionStart: new Date().toISOString().split('T')[0],
    subscriptionEnd: '',
    plan: 'BASIC'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push('/super-admin/tenants');
      } else {
        alert('فشل إضافة الصيدلية');
      }
    } catch (error) {
      alert('فشل إضافة الصيدلية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/tenants" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للقائمة
        </Link>
        <h1 className="text-2xl font-bold">إضافة صيدلية جديدة</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>بيانات الصيدلية</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="name">اسم الصيدلية *</Label><Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
              <div><Label htmlFor="licenseNumber">رقم الترخيص *</Label><Input id="licenseNumber" required value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} /></div>
              <div><Label htmlFor="ownerName">اسم المالك *</Label><Input id="ownerName" required value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} /></div>
              <div><Label htmlFor="email">البريد الإلكتروني</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
              <div><Label htmlFor="phone">رقم الهاتف</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
              <div><Label htmlFor="status">الحالة *</Label><Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">نشط</SelectItem><SelectItem value="SUSPENDED">موقوف</SelectItem><SelectItem value="EXPIRED">منتهي</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="plan">الباقة *</Label><Select value={formData.plan} onValueChange={(v) => setFormData({...formData, plan: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BASIC">أساسية</SelectItem><SelectItem value="ADVANCED">متقدمة</SelectItem><SelectItem value="PREMIUM">كاملة</SelectItem></SelectContent></Select></div>
              <div><Label htmlFor="subscriptionStart">تاريخ بدء الاشتراك *</Label><Input id="subscriptionStart" type="date" required value={formData.subscriptionStart} onChange={(e) => setFormData({...formData, subscriptionStart: e.target.value})} /></div>
              <div><Label htmlFor="subscriptionEnd">تاريخ انتهاء الاشتراك *</Label><Input id="subscriptionEnd" type="date" required value={formData.subscriptionEnd} onChange={(e) => setFormData({...formData, subscriptionEnd: e.target.value})} /></div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/super-admin/tenants"><Button type="button" variant="outline">إلغاء</Button></Link>
              <Button type="submit" disabled={loading}><Save className="ml-2 h-4 w-4" />{loading ? 'جاري الحفظ...' : 'حفظ الصيدلية'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
