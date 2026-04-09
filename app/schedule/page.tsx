// src/app/schedule/page.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Wand2 } from 'lucide-react';

// 模擬診別樣式對照
const SHIFT_TYPES: Record<string, string> = {
  E: 'bg-green-400 text-white',
  N: 'bg-blue-500 text-white',
  D: 'bg-orange-400 text-white',
  休: 'bg-gray-100 text-gray-400',
  例: 'bg-gray-200 text-gray-500',
};

export default function SchedulePage() {
  const [currentMonth] = useState("三月, 2026");
  
  // 模擬員工資料
  const employees = [
    { id: 1, name: '艾倫', totalHours: 176 },
    { id: 2, name: '柯瑞', totalHours: 176 },
    { id: 3, name: '杜蘭特', totalHours: 168 },
    { id: 4, name: '哈登', totalHours: 176 },
  ];

  // 產生 1~31 天
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-700">
      {/* 控制列 */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md bg-white">
            <button className="p-1.5 hover:bg-gray-50 border-r"><ChevronLeft size={18} /></button>
            <span className="px-4 font-bold">{currentMonth}</span>
            <button className="p-1.5 hover:bg-gray-50 border-l"><ChevronRight size={18} /></button>
          </div>
          <button className="px-3 py-1.5 border rounded-md bg-white text-sm">今天</button>
          <select className="border rounded-md bg-white px-3 py-1.5 text-sm outline-none">
            <option>所有班別類型</option>
          </select>
        </div>
        <select className="border rounded-md bg-white px-3 py-1.5 text-sm">
          <option>月</option>
        </select>
      </div>

      {/* 核心排班表格區 */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* 表格本體 - 為了左側固定，使用 flex */}
          <div className="flex overflow-auto">
            
            {/* 左側固定員工欄 */}
            <div className="sticky left-0 z-20 bg-white border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
              <div className="h-12 border-b flex items-center px-4 bg-gray-50">
                <span className="text-xs font-medium text-gray-400">人員</span>
              </div>
              {employees.map(emp => (
                <div key={emp.id} className="h-16 border-b flex flex-col justify-center px-4 min-w-[140px]">
                  <div className="font-bold text-sm">{emp.name}</div>
                  <div className="text-[10px] text-gray-400">{emp.totalHours}h 0h</div>
                </div>
              ))}
            </div>

            {/* 右側滾動日期與格子 */}
            <div className="flex-1">
              {/* 日期標題列 */}
              <div className="flex h-12 bg-gray-50 border-b">
                {days.map(day => (
                  <div key={day} className="flex-shrink-0 w-10 border-r flex flex-col items-center justify-center text-[10px]">
                    <span className="text-gray-400 font-medium">日</span>
                    <span className="font-bold text-gray-600">{day}</span>
                  </div>
                ))}
              </div>

              {/* 員工班表格子 */}
              {employees.map(emp => (
                <div key={emp.id} className="flex h-16 border-b">
                  {days.map(day => {
                    // 這裡先隨機放一些班別作測試
                    const mockShift = day % 7 === 0 ? '休' : (day % 3 === 0 ? 'E' : 'D');
                    return (
                      <div key={day} className="flex-shrink-0 w-10 border-r flex items-center justify-center p-1 group cursor-pointer hover:bg-blue-50">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${SHIFT_TYPES[mockShift] || 'bg-transparent'}`}>
                          {mockShift !== 'bg-transparent' ? mockShift : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}