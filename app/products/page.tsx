'use client';

import { useEffect, useState } from 'react';
import { productApi, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const data = await productApi.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('فشل تحميل المنتجات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) { setFilteredProducts(products); return; }
    const filtered = products.filter(p => p.tradeName.toLowerCase().includes(value.toLowerCase()) || p.scientificName.toLowerCase().includes(value.toLowerCase()) || p.barcode.includes(value));
    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try { await productApi.delete(id); loadProducts(); } catch (error) { console.error('فشل حذف المنتج:', error); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG', minimumFractionDigits: 0 }).format(price).replace('SDG', 'ج.س');

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">جاري التحميل...</p></div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Link href="/products/new"><Button><Plus className="ml-2 h-4 w-4" />إضافة منتج جديد</Button></Link>
      </div>
      <Card>
        <CardHeader><CardTitle>قائمة المنتجات</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="بحث بالاسم أو الباركود..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pr-10" />
          </div>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">لا توجد منتجات</p>
              <Link href="/products/new"><Button variant="outline" className="mt-4"><Plus className="ml-2 h-4 w-4" />إضافة أول منتج</Button></Link>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الباركود</TableHead>
                    <TableHead className="text-right">الاسم التجاري</TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                    <TableHead className="text-right">سعر الشراء</TableHead>
                    <TableHead className="text-right">سعر البيع</TableHead>
                    <TableHead className="text-right">المخزون</TableHead>
                    <TableHead className="text-right">الصلاحية</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell className="font-medium">{product.tradeName}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell>{formatPrice(product.costPrice)}</TableCell>
                      <TableCell>{formatPrice(product.sellingPrice || 0)}</TableCell>
                      <TableCell><span className={product.currentStock <= product.reorderLevel ? 'text-red-600 font-semibold' : ''}>{product.currentStock}</span></TableCell>
                      <TableCell>{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('ar-SD') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/products/${product.id}/edit`)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id!)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
