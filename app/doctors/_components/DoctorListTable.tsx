"use client";

import { CalendarRange, Edit2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface DoctorListTableProps {
	doctors: any[];
	onEdit: (doctor: any) => void;
}

export function DoctorListTable({ doctors, onEdit }: DoctorListTableProps) {
	// 輔助函式：將 {"週三-afternoon": true} 轉成 ["週三-午診", ...]
	const _formatSchedule = (scheduleObj: Record<string, boolean>) => {
		const slotMapping: Record<string, string> = {
			morning: "早",
			afternoon: "午",
			evening: "晚",
		};

		return Object.entries(scheduleObj)
			.filter(([_, value]) => value === true)
			.map(([key, _]) => {
				const [day, slot] = key.split("-");
				return `${day}(${slotMapping[slot] || slot})`;
			});
	};

	return (
		<div className="border rounded-xl bg-white shadow-sm overflow-hidden">
			<Table>
				<TableHeader className="bg-slate-50">
					<TableRow>
						<TableHead className="w-[200px]">醫師姓名</TableHead>
						<TableHead>專科</TableHead>
						<TableHead>固定診次 (每週)</TableHead>
						<TableHead>生效日期</TableHead>
						<TableHead>狀態</TableHead>
						<TableHead className="text-right">操作</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{doctors.map((dr) => {
						// 在這裡處理轉換
						const _displaySchedules =
							typeof dr.schedule === "string"
								? _formatSchedule(JSON.parse(dr.schedule))
								: _formatSchedule(dr.schedule);

						return (
							<TableRow key={dr.id} className="hover:bg-slate-50/50">
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9 border">
											<AvatarFallback className="bg-blue-50 text-blue-600">
												{dr.name[0]}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="font-bold text-slate-700">
												{dr.name}
											</span>
											<span className="text-[10px] text-slate-400">
												{dr.id}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell>{dr.specialty}</TableCell>
								<TableCell>
									<div className="flex gap-1 flex-wrap">
										{_displaySchedules.length > 0 ? (
											_displaySchedules.map((label) => (
												<Badge
													key={label}
													variant="outline"
													className="bg-blue-50/50 text-blue-700 border-blue-100 font-normal"
												>
													{label}
												</Badge>
											))
										) : (
											<span className="text-slate-400 text-xs">未設定診次</span>
										)}
									</div>
								</TableCell>
								<TableCell className="text-slate-500 font-mono text-sm">
									{dr.effectiveDate}
								</TableCell>
								<TableCell>
									<Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
										服務中
									</Badge>
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical size={16} />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => onEdit(dr)}
												className="cursor-pointer"
											>
												<Edit2 size={14} className="mr-2" /> 編輯資料
											</DropdownMenuItem>
											<DropdownMenuItem className="cursor-pointer">
												<CalendarRange size={14} className="mr-2" />{" "}
												變更排班模板
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
