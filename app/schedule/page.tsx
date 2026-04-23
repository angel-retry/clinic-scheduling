"use client";

import {
	ChevronLeft,
	ChevronRight,
	Lock,
	Send,
	Unlock,
	UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDoctorAction } from "../doctors/_actions/get-doctor";
import { getEmployeesAction } from "../employee/_actions/get-employee";
import { getRosterConfig } from "../settings/roster/_action/get-roster";
import { getScheduleAction } from "./_actions/get-schedule";
import { saveScheduleAction } from "./_actions/save-schedule";

// --- 常數與樣式 ---
const SHIFT_TYPES: Record<string, string> = {
	D: "bg-orange-400 text-white",
	E: "bg-green-400 text-white",
	N: "bg-blue-500 text-white",
	休: "bg-gray-100 text-gray-400",
	例: "bg-gray-200 text-gray-500",
};

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const PERIODS = [
	{ id: "morning", label: "早" },
	{ id: "afternoon", label: "午" },
	{ id: "evening", label: "晚" },
];

export default function SchedulePage() {
	const [year] = useState(2026);
	const [_month, _setMonth] = useState(4);
	const [_activeEmployees, _setActiveEmployees] = useState<any[]>([]);
	const [_isModalOpen, _setIsModalOpen] = useState<boolean>(false);
	const [_loading, _setLoading] = useState<boolean>(true);

	// --- 新增：狀態管理 ---
	const [_isPublished, _setIsPublished] = useState(false);
	const [_gridData, _setGridData] = useState<
		Record<string, Record<number, string>>
	>({});
	const [isSaving, setIsSaving] = useState(false);

	const [roleConfigs, setRoleConfigs] = useState<any[]>([]);
	const [doctors, setDoctors] = useState<any[]>([]);
	const [employees, setEmployees] = useState<any[]>([]);
	// key 可以是 record_id (date_empId)，value 是新的班號
	const [_pendingChanges, _setPendingChanges] = useState<Record<string, any>>(
		{},
	);

	useEffect(() => {
		_setLoading(true);
		const _getData = async () => {
			const [
				_fetchedRoles,
				_fetchedDoctors,
				_fetchedEmployees,
				_fetchedSchedule,
			] = await Promise.all([
				getRosterConfig(),
				getDoctorAction(),
				getEmployeesAction(),
				getScheduleAction(year, _month),
			]);

			if (_fetchedRoles.success) setRoleConfigs(_fetchedRoles.data);
			setDoctors(_fetchedDoctors || []);
			const allEmployees = _fetchedEmployees || [];
			setEmployees(allEmployees);

			console.log("Fetched Schedule Data:", _fetchedSchedule);

			// --- 處理載入後的班表資料還原 ---
			if (_fetchedSchedule.success && _fetchedSchedule.data.length > 0) {
				const newGridData: Record<string, Record<number, string>> = {};
				const activeIds = new Set<string>();

				_fetchedSchedule.data.forEach((item: any) => {
					const empId = item.employee_id;
					const day = parseInt(item.date.slice(-2), 10); // 從 20260401 擷取 01 -> 1

					if (!newGridData[empId]) newGridData[empId] = {};
					newGridData[empId][day] = item.shift_code;
					activeIds.add(empId);
				});

				_setGridData(newGridData);
				_setIsPublished(true); // 如果有資料，預設標記為已發布

				// 根據班表內的 ID，過濾出 _activeEmployees 對象
				const activeList = allEmployees.filter((emp: any) =>
					activeIds.has(emp.id),
				);
				_setActiveEmployees(activeList);
			} else {
				// --- 新增：如果該月份完全沒資料 (例如 2026/05) ---
				_setGridData({}); // 清空班表格子
				_setActiveEmployees([]); // 清空當前顯示的員工清單
				_setIsPublished(false); // 設為草稿狀態
			}

			_setLoading(false);
		};
		_getData();
	}, [_month, year]);

	// 1. 人力需求基準計算 (不變)
	const scheduleRequirements = useMemo(() => {
		const requirementMap: Record<
			string,
			{ total: number; drCount: number; roles: any[] }
		> = {};
		WEEKDAYS.forEach((w) => {
			PERIODS.forEach((p) => {
				const slotKey = `週${w}-${p.id}`;
				const drCount = doctors.filter(
					(dr) => dr.schedule?.[slotKey as keyof typeof dr.schedule] === true,
				).length;
				let totalNeeded = 0;
				const roleBreakdown = roleConfigs.map((role) => {
					const count =
						drCount > 0
							? role.type === "per_doctor"
								? drCount * role.value
								: role.value
							: 0;
					totalNeeded += count;
					return { label: role.label, count };
				});
				requirementMap[slotKey] = {
					total: totalNeeded,
					drCount,
					roles: roleBreakdown,
				};
			});
		});
		return requirementMap;
	}, [doctors, roleConfigs]);

	// 2. 當月日期資訊 (不變)
	const daysInfo = useMemo(() => {
		const daysInMonth = new Date(year, _month, 0).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => {
			const day = i + 1;
			const date = new Date(year, _month - 1, day);
			const weekdayName = WEEKDAYS[date.getDay()];
			const hasClinic = PERIODS.some(
				(p) => scheduleRequirements[`週${weekdayName}-${p.id}`]?.drCount > 0,
			);
			return {
				day,
				weekday: weekdayName,
				isWeekend: [0, 6].includes(date.getDay()),
				hasClinic,
			};
		});
	}, [year, _month, scheduleRequirements]);

	// 3. 計算目前的實排人數 (實績)
	const actualStaffCount = useMemo(() => {
		const counts: Record<string, number> = {}; // key: "day-period"
		daysInfo.forEach((day) => {
			PERIODS.forEach((p) => {
				const key = `${day.day}-${p.id}`;
				let count = 0;
				_activeEmployees.forEach((emp) => {
					const shift = _gridData[emp.id]?.[day.day];
					// 邏輯判斷：如果是 D 班算早/午，E 班算晚，依診所習慣調整
					if (p.id === "morning" && shift === "D") count++;
					if (p.id === "afternoon" && shift === "D") count++;
					if (p.id === "evening" && shift === "E") count++;
					if (shift === "N") count++; // N 班全天或特定時段
				});
				counts[key] = count;
			});
		});
		return counts;
	}, [_activeEmployees, _gridData, daysInfo]);

	// --- 動作處理 ---
	const handleAddStaff = (staff: any) => {
		if (!_activeEmployees.find((e) => e.id === staff.id)) {
			_setActiveEmployees([..._activeEmployees, staff]);

			// 準備該員工的整月預設班表
			const _newStaffMonthGrid: Record<number, string> = {};
			const _newChangesForThisStaff: Record<string, any> = {};

			daysInfo.forEach((d) => {
				const defaultShift = d.hasClinic ? "D" : "休";
				const dateStr = `${year}${_month.toString().padStart(2, "0")}${d.day.toString().padStart(2, "0")}`;
				const recordId = `${dateStr}_${staff.id}`;

				// 更新畫面用的 Grid
				_newStaffMonthGrid[d.day] = defaultShift;

				// 更新儲存用的 PendingChanges
				_newChangesForThisStaff[recordId] = {
					record_id: recordId,
					employee_id: staff.id,
					date: dateStr,
					shift_code: defaultShift,
					is_weekend: d.isWeekend,
				};
			});

			// 一次性更新兩個狀態
			_setGridData((prev) => ({
				...prev,
				[staff.id]: _newStaffMonthGrid,
			}));

			_setPendingChanges((prev) => ({
				...prev,
				..._newChangesForThisStaff,
			}));
		}
		_setIsModalOpen(false);
	};

	const toggleShift = (empId: string, day: number) => {
		if (_isPublished) return;

		const shifts = Object.keys(SHIFT_TYPES);
		const _dateStr = `${year}${_month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`;
		const _recordId = `${_dateStr}_${empId}`;

		_setGridData((prev) => {
			const currentShift = prev[empId]?.[day] || "休";
			const nextIndex = (shifts.indexOf(currentShift) + 1) % shifts.length;
			const _nextShift = shifts[nextIndex];

			// 更新 pendingChanges
			_setPendingChanges((prevChanges) => ({
				...prevChanges,
				[_recordId]: {
					record_id: _recordId,
					employee_id: empId,
					date: _dateStr,
					shift_code: _nextShift,
					is_weekend: daysInfo.find((d) => d.day === day)?.isWeekend || false,
				},
			}));

			return {
				...prev,
				[empId]: { ...prev[empId], [day]: _nextShift },
			};
		});
	};

	const handlePublish = async () => {
		const _changesArray = Object.values(_pendingChanges);

		if (_changesArray.length === 0) {
			alert("沒有任何異動需要儲存");
			return;
		}

		setIsSaving(true);
		try {
			console.log("只儲存有變動的資料:", _changesArray);

			const _result = await saveScheduleAction(_changesArray);

			if (_result.success) {
				_setIsPublished(true);
				// 清空待儲存陣列
				_setPendingChanges({});
				alert("班表已成功儲存至 Google Sheets！");
			} else {
				alert("儲存失敗，請檢查網路或權限");
			}
		} catch (error) {
			console.error("Publish Error:", error);
			alert("發生錯誤");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			{_loading ? (
				<div className="flex items-center justify-center h-screen bg-white">
					<div className="flex flex-col items-center gap-2">
						<div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
						<div className="text-gray-500 font-medium">載入診所資料中...</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col h-screen bg-gray-100 text-slate-700 p-6 gap-6 overflow-hidden">
					{/* 標題列 */}
					<div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm flex-shrink-0 border border-slate-200">
						<div className="flex items-center gap-6">
							<div className="flex items-center gap-3">
								<h1 className="text-xl font-bold">診所排班系統</h1>
								<span
									className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${_isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
								>
									<span
										className={`w-2 h-2 rounded-full ${_isPublished ? "bg-green-500" : "bg-amber-500 animate-pulse"}`}
									/>
									{_isPublished ? "已發布" : "草稿中"}
								</span>
							</div>

							<div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden shadow-sm">
								<button
									type="button"
									onClick={() => _setMonth((m) => (m === 1 ? 12 : m - 1))}
									className="p-2 hover:bg-gray-200"
								>
									<ChevronLeft size={18} />
								</button>
								<span className="px-6 font-mono font-bold w-32 text-center border-x">
									{year} / {_month.toString().padStart(2, "0")}
								</span>
								<button
									type="button"
									onClick={() => _setMonth((m) => (m === 12 ? 1 : m + 1))}
									className="p-2 hover:bg-gray-200"
								>
									<ChevronRight size={18} />
								</button>
							</div>
						</div>

						<div className="flex items-center gap-3">
							{_isPublished ? (
								<button
									type="button"
									onClick={() => _setIsPublished(false)}
									className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 px-4 py-2 text-sm font-medium"
								>
									<Unlock size={16} /> 取消發布以編輯
								</button>
							) : (
								<button
									type="button"
									onClick={handlePublish}
									disabled={isSaving || _activeEmployees.length === 0}
									className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
								>
									<Send size={18} /> {isSaving ? "儲存中..." : "發布班表"}
								</button>
							)}
							<button
								type="button"
								onClick={() => _setIsModalOpen(true)}
								className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
							>
								<UserPlus size={18} /> 新增員工
							</button>
						</div>
					</div>

					{/* 主表格區域 */}
					<div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
						<div className="flex-1 overflow-auto bg-slate-50/30">
							<div className="min-w-max">
								<table className="border-separate border-spacing-0 w-full">
									<thead className="sticky top-0 z-50">
										<tr>
											<th className="sticky left-0 top-0 z-[60] bg-slate-100 p-4 w-40 text-left text-xs font-bold text-slate-500 border-b border-r uppercase tracking-wider shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
												人員與職務
											</th>
											{daysInfo.map((d) => (
												<th
													key={d.day}
													className={`w-14 p-2 border-b border-r text-center ${d.isWeekend ? "bg-red-50/80" : "bg-slate-50"}`}
												>
													<div
														className={`text-[10px] ${d.isWeekend ? "text-red-400" : "text-slate-400"}`}
													>
														{d.weekday}
													</div>
													<div className="text-sm font-bold">{d.day}</div>
												</th>
											))}
										</tr>
									</thead>

									<tbody className="bg-white">
										{/* 員工排班區 */}
										{_activeEmployees.map((emp) => (
											<tr
												key={emp.id}
												className="group hover:bg-indigo-50/30 transition-colors"
											>
												<td className="sticky left-0 z-40 bg-white group-hover:bg-indigo-50/30 p-3 border-b border-r font-bold text-sm shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
													<div className="flex flex-col">
														<span>{emp.name}</span>
														<span className="text-[10px] font-normal text-slate-400">
															總時數: {emp.totalHours || 0}h
														</span>
													</div>
												</td>
												{daysInfo.map((day) => {
													const currentShift =
														_gridData[emp.id]?.[day.day] || "休";
													return (
														<td
															key={day.day}
															onClick={() => toggleShift(emp.id, day.day)}
															onKeyDown={(e) => {
																if (e.key === "Enter" || e.key === " ") {
																	e.preventDefault();
																	toggleShift(emp.id, day.day);
																}
															}}
															className={`p-1 border-b border-r text-center transition-all ${
																!day.hasClinic
																	? "bg-gray-50/50"
																	: "cursor-pointer hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
															}`}
														>
															<div
																className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-xs font-black shadow-sm transition-transform active:scale-90 ${SHIFT_TYPES[currentShift]}`}
															>
																{currentShift}
															</div>
														</td>
													);
												})}
											</tr>
										))}

										{/* 人力驗證標籤 */}
										<tr>
											<td
												colSpan={daysInfo.length + 1}
												className="bg-slate-800 text-white px-4 py-2 text-xs font-bold sticky left-0 z-40 flex items-center gap-2"
											>
												<Lock size={12} /> 人力配置即時驗證
												(點擊上方班表可即時更新數據)
											</td>
										</tr>

										{/* 驗證數據區 */}
										{PERIODS.map((p) => (
											<tr key={p.id}>
												<td className="sticky left-0 z-40 bg-slate-50 p-3 border-b border-r text-xs font-bold shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
													{p.label}班需求
												</td>
												{daysInfo.map((day) => {
													const req =
														scheduleRequirements[`週${day.weekday}-${p.id}`];
													const actual =
														actualStaffCount[`${day.day}-${p.id}`] || 0;

													if (!req || req.drCount === 0) {
														return (
															<td
																key={day.day}
																className="bg-slate-50 text-center text-slate-300 text-[10px] border-b border-r italic"
															>
																-
															</td>
														);
													}

													const isDeficit = actual < req.total;

													return (
														<td
															key={day.day}
															className="p-1 border-b border-r text-center bg-white"
														>
															<div className="flex flex-col items-center">
																<div
																	className={`text-[11px] font-black leading-none mb-1 ${isDeficit ? "text-red-500" : "text-green-600"}`}
																>
																	{actual}/{req.total}
																</div>
																<div className="flex flex-wrap justify-center gap-0.5 max-w-[48px]">
																	{req.roles.map((r: any) => (
																		<span
																			key={r.label}
																			className="text-[7px] bg-slate-100 px-0.5 rounded text-slate-500 scale-90"
																			title={r.label}
																		>
																			{r.label[0]}:{r.count}
																		</span>
																	))}
																</div>
															</div>
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>

					{/* Modal */}
					{_isModalOpen && (
						<div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
							<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
								<div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
									<h3 className="font-bold text-lg text-slate-800">
										選擇員工加入班表
									</h3>
									<button
										type="button"
										onClick={() => _setIsModalOpen(false)}
										className="text-slate-400 hover:text-slate-600 text-2xl"
									>
										&times;
									</button>
								</div>
								<div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
									{employees.map((staff) => (
										<button
											type="button"
											key={staff.id}
											onClick={() => handleAddStaff(staff)}
											disabled={_activeEmployees.some((e) => e.id === staff.id)}
											className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-40"
										>
											<div className="text-left">
												<div className="font-bold text-slate-700">
													{staff.name}
												</div>
												<div className="text-xs text-slate-400 font-mono">
													{staff.id}
												</div>
											</div>
											<div className="text-xs bg-white px-2 py-1 rounded border shadow-sm text-slate-500">
												時數: {staff.totalHours || 0}h
											</div>
										</button>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
}
