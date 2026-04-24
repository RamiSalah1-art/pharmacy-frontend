'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, FileText, Download, FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:8080/api/v1/reports';

export default function ReportsPage() {
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pharmacySettings, setPharmacySettings] = useState<any>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pharmacySettings');
    if (savedSettings) {
      try { setPharmacySettings(JSON.parse(savedSettings)); } catch (e) {}
    }
    fetchDailyReport();
  }, [dailyDate]);

  useEffect(() => {
    fetchMonthlyReport();
  }, [monthlyYear, monthlyMonth]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/daily?date=${dailyDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDailyReport(data);
    } catch (error) {
      console.error('فشل تحميل التقرير اليومي:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/monthly?year=${monthlyYear}&month=${monthlyMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMonthlyReport(data);
    } catch (error) {
      console.error('فشل تحميل التقرير الشهري:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '0 ج.س';
    return new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG', minimumFractionDigits: 0 })
      .format(price).replace('SDG', 'ج.س');
  };

  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const exportToExcel = (type: 'daily' | 'monthly') => {
    let data: any[] = [];
    let fileName = '';

    if (type === 'daily' && dailyReport) {
      data = dailyReport.sales || [];
      fileName = `تقرير_يومي_${dailyDate}.xlsx`;
    } else if (type === 'monthly' && monthlyReport) {
      data = monthlyReport;
      fileName = `تقرير_شهري_${monthNames[monthlyMonth-1]}_${monthlyYear}.xlsx`;
    }

    if (data.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'التقرير');
    XLSX.writeFile(wb, fileName);
  };

  const printReport = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />التقارير والتحليلات</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToExcel('daily')}><FileSpreadsheet className="ml-2 h-4 w-4" />Excel</Button>
          <Button variant="outline" size="sm" onClick={handleSaveAsPDF}><Printer className="ml-2 h-4 w-4" />PDF</Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily"><Calendar className="ml-2 h-4 w-4" />تقرير يومي</TabsTrigger>
          <TabsTrigger value="monthly"><TrendingUp className="ml-2 h-4 w-4" />تقرير شهري</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>تقرير يومي - {dailyDate}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToExcel('daily')}><Download className="ml-2 h-4 w-4" />تصدير Excel</Button>
                  <Button variant="outline" size="sm" onClick={printReport}><Printer className="ml-2 h-4 w-4" />طباعة</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 items-end">
                <div><Label>التاريخ</Label><Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} /></div>
                <Button onClick={fetchDailyReport} disabled={loading}>عرض التقرير</Button>
              </div>
              {dailyReport && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">عدد الفواتير</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{dailyReport.invoiceCount || 0}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">إجمالي المبيعات</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatPrice(dailyReport.totalSales || 0)}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">إجمالي الأرباح</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{formatPrice(dailyReport.totalProfit || 0)}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">متوسط الفاتورة</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatPrice(dailyReport.invoiceCount > 0 ? dailyReport.totalSales / dailyReport.invoiceCount : 0)}</div></CardContent></Card>
                  </div>

                  {dailyReport.sales && dailyReport.sales.length > 0 && (
                    <div className="print:block">
                      <h3 className="font-bold text-lg mb-4">تفاصيل الفواتير</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>رقم الفاتورة</TableHead>
                            <TableHead>الوقت</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead>الإجمالي</TableHead>
                            <TableHead>طريقة الدفع</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyReport.sales.map((sale: any) => (
                            <TableRow key={sale.id}>
                              <TableCell>{sale.invoiceNumber}</TableCell>
                              <TableCell>{new Date(sale.invoiceDate).toLocaleTimeString('ar-SD')}</TableCell>
                              <TableCell>{sale.customerName || 'عميل نقدي'}</TableCell>
                              <TableCell>{formatPrice(sale.totalAmount)}</TableCell>
                              <TableCell>{sale.paymentMethod}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>تقرير شهري - {monthNames[monthlyMonth - 1]} {monthlyYear}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportToExcel('monthly')}><Download className="ml-2 h-4 w-4" />تصدير Excel</Button>
                  <Button variant="outline" size="sm" onClick={printReport}><Printer className="ml-2 h-4 w-4" />طباعة</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 items-end">
                <div><Label>السنة</Label><Input type="number" value={monthlyYear} onChange={(e) => setMonthlyYear(parseInt(e.target.value))} /></div>
                <div><Label>الشهر</Label><select className="border rounded-md p-2" value={monthlyMonth} onChange={(e) => setMonthlyMonth(parseInt(e.target.value))}>{monthNames.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}</select></div>
                <Button onClick={fetchMonthlyReport} disabled={loading}>عرض التقرير</Button>
              </div>
              {monthlyReport.length > 0 && (
                <>
                  <div className="h-80 print:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyReport}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatPrice(Number(value))} />
                        <Legend />
                        <Bar dataKey="total" fill="#10b981" name="المبيعات (ج.س)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اليوم</TableHead>
                        <TableHead>عدد الفواتير</TableHead>
                        <TableHead>الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyReport.map((d: any) => (
                        <TableRow key={d.day}>
                          <TableCell>{d.day}</TableCell>
                          <TableCell>{d.count || 0}</TableCell>
                          <TableCell>{formatPrice(d.total || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .container, .container * { visibility: visible; }
          button, .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          h1, h3, table { visibility: visible; }
        }
      `}</style>
    </div>
  );
}
