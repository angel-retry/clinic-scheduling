"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getDoctorEffectiveDateAction } from "../_actions/get-doctor";

// 1. 定義對照表：將英文 Key 對應到中文 Label
const timeSlots = [
	{ id: "morning", label: "上午診" },
	{ id: "afternoon", label: "下午診" },
	{ id: "evening", label: "晚上診" },
];
const days = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

export default function DoctorSchedule() {
	const [loading, setLoading] = useState(false);
	const [doctors, setDoctors] = useState<any[]>([]);

	useEffect(() => {
		const fetchSchedule = async () => {
			setLoading(true);
			const data = await getDoctorEffectiveDateAction();
			setDoctors(data);
			setLoading(false);
		};
		fetchSchedule();
	}, []);

	// 2. 核心邏輯：根據目前的時段與星期，找出有哪些醫師
	const getDoctorsForSlot = (day: string, slotId: string) => {
		const key = `${day}-${slotId}`; // 組合出像 "週三-afternoon" 的 Key

		return doctors.filter((dr) => {
			// 確保 dr.schedule 存在，且該時段為 true
			const schedule =
				typeof dr.schedule === "string" ? JSON.parse(dr.schedule) : dr.schedule;
			return schedule && schedule[key] === true;
		});
	};

	if (loading) return <div className="p-8">讀取診表中...</div>;

	return (
		<div className="p-8">
			<h2 className="text-xl font-bold mb-4">醫師每週固定診表</h2>
			<div className="border rounded-lg overflow-hidden bg-white shadow">
				<Table>
					<TableHeader className="bg-slate-50">
						<TableRow>
							<TableHead className="w-24 text-center border-r">時段</TableHead>
							{days.map((day) => (
								<TableHead key={day} className="text-center">
									{day}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* 3. 跑時段 (上午、下午、晚上) */}
						{timeSlots.map((slot) => (
							<TableRow key={slot.id}>
								<TableCell className="font-bold text-center border-r bg-slate-50">
									{slot.label}
								</TableCell>

								{/* 4. 跑星期 (週一到週日) */}
								{days.map((day) => {
									const assignedDoctors = getDoctorsForSlot(day, slot.id);

									return (
										<TableCell key={day} className="text-center h-24 p-2">
											<div className="flex flex-col gap-1 items-center justify-center">
												{assignedDoctors.length > 0 ? (
													assignedDoctors.map((dr) => (
														<Badge
															key={dr.id}
															variant="outline"
															className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
														>
															{dr.name}
														</Badge>
													))
												) : (
													<span className="text-gray-300 text-[10px]">---</span>
												)}
											</div>
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* 下方的異動提醒可以保留或移除 */}
			<div className="mt-8">
				<h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
					近期休假/代診異動 (手動標記)
				</h3>
				<div className="mt-2 p-3 border-l-4 border-red-500 bg-red-50 text-sm">
					💡 此表會隨著醫師管理中的「固定診次」自動即時更新。
				</div>
			</div>
		</div>
	);
}
