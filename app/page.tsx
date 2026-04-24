'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, ArrowLeft, Plus, Search, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { productApi, Product } from '@/lib/api';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Image from 'next/image';

const API_URL = 'http://localhost:8080/api/v1';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expiring: 0,
    todaySales: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pharmacySettings, setPharmacySettings] = useState<any>(null);
  const [logo, setLogo] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pharmacySettings');
    if (savedSettings) {
      try {
        setPharmacySettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
    const savedLogo = localStorage.getItem('pharmacyLogo');
    if (savedLogo) setLogo(savedLogo);
    
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const products = await productApi.getAll();
      const lowStockCount = products.filter(p => p.currentStock <= p.reorderLevel).length;
      const expiringCount = products.filter(p => p.expiryDate && p.expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).length;
      
      setRecentProducts(products.slice(0, 5));
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const todayRes = await fetch(`${API_URL}/reports/daily?date=${today}`);
        const todayData = await todayRes.json();
        
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const monthRes = await fetch(`${API_URL}/reports/monthly?year=${year}&month=${month}`);
        const monthData = await monthRes.json();
        
        setStats({
          totalProducts: products.length,
          lowStock: lowStockCount,
          expiring: expiringCount,
          todaySales: todayData.invoiceCount || 0,
          todayRevenue: todayData.totalSales || 0,
          monthlyRevenue: monthData.reduce((sum: number, d: any) => sum + (d.total || 0), 0)
        });
        
        if (monthData && monthData.length > 0) {
          const last7Days = monthData.slice(-7).map((d: any) => ({
            day: d.day,
            total: d.total || 0
          }));
          setChartData(last7Days);
        } else {
          setChartData(generateDemoChartData());
        }
      } catch (e) {
        setStats({
          totalProducts: products.length,
          lowStock: lowStockCount,
          expiring: expiringCount,
          todaySales: 0,
          todayRevenue: 0,
          monthlyRevenue: 0
        });
        setChartData(generateDemoChartData());
      }
    } catch (error) {
      console.error('فشل تحميل البيانات:', error);
      setChartData(generateDemoChartData());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoChartData = () => {
    return [
      { day: 'السبت', total: 18500 },
      { day: 'الأحد', total: 22300 },
      { day: 'الاثنين', total: 15600 },
      { day: 'الثلاثاء', total: 27800 },
      { day: 'الأربعاء', total: 34200 },
      { day: 'الخميس', total: 41000 },
      { day: 'الجمعة', total: 36500 },
    ];
  };

  const formatPrice = (price: number) => {
    if (!price) return '0 ج.س';
    return new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG', minimumFractionDigits: 0 })
      .format(price).replace('SDG', 'ج.س');
  };

  const statCards = [
    { title: 'إجمالي المنتجات', value: stats.totalProducts, icon: Package, color: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50', link: '/products' },
    { title: 'مبيعات اليوم', value: stats.todaySales, icon: ShoppingCart, color: 'from-emerald-500 to-teal-500', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', link: '/sales' },
    { title: 'إيرادات اليوم', value: formatPrice(stats.todayRevenue), icon: DollarSign, color: 'from-amber-500 to-orange-500', bg: 'bg-gradient-to-br from-amber-50 to-orange-50', link: '/reports' },
    { title: 'مخزون منخفض', value: stats.lowStock, icon: TrendingDown, color: 'from-rose-500 to-red-500', bg: 'bg-gradient-to-br from-rose-50 to-red-50', link: '/products?filter=low-stock' },
    { title: 'قارب الانتهاء', value: stats.expiring, icon: AlertTriangle, color: 'from-orange-500 to-amber-500', bg: 'bg-gradient-to-br from-orange-50 to-amber-50', link: '/products?filter=expiring' },
    { title: 'إيرادات الشهر', value: formatPrice(stats.monthlyRevenue), icon: TrendingUp, color: 'from-purple-500 to-indigo-500', bg: 'bg-gradient-to-br from-purple-50 to-indigo-50', link: '/reports' },
  ];

  const quickActions = [
    { title: 'إضافة منتج', icon: Plus, color: 'from-blue-500 to-indigo-600', link: '/products/new' },
    { title: 'نقطة البيع', icon: ShoppingCart, color: 'from-emerald-500 to-green-600', link: '/sales' },
    { title: 'بحث عن منتج', icon: Search, color: 'from-purple-500 to-pink-600', link: '/products' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...chartData.map(d => d.total), 1000);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logo ? (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
              <Image src={logo} alt="شعار الصيدلية" fill className="object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">ص</div>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">لوحة التحكم</h1>
            <p className="text-gray-500 font-medium">{pharmacySettings?.pharmacyNameAr || 'صيدلية الشفاء'}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full">
          <p className="text-sm text-gray-700 font-medium">{new Date().toLocaleDateString('ar-SD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.link}>
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${action.color} p-5 flex items-center justify-between group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-white font-bold text-lg">{action.title}</span>
                  <action.icon className="h-8 w-8 text-white opacity-80" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Link key={i} href={stat.link}>
            <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 ${stat.bg}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">مبيعات آخر 7 أيام</CardTitle>
              </div>
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/50">
                  عرض الكل <ArrowLeft className="mr-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                    padding: '12px 16px'
                  }}
                  formatter={(value: number) => [formatPrice(value), 'المبيعات']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}
                />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-600">أعلى مبيعات: {formatPrice(maxTotal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                <span className="text-sm text-gray-600">متوسط: {formatPrice(chartData.reduce((sum, d) => sum + d.total, 0) / chartData.length)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">آخر المنتجات المضافة</CardTitle>
              </div>
              <Link href="/products">
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-white/50">
                  عرض الكل <ArrowLeft className="mr-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentProducts.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-right font-bold text-gray-700 py-4">الاسم التجاري</TableHead>
                    <TableHead className="text-right font-bold text-gray-700 py-4">السعر</TableHead>
                    <TableHead className="text-right font-bold text-gray-700 py-4">المخزون</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProducts.map((p, idx) => (
                    <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                            {p.tradeName.charAt(0)}
                          </div>
                          {p.tradeName}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-gray-800">{formatPrice(p.sellingPrice || 0)}</TableCell>
                      <TableCell className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.currentStock <= p.reorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {p.currentStock}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">لا توجد منتجات حتى الآن</p>
                <Link href="/products/new">
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة أول منتج
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
