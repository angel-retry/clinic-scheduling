"use client";

import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getShifts } from "./_actions/get-shifts";
import { updateShiftsAction } from "./_actions/update-shifts";

interface ShiftType {
	id: string;
	code: string;
	name: string;
	bg_color: string;
	text_color: string;
	start_time: string;
	end_time: string;
}

export default function ShiftSettingsPage() {
	// 1. 初始化狀態 (實際應用時應從 API 讀取)
	const [shifts, setShifts] = useState<ShiftType[]>([]);
	const [_saving, _setSaving] = useState(false);
	const [_loading, _setLoading] = useState(true);

	useEffect(() => {
		const _fetchData = async () => {
			// 1. 確保在開始前設為 true
			_setLoading(true);

			try {
				console.log("開始抓取資料...");
				const _result = await getShifts();

				if (_result?.success) {
					setShifts(_result.data);
					console.log("資料抓取成功:", _result.data);
				} else {
					console.error("API 回傳失敗:", _result);
				}
			} catch (_error) {
				console.error("useEffect 內部抓取錯誤:", _error);
			} finally {
				// 2. 只有在 try 或 catch 跑完後，才會跑這裡
				console.log("結束載入狀態");
				_setLoading(false);
			}
		};

		_fetchData();
	}, []);

	console.log("目前班別設定:", shifts);

	// 2. 新增班別功能
	const handleAddShift = () => {
		const newShift: ShiftType = {
			id: crypto.randomUUID(), // 產生唯一 ID
			code: "", // 預設空白，讓管理者填寫
			name: "",
			start_time: "",
			end_time: "",
			bg_color: "#e2e8f0", // 預設灰色
			text_color: "#475569",
		};
		setShifts([...shifts, newShift]);
	};

	// 3. 更新班別功能
	const handleUpdateShift = (
		id: string,
		field: keyof ShiftType,
		value: string,
	) => {
		setShifts((prev) =>
			prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
		);
	};

	// 4. 刪除班別功能
	const handleRemoveShift = (id: string) => {
		if (confirm("確定要刪除此班別嗎？這可能會影響現有的排班顯示。")) {
			setShifts(shifts.filter((s) => s.id !== id));
		}
	};

	// 5. 儲存功能 (串接後端 Action)
	const handleSave = async () => {
		if (_saving) return; // 防止重複點擊

		_setSaving(true);
		// 檢查是否有空欄位
		if (shifts.some((s) => !s.code.trim())) {
			alert("班別代號不能為空！");
			return;
		}

		console.log("準備儲存到資料庫:", shifts);
		try {
			const result = await updateShiftsAction(shifts);
			if (!result.success) {
				alert(`儲存失敗: ${result.error}`);
				return;
			}
			alert("設定已成功儲存");
		} catch (error) {
			console.error("儲存班別設定錯誤:", error);
		} finally {
			_setSaving(false);
		}
	};

	if (_loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<Loader2 className="animate-spin text-indigo-600" size={40} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 p-8 text-slate-700">
			<div className="max-w-4xl mx-auto">
				{/* 頂部導覽 */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Link
							href="/schedule"
							className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
						>
							<ArrowLeft size={20} />
						</Link>
						<div>
							<h1 className="text-2xl font-bold">班別樣式管理</h1>
							<p className="text-slate-500 text-sm">
								設定排班表顯示的代號與顏色
							</p>
						</div>
					</div>
					<button
						type="button"
						disabled={_saving}
						onClick={handleSave}
						className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
					>
						{_saving ? (
							<>
								{/* 這是旋轉的載入圖示 */}
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								<span>儲存中...</span>
							</>
						) : (
							<>
								<Save size={18} />
								<span>儲存變更</span>
							</>
						)}
					</button>
				</div>

				{/* 列表區域 */}
				<div className="flex flex-col gap-3">
					{shifts.map((shift) => (
						<div
							key={shift.id}
							className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 transition-all hover:border-indigo-200"
						>
							{/* 預覽區塊 */}
							<div
								className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black shadow-inner flex-shrink-0"
								style={{
									backgroundColor: shift.bg_color,
									color: shift.text_color,
								}}
							>
								{shift.code || "?"}
							</div>

							{/* 內容編輯區 */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
								<div className="flex flex-col gap-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">
										代號
									</span>
									<input
										className="border rounded-lg px-3 py-1.5 font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
										value={shift.code}
										maxLength={2}
										onChange={(e) =>
											handleUpdateShift(
												shift.id,
												"code",
												e.target.value.toUpperCase(),
											)
										}
									/>
								</div>
								<div className="flex flex-col gap-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">
										班別名稱
									</span>
									<input
										className="border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
										value={shift.name}
										onChange={(e) =>
											handleUpdateShift(shift.id, "name", e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-1">
									<span className="text-[10px] font-bold text-slate-400">
										開始時間
									</span>
									<input
										type="time"
										className="border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
										value={shift.start_time}
										onChange={(e) =>
											handleUpdateShift(shift.id, "start_time", e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-1">
									<span className="text-[10px] font-bold text-slate-400">
										結束時間
									</span>
									<input
										type="time"
										className="border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
										value={shift.end_time}
										onChange={(e) =>
											handleUpdateShift(shift.id, "end_time", e.target.value)
										}
									/>
								</div>
								<div className="flex flex-col gap-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">
										背景顏色
									</span>
									<div className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-slate-50">
										<input
											type="color"
											className="w-6 h-6 cursor-pointer border-none bg-transparent"
											value={shift.bg_color}
											onChange={(e) =>
												handleUpdateShift(shift.id, "bg_color", e.target.value)
											}
										/>
										<span className="text-xs font-mono text-slate-500">
											{shift.bg_color.toUpperCase()}
										</span>
									</div>
								</div>
								<div className="flex flex-col gap-1">
									<span className="text-[10px] font-bold text-slate-400 uppercase">
										文字顏色
									</span>
									<div className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-slate-50">
										<input
											type="color"
											className="w-6 h-6 cursor-pointer border-none bg-transparent"
											value={shift.text_color}
											onChange={(e) =>
												handleUpdateShift(
													shift.id,
													"text_color",
													e.target.value,
												)
											}
										/>
										<span className="text-xs font-mono text-slate-500">
											{shift.text_color.toUpperCase()}
										</span>
									</div>
								</div>
							</div>

							{/* 操作按鈕 */}
							<button
								type="button"
								onClick={() => handleRemoveShift(shift.id)}
								className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
							>
								<Trash2 size={20} />
							</button>
						</div>
					))}

					{/* 新增按鈕 */}
					<button
						type="button"
						onClick={handleAddShift}
						className="group mt-2 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"
					>
						<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
							<Plus size={24} />
						</div>
						<span className="font-bold text-sm">新增排班項目</span>
					</button>
				</div>
			</div>
		</div>
	);
}
