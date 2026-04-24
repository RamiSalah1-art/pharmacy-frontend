'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart, BarChart3, Settings, Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUser, logout, isSuperAdmin } from '@/lib/auth';

export function Header() {
  const [logo, setLogo] = useState<string>('');
  const [pharmacyName, setPharmacyName] = useState<string>('صيدلية الشفاء');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('pharmacyLogo');
    if (savedLogo) setLogo(savedLogo);
    
    const savedSettings = localStorage.getItem('pharmacySettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.pharmacyNameAr) setPharmacyName(settings.pharmacyNameAr);
      } catch (e) {}
    }

    const currentUser = getUser();
    setUser(currentUser);

    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('pharmacyLogo');
      if (updatedLogo) setLogo(updatedLogo);
    };
    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  const getUserRoleInArabic = () => {
    const roles = user?.roles || [];
    if (roles.includes('SUPER_ADMIN')) return 'سوبر أدمن';
    if (roles.includes('ADMIN')) return 'مدير النظام';
    if (roles.includes('PHARMACIST')) return 'صيدلي';
    return 'مستخدم';
  };

  const navItems = [
    { href: '/products', label: 'المنتجات', icon: Package, show: true },
    { href: '/sales', label: 'المبيعات', icon: ShoppingCart, show: true },
    { href: '/reports', label: 'التقارير', icon: BarChart3, show: true },
    { href: '/settings', label: 'الإعدادات', icon: Settings, show: user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') },
  ].filter(item => item.show);

  if (isSuperAdmin()) {
    return null;
  }

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo ? (
              <div className="relative w-10 h-10">
                <Image src={logo} alt="شعار الصيدلية" fill className="object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">ص</div>
            )}
            <span className="font-bold text-lg text-gray-800 hidden sm:block">{pharmacyName}</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 border-l pl-3 mr-2">
              <User className="h-4 w-4" />
              <span>{user?.fullName || 'مدير النظام'}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {getUserRoleInArabic()}
              </span>
            </div>
            
            <Button variant="ghost" size="icon" onClick={logout} title="تسجيل الخروج">
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600">{user?.fullName}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {getUserRoleInArabic()}
                </span>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
