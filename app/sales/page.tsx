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
      console.error('ظپط´ظ„ ط§ظ„ط¨ط­ط«:', error);
    }
  };

  const addToCart = (product: Product) => {
    if (!product.id || !product.sellingPrice) return;
    
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.currentStock) {
        alert('ط§ظ„ظ…ط®ط²ظˆظ† ط؛ظٹط± ظƒط§ظپظچ');
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
      alert('ط§ظ„ظ…ط®ط²ظˆظ† ط؛ظٹط± ظƒط§ظپظچ');
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
      alert('ط§ظ„ط³ظ„ط© ظپط§ط±ط؛ط©');
      return;
    }
    if (amountPaid < total) {
      alert('ط§ظ„ظ…ط¨ظ„ط؛ ط§ظ„ظ…ط¯ظپظˆط¹ ط£ظ‚ظ„ ظ…ظ† ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ');
      return;
    }
    setLoading(true);
    try {
      const sale = {
        customerName: customerName || 'ط¹ظ…ظٹظ„ ظ†ظ‚ط¯ظٹ',
        customerPhone,
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
        discountAmount,
        taxAmount,
        paymentMethod: paymentMethod === 'CASH' ? 'ظ†ظ‚ط¯ط§ظ‹' : 'طھط­ظˆظٹظ„ ط¨ظ†ظƒظٹ',
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
        paymentMethod: paymentMethod === 'CASH' ? 'ظ†ظ‚ط¯ط§ظ‹' : 'طھط­ظˆظٹظ„ ط¨ظ†ظƒظٹ',
        customerName: customerName || 'ط¹ظ…ظٹظ„ ظ†ظ‚ط¯ظٹ'
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
      console.error('ظپط´ظ„ ط¥طھظ…ط§ظ… ط§ظ„ط¨ظٹط¹:', error);
      alert('ظپط´ظ„ ط¥طھظ…ط§ظ… ط§ظ„ط¨ظٹط¹');
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
          <title>ظپط§طھظˆط±ط© ${showReceipt?.invoiceNumber || ''}</title>
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
    if (price === undefined || price === null) return '0 ط¬.ط³';
    return new Intl.NumberFormat('ar-SD', { style: 'currency', currency: 'SDG', minimumFractionDigits: 0 })
      .format(price).replace('SDG', 'ط¬.ط³');
  };

  const getQRValue = () => {
    if (!pharmacySettings) return 'طµظٹط¯ظ„ظٹط©|طھط±ط®ظٹطµ';
    return `${pharmacySettings.pharmacyNameAr} | ${pharmacySettings.licenseNumber} | ${showReceipt?.invoiceNumber || ''}`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="h-8 w-8" />
        ظ†ظ‚ط·ط© ط§ظ„ط¨ظٹط¹ (POS)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>ط§ظ„ط¨ط­ط« ط¹ظ† ظ…ظ†طھط¬</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="ط¨ط­ط« ط¨ط§ظ„ط¨ط§ط±ظƒظˆط¯ ط£ظˆ ط§ظ„ط§ط³ظ…..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pr-10" />
                </div>
                <Button onClick={handleSearch}>ط¨ط­ط«</Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">ط§ظ„ط¨ط§ط±ظƒظˆط¯</TableHead>
                        <TableHead className="text-right">ط§ظ„ط§ط³ظ… ط§ظ„طھط¬ط§ط±ظٹ</TableHead>
                        <TableHead className="text-right">ط§ظ„ط³ط¹ط± (ط¬.ط³)</TableHead>
                        <TableHead className="text-right">ط§ظ„ظ…ط®ط²ظˆظ†</TableHead>
                        <TableHead className="text-center">ط¥ط¶ط§ظپط©</TableHead>
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
                              ط¥ط¶ط§ظپط©
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
            <CardHeader><CardTitle>ط³ظ„ط© ط§ظ„ظ…ط´طھط±ظٹط§طھ</CardTitle></CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ط§ظ„ط³ظ„ط© ظپط§ط±ط؛ط©</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">ط§ظ„ظ…ظ†طھط¬</TableHead>
                      <TableHead className="text-center">ط§ظ„ظƒظ…ظٹط©</TableHead>
                      <TableHead className="text-right">ط³ط¹ط± ط§ظ„ظˆط­ط¯ط©</TableHead>
                      <TableHead className="text-right">ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ</TableHead>
                      <TableHead className="text-center">ط­ط°ظپ</TableHead>
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
            <CardHeader><CardTitle>ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¹ظ…ظٹظ„</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>ط§ط³ظ… ط§ظ„ط¹ظ…ظٹظ„</Label><Input placeholder="ط¹ظ…ظٹظ„ ظ†ظ‚ط¯ظٹ" value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
              <div><Label>ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ</Label><Input placeholder="ط§ط®طھظٹط§ط±ظٹ" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>ط§ظ„ط®طµظ… ظˆط§ظ„ط¶ط±ظٹط¨ط©</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="fixed">ط¬.ط³</SelectItem><SelectItem value="percentage">%</SelectItem></SelectContent>
                </Select>
                <Input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="flex-1" />
              </div>
              <div className="flex gap-2">
                <span className="w-24 text-sm text-gray-600">ط¶ط±ظٹط¨ط© %</span>
                <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="flex-1" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'CASH' | 'BANK_TRANSFER')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="CASH"><Banknote className="ml-2 h-4 w-4" />ظ†ظ‚ط¯ط§ظ‹</TabsTrigger>
                  <TabsTrigger value="BANK_TRANSFER"><CreditCard className="ml-2 h-4 w-4" />طھط­ظˆظٹظ„ ط¨ظ†ظƒظٹ</TabsTrigger>
                </TabsList>
                <TabsContent value="BANK_TRANSFER" className="mt-4">
                  <Label>ط±ظ‚ظ… ظ…ط±ط¬ط¹ ط§ظ„طھط­ظˆظٹظ„</Label>
                  <Input placeholder="ط£ط¯ط®ظ„ ط±ظ‚ظ… ط§ظ„ظ…ط±ط¬ط¹" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>ط§ظ„ط­ط³ط§ط¨ ط§ظ„ظ†ظ‡ط§ط¦ظٹ</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظپط±ط¹ظٹ:</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-green-600"><span>ط§ظ„ط®طµظ…:</span><span>- {formatPrice(discountAmount)}</span></div>
              <div className="flex justify-between text-blue-600"><span>ط§ظ„ط¶ط±ظٹط¨ط©:</span><span>+ {formatPrice(taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ†ظ‡ط§ط¦ظٹ:</span><span>{formatPrice(total)}</span></div>
              <div className="mt-4"><Label>ط§ظ„ظ…ط¨ظ„ط؛ ط§ظ„ظ…ط¯ظپظˆط¹</Label><Input type="number" min="0" value={amountPaid} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} /></div>
              <div className="flex justify-between text-sm"><span>ط§ظ„ط¨ط§ظ‚ظٹ:</span><span className={changeAmount < 0 ? 'text-red-600' : 'text-green-600'}>{formatPrice(changeAmount > 0 ? changeAmount : 0)}</span></div>
              <Button className="w-full mt-4" size="lg" onClick={handleCheckout} disabled={loading || cart.length === 0}>
                {loading ? 'ط¬ط§ط±ظٹ ط§ظ„ظ…ط¹ط§ظ„ط¬ط©...' : 'ط¥طھظ…ط§ظ… ط§ظ„ط¨ظٹط¹'}
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
              طھظ… ط§ظ„ط¨ظٹط¹ ط¨ظ†ط¬ط§ط­!
            </DialogTitle>
          </DialogHeader>
          <div ref={receiptRef} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                {logo ? (
                  <div className="relative w-12 h-12">
                    <Image src={logo} alt="ط´ط¹ط§ط± ط§ظ„طµظٹط¯ظ„ظٹط©" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">طµ</div>
                )}
                <div>
                  <p className="font-bold">{pharmacySettings?.pharmacyNameAr || 'طµظٹط¯ظ„ظٹط© ط§ظ„ط´ظپط§ط،'}</p>
                  <p className="text-xs text-gray-500">طھط±ط®ظٹطµ: {pharmacySettings?.licenseNumber || 'MOH-12345'}</p>
                </div>
              </div>
              <div className="w-16 h-16">
                <QRCodeSVG value={getQRValue()} size={64} bgColor="#ffffff" fgColor="#1e3a8a" level="H" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>ط±ظ‚ظ… ط§ظ„ظپط§طھظˆط±ط©:</span><span className="font-mono">{showReceipt?.invoiceNumber}</span></div>
              <div className="flex justify-between"><span>ط§ظ„طھط§ط±ظٹط®:</span><span>{showReceipt?.invoiceDate && new Date(showReceipt.invoiceDate).toLocaleString('ar-SD')}</span></div>
              <div className="flex justify-between"><span>ط§ظ„ط¹ظ…ظٹظ„:</span><span>{receiptData?.customerName || 'ط¹ظ…ظٹظ„ ظ†ظ‚ط¯ظٹ'}</span></div>
              <div className="border-t pt-2 mt-2">
                {receiptData?.cart.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.tradeName} أ— {item.quantity}</span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between"><span>ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظپط±ط¹ظٹ:</span><span>{formatPrice(receiptData?.subtotal || 0)}</span></div>
                {(receiptData?.discountAmount || 0) > 0 && <div className="flex justify-between text-green-600"><span>ط§ظ„ط®طµظ…:</span><span>- {formatPrice(receiptData?.discountAmount || 0)}</span></div>}
                {(receiptData?.taxAmount || 0) > 0 && <div className="flex justify-between text-blue-600"><span>ط§ظ„ط¶ط±ظٹط¨ط©:</span><span>+ {formatPrice(receiptData?.taxAmount || 0)}</span></div>}
                <div className="flex justify-between font-bold"><span>ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ†ظ‡ط§ط¦ظٹ:</span><span>{formatPrice(receiptData?.total || 0)}</span></div>
                <div className="flex justify-between"><span>ط§ظ„ظ…ط¯ظپظˆط¹:</span><span>{formatPrice(receiptData?.amountPaid || 0)}</span></div>
                <div className="flex justify-between"><span>ط§ظ„ط¨ط§ظ‚ظٹ:</span><span>{formatPrice((receiptData && receiptData.changeAmount && receiptData.changeAmount > 0 ? receiptData.changeAmount : 0))}</span></div>
                <div className="flex justify-between"><span>ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹:</span><span>{receiptData?.paymentMethod}</span></div>
              </div>
            </div>
            <div className="text-center text-xs text-gray-500 border-t pt-3">
              {pharmacySettings?.invoiceFooterMessage || 'ط´ظƒط±ط§ظ‹ ظ„ط²ظٹط§ط±طھظƒظ… .. ظ†طھظ…ظ†ظ‰ ظ„ظƒظ… ط¯ظˆط§ظ… ط§ظ„طµط­ط© ظˆط§ظ„ط¹ط§ظپظٹط©'}
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              ط·ط¨ط§ط¹ط© ط§ظ„ظپط§طھظˆط±ط©
            </Button>
            <Button onClick={() => { setShowReceipt(null); setReceiptData(null); }}>ط­ط³ظ†ط§ظ‹</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
