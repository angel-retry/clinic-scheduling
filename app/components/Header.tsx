// components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link'; // 引入 Link
import { usePathname } from 'next/navigation'; // 引入用來判斷路徑的 Hook
import { Download, Wand2 } from 'lucide-react';

export default function Header() {
  const pathname = usePathname(); // 取得當前網址路徑

  // 判斷是否為當前頁面的樣式函數
  const isActive = (path: string) => 
    pathname === path ? "text-slate-900 font-bold" : "text-gray-400 hover:text-slate-600";

  return (
    <header className="flex  items-center justify-between px-6 py-3 bg-white border-b sticky top-0 z-50">
      <div className="flex items-center gap-6">
        {/* 主要標題：導向排班首頁 */}
        <Link href="/schedule" className="flex items-center gap-2 group">
          <span className="text-xl">📅</span>
          <div className="font-bold text-lg group-hover:text-blue-600 transition-colors">
            排班
          </div>
        </Link>

        {/* 次要導覽：使用 Nav-Link 邏輯 */}
        <nav className="flex items-center gap-4 text-sm border-l pl-6 ml-2 border-gray-200">
          <Link 
            href="/schedule/settings" 
            className={`transition-colors ${isActive('/schedule/settings')}`}
          >
            班別設定
          </Link>
          <Link 
            href="/staff" 
            className={`transition-colors ${isActive('/staff')}`}
          >
            員工平台
          </Link>
        </nav>
      </div>

      {/* 右側按鈕區維持不變 */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
          <Download size={20} />
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-md border border-orange-200 text-sm font-medium hover:bg-orange-100 transition-colors">
          <Wand2 size={16} /> 生成排班
        </button>
        <button className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm">
          發布
        </button>
      </div>
    </header>
  );
}