"use client";

import { useEffect, useMemo, useState } from "react";

export default function EmployeePage() {
	const [_loading, _setLoading] = useState(false);
	const [_employees, _setEmployees] = useState([]);

	const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

	const SHIFT_TYPES: Record<string, string> = {
		E: "bg-green-400 text-white",
		N: "bg-blue-500 text-white",
		D: "bg-orange-400 text-white",
		休: "bg-gray-100 text-gray-400",
		例: "bg-gray-200 text-gray-500",
	};

	// 設定狀態，預設為 2026 年 4 月
	const [year, setYear] = useState(2026);
	const [month, setMonth] = useState(4);

	// 計算該月天數與每日資訊
	const daysInfo = useMemo(() => {
		// 取得該月最後一天 (例如 4月是 30)
		const daysInMonth = new Date(year, month, 0).getDate();

		return Array.from({ length: daysInMonth }, (_, i) => {
			const day = i + 1;
			const dayOfWeek = new Date(year, month - 1, day).getDay();
			return {
				day,
				weekday: WEEKDAYS[dayOfWeek],
				isWeekend: dayOfWeek === 0 || dayOfWeek === 6, // 標記週末
			};
		});
	}, [year, month, WEEKDAYS]);

	// 切換月份邏輯
	const _handlePrevMonth = () => {
		if (month === 1) {
			setYear(year - 1);
			setMonth(12);
		} else {
			setMonth(month - 1);
		}
	};

	const _handleNextMonth = () => {
		if (month === 12) {
			setYear(year + 1);
			setMonth(1);
		} else {
			setMonth(month + 1);
		}
	};

	useEffect(() => {
		fetch("/api/employees")
			.then((res) => res.json())
			.then((data) => _setEmployees(data));
	}, []);

	const employees = [
		{ id: 1, name: "艾倫", totalHours: 176 },
		{ id: 2, name: "柯瑞", totalHours: 176 },
		{ id: 3, name: "杜蘭特", totalHours: 168 },
		{ id: 4, name: "哈登", totalHours: 176 },
	];

	return (
		<div className="flex flex-col h-screen bg-gray-50 px-6 pt-5">
			<h1 className="text-black text-lg">員工列表</h1>
			<div className="flex-1 overflow-auto">
				<div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
					<div className="flex overflow-auto">
						{/* 左側固定員工欄 */}
						<div className="sticky left-0 z-20 bg-white border-r shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
							<div className="h-12 border-b flex items-center px-4 bg-gray-50">
								<span className="text-xs font-medium text-gray-400">人員</span>
							</div>
							{employees.map((emp) => (
								<div
									key={emp.id}
									className="h-16 border-b flex flex-col justify-center px-4 min-w-[140px]"
								>
									<div className="font-bold text-sm">{emp.name}</div>
									<div className="text-[10px] text-gray-400">
										{emp.totalHours}h 0h
									</div>
								</div>
							))}
						</div>

						{/* 右側滾動區域 */}
						<div className="flex-1">
							{/* 動態日期標題列 */}
							<div className="flex h-12 bg-gray-50 border-b">
								{daysInfo.map((item) => (
									<div
										key={item.day}
										className={`flex-shrink-0 w-10 border-r flex flex-col items-center justify-center text-[10px] ${item.isWeekend ? "bg-red-50" : ""}`}
									>
										<span
											className={`${item.isWeekend ? "text-red-400" : "text-gray-400"} font-medium`}
										>
											{item.weekday}
										</span>
										<span
											className={`font-bold ${item.isWeekend ? "text-red-600" : "text-gray-600"}`}
										>
											{item.day}
										</span>
									</div>
								))}
							</div>

							{/* 員工班表格子 */}
							{employees.map((emp) => (
								<div key={emp.id} className="flex h-16 border-b">
									{daysInfo.map((item) => {
										const mockShift = item.isWeekend ? "休" : "D";
										return (
											<div
												key={item.day}
												className={`flex-shrink-0 w-10 border-r flex items-center justify-center p-1 group cursor-pointer hover:bg-blue-50 ${item.isWeekend ? "bg-red-50/30" : ""}`}
											>
												<div
													className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110 ${SHIFT_TYPES[mockShift]}`}
												>
													{mockShift}
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
