"use client";

import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDoctorAction } from "../doctors/_actions/get-doctor";
import { getEmployeesAction } from "../employee/_actions/get-employee";
import { getRosterConfig } from "../settings/roster/_action/get-roster";

// --- 常數與樣式 ---
const SHIFT_TYPES: Record<string, string> = {
	E: "bg-green-400 text-white",
	N: "bg-blue-500 text-white",
	D: "bg-orange-400 text-white",
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
	const [month, setMonth] = useState(4);
	const [activeEmployees, setActiveEmployees] = useState<any[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	// 1. 人力配置基準
	const [roleConfigs, setRoleConfigs] = useState([]);

	// 2. 醫生資料
	const [doctors, setDoctors] = useState([]);

	// 3. 員工資料
	const [employees, setEmployees] = useState([]);

	useEffect(() => {
		setLoading(true);

		const _getData = async () => {
			const [_fetchedRoles, _fetchedDoctors, _fetchedEmployees] =
				await Promise.all([
					getRosterConfig(),
					getDoctorAction(),
					getEmployeesAction(),
				]);

			if (
				_fetchedRoles.success &&
				_fetchedRoles.data.length > 0 &&
				_fetchedDoctors.length > 0 &&
				_fetchedEmployees.length > 0
			) {
				setRoleConfigs(_fetchedRoles.data);
				setDoctors(_fetchedDoctors);
				setEmployees(_fetchedEmployees);
			}
			setLoading(false);
		};

		_getData();
	}, []);

	// 3. 人力需求計算
	const scheduleRequirements = useMemo(() => {
		const requirementMap: Record<
			string,
			{ total: number; drCount: number; roles: any[] }
		> = {};
		const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

		weekLabels.forEach((w) => {
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

	// 4. 當月日期
	const daysInfo = useMemo(() => {
		const daysInMonth = new Date(year, month, 0).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => {
			const day = i + 1;
			const date = new Date(year, month - 1, day);
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
	}, [year, month, scheduleRequirements]);

	const handleAddStaff = (staff: any) => {
		if (!activeEmployees.find((e) => e.id === staff.id))
			setActiveEmployees([...activeEmployees, staff]);
		setIsModalOpen(false);
	};

	return (
		<>
			{loading ? (
				<div className="flex items-center justify-center h-screen">
					<div className="text-gray-500 text-lg">載入中...</div>
				</div>
			) : (
				<div className="flex flex-col h-screen bg-gray-100 text-slate-700 p-6 gap-6 overflow-hidden">
					{/* 標題列 */}
					<div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm flex-shrink-0">
						<div className="flex items-center gap-4">
							<h1 className="text-xl font-bold border-r pr-4">診所排班系統</h1>
							<div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
								<button
									onClick={() => setMonth((m) => (m === 1 ? 12 : m - 1))}
									className="p-2 hover:bg-gray-200"
								>
									<ChevronLeft size={18} />
								</button>
								<span className="px-6 font-mono font-bold w-32 text-center">
									{year} / {month.toString().padStart(2, "0")}
								</span>
								<button
									onClick={() => setMonth((m) => (m === 12 ? 1 : m + 1))}
									className="p-2 hover:bg-gray-200"
								>
									<ChevronRight size={18} />
								</button>
							</div>
						</div>
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
						>
							<UserPlus size={18} /> 新增員工排班
						</button>
					</div>

					{/* 主表格區域：統一橫向捲動 */}
					<div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
						<div className="flex-1 overflow-auto">
							<div className="min-w-max">
								<table className="border-separate border-spacing-0 w-full">
									{/* 1. 日期表頭 - 設為 sticky top */}
									<thead className="sticky top-0 z-50">
										<tr>
											<th className="sticky left-0 top-0 z-[60] bg-gray-100 p-4 w-32 text-left text-xs font-bold text-gray-500 border-b border-r uppercase tracking-wider">
												人員與職務
											</th>
											{daysInfo.map((d) => (
												<th
													key={d.day}
													className={`w-14 p-2 border-b border-r text-center ${d.isWeekend ? "bg-red-50" : "bg-gray-50"}`}
												>
													<div
														className={`text-[10px] ${d.isWeekend ? "text-red-400" : "text-gray-400"}`}
													>
														{d.weekday}
													</div>
													<div className="text-sm font-bold">{d.day}</div>
												</th>
											))}
										</tr>
									</thead>

									<tbody>
										{/* 2. 員工排班區 */}
										{activeEmployees.length > 0 ? (
											activeEmployees.map((emp) => (
												<tr
													key={emp.id}
													className="hover:bg-slate-50 transition-colors"
												>
													<td className="sticky left-0 z-40 bg-white p-3 border-b border-r font-bold text-sm shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
														{emp.name}{" "}
														<span className="block text-[10px] font-normal text-gray-400">
															{emp.totalHours > 0 ? `${emp.totalHours}h` : "0h"}
														</span>
													</td>
													{daysInfo.map((day) => {
														const defaultShift = day.hasClinic ? "D" : "休";
														return (
															<td
																key={day.day}
																className={`p-1 border-b border-r text-center ${!day.hasClinic ? "bg-gray-50/50" : ""}`}
															>
																<div
																	className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center text-xs font-bold shadow-sm ${SHIFT_TYPES[defaultShift]}`}
																>
																	{defaultShift}
																</div>
															</td>
														);
													})}
												</tr>
											))
										) : (
											<tr>
												<td className="sticky left-0 bg-white p-8 border-b border-r text-gray-300 italic">
													尚未加入員工
												</td>
												<td
													colSpan={daysInfo.length}
													className="p-8 border-b text-center text-gray-300 italic"
												>
													點擊上方「新增員工」開始排班
												</td>
											</tr>
										)}

										{/* 3. 中間分隔標籤 - 也要固定在左側 */}
										<tr>
											<td
												colSpan={daysInfo.length + 1}
												className="bg-slate-800 text-white px-4 py-1.5 text-xs font-bold sticky left-0 z-40"
											>
												人力配置驗證 (1醫 : 2護 + 1櫃 + 4視)
											</td>
										</tr>

										{/* 4. 驗證數據區 */}
										{PERIODS.map((p) => (
											<tr key={p.id}>
												<td className="sticky left-0 z-40 bg-gray-50 p-3 border-b border-r text-xs font-bold shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
													{p.label}班需求
												</td>
												{daysInfo.map((day) => {
													const req =
														scheduleRequirements[`週${day.weekday}-${p.id}`];
													if (!req || req.drCount === 0) {
														return (
															<td
																key={day.day}
																className="bg-gray-50 text-center text-slate-200 text-[10px] border-b border-r italic"
															>
																-
															</td>
														);
													}
													return (
														<td
															key={day.day}
															className="p-1 border-b border-r text-center bg-white"
														>
															<div className="flex flex-col gap-0.5">
																<div className="text-[11px] font-black text-indigo-600 leading-none">
																	0/{req.total}
																</div>
																<div className="flex flex-wrap justify-center gap-0.5 max-w-[50px] mx-auto">
																	{req.roles.map((r: any) => (
																		<span
																			key={r.label}
																			className="text-[8px] bg-slate-100 px-0.5 rounded text-slate-500 scale-90"
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

					{/* Modal 部分保持不變 */}
					{isModalOpen && (
						<div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
							<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
								<div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
									<h3 className="font-bold text-lg">選擇員工</h3>
									<button
										onClick={() => setIsModalOpen(false)}
										className="text-slate-400 hover:text-slate-600 text-2xl"
									>
										&times;
									</button>
								</div>
								<div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
									{employees.map((staff) => (
										<button
											key={staff.id}
											onClick={() => handleAddStaff(staff)}
											disabled={activeEmployees.some((e) => e.id === staff.id)}
											className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-40"
										>
											<div className="text-left">
												<div className="font-bold text-slate-700">
													{staff.name}
												</div>
												<div className="text-xs text-slate-400 font-mono">
													{staff.id}
												</div>
											</div>
											<div className="text-xs bg-white px-2 py-1 rounded border shadow-sm">
												時數:{" "}
												{staff.totalHours > 0 ? `${staff.totalHours}h` : "0h"}
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
