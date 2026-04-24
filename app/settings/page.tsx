'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Building2, CreditCard, FileText, CheckCircle, QrCode, Upload, Image as ImageIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface PharmacySettings {
  pharmacyNameAr: string;
  pharmacyNameEn: string;
  licenseNumber: string;
  address: string;
  phoneNumbers: string;
  email: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  returnPolicy: string;
  invoiceFooterMessage: string;
  logoUrl: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PharmacySettings>({
    pharmacyNameAr: 'صيدلية الشفاء',
    pharmacyNameEn: 'Al Shifa Pharmacy',
    licenseNumber: 'MOH-12345-KSA',
    address: 'الخرطوم - شارع النيل',
    phoneNumbers: '0123456789',
    email: 'info@alshifa.sd',
    bankName: 'بنك الخرطوم',
    bankAccountNumber: '1234567890',
    bankAccountName: 'صيدلية الشفاء',
    returnPolicy: 'يمكن إرجاع الأدوية خلال 3 أيام مع الفاتورة الأصلية',
    invoiceFooterMessage: 'شكراً لزيارتكم .. نتمنى لكم دوام الصحة والعافية',
    logoUrl: ''
  });
  const [qrValue, setQrValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    updateQRCode();
    if (settings.logoUrl) {
      localStorage.setItem('pharmacyLogo', settings.logoUrl);
      window.dispatchEvent(new Event('logoUpdated'));
    }
  }, [settings.pharmacyNameAr, settings.licenseNumber, settings.logoUrl]);

  const loadSettings = () => {
    const saved = localStorage.getItem('pharmacySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        if (parsed.logoUrl) setPreviewLogo(parsed.logoUrl);
      } catch (e) {}
    }
  };

  const updateQRCode = () => {
    const data = `الصيدلية: ${settings.pharmacyNameAr}
الترخيص: ${settings.licenseNumber}
هاتف: ${settings.phoneNumbers}
${settings.address}`;
    setQrValue(data);
  };

  const handleSave = () => {
    localStorage.setItem('pharmacySettings', JSON.stringify(settings));
    if (settings.logoUrl) localStorage.setItem('pharmacyLogo', settings.logoUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: keyof PharmacySettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSettings(prev => ({ ...prev, logoUrl: base64 }));
        setPreviewLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Building2 className="h-8 w-8" />إعدادات النظام</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="pharmacy" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pharmacy"><Building2 className="ml-2 h-4 w-4" />الصيدلية</TabsTrigger>
              <TabsTrigger value="logo"><ImageIcon className="ml-2 h-4 w-4" />الشعار</TabsTrigger>
              <TabsTrigger value="bank"><CreditCard className="ml-2 h-4 w-4" />البنك</TabsTrigger>
              <TabsTrigger value="invoice"><FileText className="ml-2 h-4 w-4" />الفواتير</TabsTrigger>
            </TabsList>

            <TabsContent value="pharmacy" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>بيانات الصيدلية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>اسم الصيدلية (عربي)</Label><Input value={settings.pharmacyNameAr} onChange={(e) => handleChange('pharmacyNameAr', e.target.value)} /></div>
                    <div><Label>اسم الصيدلية (إنجليزي)</Label><Input value={settings.pharmacyNameEn} onChange={(e) => handleChange('pharmacyNameEn', e.target.value)} /></div>
                    <div><Label>رقم الترخيص الصحي</Label><Input value={settings.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} /></div>
                    <div><Label>أرقام الهواتف</Label><Input value={settings.phoneNumbers} onChange={(e) => handleChange('phoneNumbers', e.target.value)} placeholder="0112345678, 0912345678" /></div>
                  </div>
                  <div><Label>العنوان</Label><Input value={settings.address} onChange={(e) => handleChange('address', e.target.value)} /></div>
                  <div><Label>البريد الإلكتروني</Label><Input type="email" value={settings.email} onChange={(e) => handleChange('email', e.target.value)} /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logo" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>شعار الصيدلية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">ارفع شعار الصيدلية. سيظهر في جميع الصفحات وفي الفاتورة</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {previewLogo ? (
                      <div className="space-y-4">
                        <div className="relative w-32 h-32 mx-auto">
                          <Image src={previewLogo} alt="شعار الصيدلية" fill className="object-contain" />
                        </div>
                        <Button variant="outline" onClick={() => { setSettings(prev => ({ ...prev, logoUrl: '' })); setPreviewLogo(''); }}>إزالة الشعار</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                        <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100">
                          <Upload className="h-4 w-4" /> اختر صورة
                        </Label>
                        <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>بيانات الحساب البنكي</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>اسم البنك</Label><Select value={settings.bankName} onValueChange={(v) => handleChange('bankName', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="بنك الخرطوم">بنك الخرطوم</SelectItem><SelectItem value="بنك فيصل الإسلامي">بنك فيصل الإسلامي</SelectItem><SelectItem value="بنك أم درمان الوطني">بنك أم درمان الوطني</SelectItem><SelectItem value="بنك النيلين">بنك النيلين</SelectItem><SelectItem value="البنك الزراعي">البنك الزراعي</SelectItem></SelectContent></Select></div>
                  <div><Label>اسم صاحب الحساب</Label><Input value={settings.bankAccountName} onChange={(e) => handleChange('bankAccountName', e.target.value)} /></div>
                  <div><Label>رقم الحساب</Label><Input value={settings.bankAccountNumber} onChange={(e) => handleChange('bankAccountNumber', e.target.value)} /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoice" className="space-y-6">
              <Card>
                <CardHeader><CardTitle>إعدادات الفواتير</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>سياسة الإرجاع</Label><Input value={settings.returnPolicy} onChange={(e) => handleChange('returnPolicy', e.target.value)} /></div>
                  <div><Label>رسالة أسفل الفاتورة</Label><Input value={settings.invoiceFooterMessage} onChange={(e) => handleChange('invoiceFooterMessage', e.target.value)} /></div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button size="lg" onClick={handleSave} className="gap-2">
              {saved ? <><CheckCircle className="h-5 w-5" />تم الحفظ</> : <><Save className="h-5 w-5" />حفظ الإعدادات</>}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />الباركود الذكي (QR)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-200 flex justify-center">
                <div className="bg-white p-3 rounded-lg shadow-lg">
                  <QRCodeSVG value={qrValue || 'صيدلية الشفاء|MOH-12345'} size={180} bgColor="#ffffff" fgColor="#1e3a8a" level="H" includeMargin={true} />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-mono break-all text-center bg-gray-50 p-2 rounded">{qrValue}</p>
            </CardContent>
          </Card>

          {previewLogo && (
            <Card>
              <CardHeader><CardTitle>معاينة الشعار</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <div className="relative w-24 h-24">
                  <Image src={previewLogo} alt="شعار الصيدلية" fill className="object-contain" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
