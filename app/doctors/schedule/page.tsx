// src/app/doctors/schedule/page.tsx
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const _timeSlots = ["上午診", "下午診", "晚上診"];
const days = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

const doctorSchedule = [
	{
		time: "上午診",
		Monday: "陳醫師",
		Tuesday: "李醫師",
		Wednesday: "陳醫師",
		Thursday: "王醫師",
		Friday: "李醫師",
		Saturday: "輪班",
		Sunday: "休診",
	},
	{
		time: "下午診",
		Monday: "王醫師",
		Tuesday: "陳醫師",
		Wednesday: "李醫師",
		Thursday: "陳醫師",
		Friday: "王醫師",
		Saturday: "休診",
		Sunday: "休診",
	},
	{
		time: "晚上診",
		Monday: "李醫師",
		Tuesday: "王醫師",
		Wednesday: "休診",
		Thursday: "李醫師",
		Friday: "陳醫師",
		Saturday: "休診",
		Sunday: "休診",
	},
];

export default function DoctorSchedule() {
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
						{doctorSchedule.map((slot) => (
							<TableRow key={slot.time}>
								<TableCell className="font-bold text-center border-r bg-slate-50">
									{slot.time}
								</TableCell>
								{days.map((day) => {
									const drName = (slot as any)[
										day === "週一"
											? "Monday"
											: day === "週二"
												? "Tuesday"
												: day === "週三"
													? "Wednesday"
													: day === "週四"
														? "Thursday"
														: day === "週五"
															? "Friday"
															: day === "週六"
																? "Saturday"
																: "Sunday"
									];
									return (
										<TableCell key={day} className="text-center h-20">
											{drName === "休診" ? (
												<span className="text-gray-300 text-xs">---</span>
											) : (
												<Badge
													variant="outline"
													className="bg-blue-50 text-blue-700 border-blue-200 text-sm"
												>
													{drName}
												</Badge>
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* 例外休假提醒區 */}
			<div className="mt-8">
				<h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
					近期休假/代診異動
				</h3>
				<div className="mt-2 space-y-2">
					<div className="p-3 border-l-4 border-red-500 bg-red-50 text-sm">
						<strong>4/15 (三) 上午診：</strong> 陳醫師請假，由{" "}
						<strong>李醫師</strong> 代診。
					</div>
				</div>
			</div>
		</div>
	);
}
