'use client';

import { useEffect, useState, useRef } from 'react';
import { productApi, saleApi, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Trash2, ShoppingCart, CreditCard, Banknote, CheckCircle, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface CartItem {
  productId: number;
  barcode: string;
  tradeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currentStock: number;
}

export default function SalesPage() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showReceipt, setShowReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pharmacySettings, setPharmacySettings] = useState<any>(null);
  const [logo, setLogo] = useState<string>('');
  
  const [receiptData, setReceiptData] = useState<{
    cart: CartItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    changeAmount: number;
    paymentMethod: string;
    customerName: string;
  } | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pharmacySettings');
    if (savedSettings) {
      try {
        setPharmacySettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
    const savedLogo = localStorage.getItem('pharmacyLogo');
    if (savedLogo) setLogo(savedLogo);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;
  const changeAmount = amountPaid - total;

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const results = await productApi.search(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('فشل البحث:', error);
    }
  };

  const addToCart = (product: Product) => {
    if (!product.id || !product.sellingPrice) return;
    
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        alert('المخزون غير كافٍ');
        return;
      }
      setCart(cart.map(item => item.productId === product.id ? {
        ...item,
        quantity: item.quantity + 1,
        totalPrice: (item.quantity + 1) * item.unitPrice
      } : item));
    } else {
      setCart([...cart, {
        productId: product.id,
        barcode: product.barcode,
        tradeName: product.tradeName,
        quantity: 1,
        unitPrice: product.sellingPrice,
        totalPrice: product.sellingPrice,
        currentStock: product.currentStock
      }]);
    }
    setSearchResults([]);
    setSearchTerm('');
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    if (quantity > item.currentStock) {
      alert('المخزون غير كافٍ');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(i => i.productId === productId ? {
      ...i,
      quantity,
      totalPrice: quantity * i.unitPrice
    } : i));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(i => i.productId !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة');
      return;
    }
    if (amountPaid < total) {
      alert('المبلغ المدفوع أقل من الإجمالي');
      return;
    }
    setLoading(true);
    try {
      const sale = {
        customerName: customerName || 'عميل نقدي',
        customerPhone,
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
        discountAmount,
        taxAmount,
        paymentMethod: paymentMethod === 'CASH' ? 'نقداً' : 'تحويل بنكي',
        paymentReference: paymentReference || null,
        amountPaid
      };
      const result = await saleApi.create(sale);
      
      setReceiptData({
        cart: [...cart],
        subtotal,
        discountAmount,
        taxAmount,
        total,
        amountPaid,
        changeAmount,
        paymentMethod: paymentMethod === 'CASH' ? 'نقداً' : 'تحويل بنكي',
        customerName: customerName || 'عميل نقدي'
      });
      
      setShowReceipt(result);
      setCart([]);
      setAmountPaid(0);
      setDiscountValue(0);
      setTaxRate(0);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentReference('');
    } catch (error) {
      console.error('فشل إتمام البيع:', error);
      alert('فشل إتمام البيع');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const receiptHTML = receiptRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>فاتورة ${showReceipt?.invoiceNumber || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { max-width: 350px; margin: 0 auto; }
            @media print { body { padding: 0; } }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div class="receipt">${receiptHTML}</div>
          <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return '0 ج.س';
    return new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG', minimumFractionDigits: 0 })
      .format(price).replace('SDG', 'ج.س');
  };

  const getQRValue = () => {
    if (!pharmacySettings) return 'صيدلية|ترخيص';
    return `${pharmacySettings.pharmacyNameAr} | ${pharmacySettings.licenseNumber} | ${showReceipt?.invoiceNumber || ''}`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="h-8 w-8" />
        نقطة البيع (POS)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>البحث عن منتج</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="بحث بالباركود أو الاسم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pr-10" />
                </div>
                <Button onClick={handleSearch}>بحث</Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الباركود</TableHead>
                        <TableHead className="text-right">الاسم التجاري</TableHead>
                        <TableHead className="text-right">السعر (ج.س)</TableHead>
                        <TableHead className="text-right">المخزون</TableHead>
                        <TableHead className="text-center">إضافة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono">{p.barcode}</TableCell>
                          <TableCell className="font-medium">{p.tradeName}</TableCell>
                          <TableCell>{formatPrice(p.sellingPrice || 0)}</TableCell>
                          <TableCell>
                            <span className={p.currentStock <= (p.reorderLevel || 10) ? 'text-red-600 font-semibold' : ''}>
                              {p.currentStock}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button size="sm" variant="outline" onClick={() => addToCart(p)} disabled={p.currentStock <= 0} className="gap-1">
                              <Plus className="h-4 w-4" />
                              إضافة
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>سلة المشتريات</CardTitle></CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">السلة فارغة</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-right">سعر الوحدة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-center">حذف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.tradeName}</TableCell>
                        <TableCell className="text-center">
                          <Input type="number" min="1" max={item.currentStock} value={item.quantity} onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)} className="w-20 mx-auto text-center" />
                        </TableCell>
                        <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell>{formatPrice(item.totalPrice)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.productId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>بيانات العميل</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>اسم العميل</Label><Input placeholder="عميل نقدي" value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
              <div><Label>رقم الهاتف</Label><Input placeholder="اختياري" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الخصم والضريبة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="fixed">ج.س</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent>
                </Select>
                <Input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="flex-1" />
              </div>
              <div className="flex gap-2">
                <span className="w-24 text-sm text-gray-600">ضريبة %</span>
                <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="flex-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>طريقة الدفع</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'CASH' | 'BANK_TRANSFER')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="CASH"><Banknote className="ml-2 h-4 w-4" />نقداً</TabsTrigger>
                  <TabsTrigger value="BANK_TRANSFER"><CreditCard className="ml-2 h-4 w-4" />تحويل بنكي</TabsTrigger>
                </TabsList>
                <TabsContent value="BANK_TRANSFER" className="mt-4">
                  <Label>رقم مرجع التحويل</Label>
                  <Input placeholder="أدخل رقم المرجع" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الحساب النهائي</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>الإجمالي الفرعي:</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-green-600"><span>الخصم:</span><span>- {formatPrice(discountAmount)}</span></div>
              <div className="flex justify-between text-blue-600"><span>الضريبة:</span><span>+ {formatPrice(taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>الإجمالي النهائي:</span><span>{formatPrice(total)}</span></div>
              <div className="mt-4"><Label>المبلغ المدفوع</Label><Input type="number" min="0" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} /></div>
              <div className="flex justify-between text-sm"><span>الباقي:</span><span className={changeAmount < 0 ? 'text-red-600' : 'text-green-600'}>{formatPrice(changeAmount > 0 ? changeAmount : 0)}</span></div>
              <Button className="w-full mt-4" size="lg" onClick={handleCheckout} disabled={loading || cart.length === 0}>
                {loading ? 'جاري المعالجة...' : 'إتمام البيع'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!showReceipt} onOpenChange={() => setShowReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              تم البيع بنجاح!
            </DialogTitle>
          </DialogHeader>
          <div ref={receiptRef} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                {logo ? (
                  <div className="relative w-12 h-12">
                    <Image src={logo} alt="شعار الصيدلية" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">ص</div>
                )}
                <div>
                  <p className="font-bold">{pharmacySettings?.pharmacyNameAr || 'صيدلية الشفاء'}</p>
                  <p className="text-xs text-gray-500">ترخيص: {pharmacySettings?.licenseNumber || 'MOH-12345'}</p>
                </div>
              </div>
              <div className="w-16 h-16">
                <QRCodeSVG value={getQRValue()} size={64} bgColor="#ffffff" fgColor="#1e3a8a" level="H" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>رقم الفاتورة:</span><span className="font-mono">{showReceipt?.invoiceNumber}</span></div>
              <div className="flex justify-between"><span>التاريخ:</span><span>{showReceipt?.invoiceDate && new Date(showReceipt.invoiceDate).toLocaleString('ar-SD')}</span></div>
              <div className="flex justify-between"><span>العميل:</span><span>{receiptData?.customerName || 'عميل نقدي'}</span></div>
              <div className="border-t pt-2 mt-2">
                {receiptData?.cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.tradeName} × {item.quantity}</span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between"><span>الإجمالي الفرعي:</span><span>{formatPrice(receiptData?.subtotal || 0)}</span></div>
                {(receiptData?.discountAmount || 0) > 0 && <div className="flex justify-between text-green-600"><span>الخصم:</span><span>- {formatPrice(receiptData?.discountAmount || 0)}</span></div>}
                {(receiptData?.taxAmount || 0) > 0 && <div className="flex justify-between text-blue-600"><span>الضريبة:</span><span>+ {formatPrice(receiptData?.taxAmount || 0)}</span></div>}
                <div className="flex justify-between font-bold"><span>الإجمالي النهائي:</span><span>{formatPrice(receiptData?.total || 0)}</span></div>
                <div className="flex justify-between"><span>المدفوع:</span><span>{formatPrice(receiptData?.amountPaid || 0)}</span></div>
                <div className="flex justify-between"><span>الباقي:</span><span>{formatPrice(receiptData?.changeAmount > 0 ? receiptData.changeAmount : 0)}</span></div>
                <div className="flex justify-between"><span>طريقة الدفع:</span><span>{receiptData?.paymentMethod}</span></div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500 border-t pt-3">
              {pharmacySettings?.invoiceFooterMessage || 'شكراً لزيارتكم .. نتمنى لكم دوام الصحة والعافية'}
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              طباعة الفاتورة
            </Button>
            <Button onClick={() => { setShowReceipt(null); setReceiptData(null); }}>حسناً</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
