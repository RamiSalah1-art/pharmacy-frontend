'use client';

export function Footer() {
  return (
    <footer className="bg-white border-t py-5 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-gray-700">
            © 2026 جميع الحقوق محفوظة ل<span className="font-bold text-blue-600">ديوان التقنية</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Spring Boot (Apache 2.0)</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Next.js (MIT)</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>PostgreSQL (PostgreSQL License)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
