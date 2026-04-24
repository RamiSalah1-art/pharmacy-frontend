'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({ barcode: '', scientificName: '', tradeName: '', category: '', manufacturer: '', costPrice: 0, currentStock: 0, reorderLevel: 10, expiryDate: '', prescriptionRequired: false, isActive: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await productApi.create(formData as Product); router.push('/products'); } catch (error) { alert('فشل إضافة المنتج'); } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6"><Link href="/products" className="flex items-center text-gray-600 hover:text-gray-900"><ArrowRight className="ml-2 h-4 w-4" />العودة للمنتجات</Link></div>
      <Card>
        <CardHeader><CardTitle>إضافة منتج جديد</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="barcode">الباركود *</Label><Input id="barcode" required value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} /></div>
              <div><Label htmlFor="tradeName">الاسم التجاري *</Label><Input id="tradeName" required value={formData.tradeName} onChange={(e) => setFormData({...formData, tradeName: e.target.value})} /></div>
              <div><Label htmlFor="scientificName">الاسم العلمي *</Label><Input id="scientificName" required value={formData.scientificName} onChange={(e) => setFormData({...formData, scientificName: e.target.value})} /></div>
              <div><Label htmlFor="category">التصنيف</Label><Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} /></div>
              <div><Label htmlFor="manufacturer">الشركة المصنعة</Label><Input id="manufacturer" value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} /></div>
              <div><Label htmlFor="costPrice">سعر الشراء (ج.س) *</Label><Input id="costPrice" type="number" step="0.01" required value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value)})} /></div>
              <div><Label htmlFor="currentStock">المخزون الحالي *</Label><Input id="currentStock" type="number" required value={formData.currentStock} onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value)})} /></div>
              <div><Label htmlFor="reorderLevel">حد إعادة الطلب</Label><Input id="reorderLevel" type="number" value={formData.reorderLevel} onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value)})} /></div>
              <div><Label htmlFor="expiryDate">تاريخ انتهاء الصلاحية</Label><Input id="expiryDate" type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 space-x-reverse"><Checkbox id="prescriptionRequired" checked={formData.prescriptionRequired} onCheckedChange={(checked) => setFormData({...formData, prescriptionRequired: !!checked})} /><Label htmlFor="prescriptionRequired">يتطلب وصفة طبية</Label></div>
              <div className="flex items-center space-x-2 space-x-reverse"><Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})} /><Label htmlFor="isActive">نشط</Label></div>
            </div>
            <div className="flex justify-end gap-4">
              <Link href="/products"><Button type="button" variant="outline">إلغاء</Button></Link>
              <Button type="submit" disabled={loading}><Save className="ml-2 h-4 w-4" />{loading ? 'جاري الحفظ...' : 'حفظ المنتج'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
