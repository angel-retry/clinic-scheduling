"use client";

import {
	CalendarDays,
	FileEdit,
	MoreHorizontal,
	Trash2,
	UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getEmployeesAction } from "./_actions/get-employee";
import { EmployeeFormDialog } from "./_components/EmployeeFormDialog";

// 職級顏色對照
const levelStyles: Record<string, string> = {
	N1: "bg-blue-100 text-blue-700 hover:bg-blue-100",
	N2: "bg-green-100 text-green-700 hover:bg-green-100",
	N3: "bg-purple-100 text-purple-700 hover:bg-purple-100",
	N4: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function EmployeeListPage() {
	const [_isloading, _setIsLoading] = useState(false);
	const [_employees, _setEmployees] = useState<any[]>([]);

	// 控制 Dialog 是否顯示
	const [_isDialogOpen, _setIsDialogOpen] = useState(false);

	// 處理點擊「新增」
	const _handleAdd = () => {
		_setIsDialogOpen(true);
	};

	// 取得員工資料
	useEffect(() => {
		const _getEmployees = async () => {
			_setIsLoading(true);

			const _data = await getEmployeesAction();
			_setEmployees(_data);
			_setIsLoading(false);
		};

		_getEmployees();
	}, []);

	return (
		<>
			{_isloading ? (
				<div className="flex items-center justify-center h-64">
					<span className="text-slate-500">載入中...</span>
				</div>
			) : (
				<div className="p-8 space-y-6">
					<div className="flex justify-between items-end">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">
								護士資料管理
							</h1>
							<p className="text-muted-foreground mt-1">編輯、修改護士資料。</p>
						</div>
						{/* 點擊觸發新增 */}
						<Button onClick={_handleAdd} className="flex gap-2">
							<UserPlus size={18} /> 新增護士
						</Button>
					</div>

					<div className="border rounded-lg bg-white shadow-sm">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[250px]">姓名</TableHead>
									<TableHead>職級</TableHead>
									<TableHead>職位</TableHead>
									<TableHead>狀態</TableHead>
									<TableHead>工時進度 (本月)</TableHead>
									<TableHead>到職日期</TableHead>
									<TableHead className="text-right">操作</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{_employees.map((nurse) => {
									// 計算百分比
									const progress =
										(nurse.currentHours / nurse.requiredHours) * 100;
									// 如果超過 100%，進度條變紅色提醒
									const isOvertime = progress > 100;

									return (
										<TableRow key={nurse.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarImage src={nurse.avatar} />
														<AvatarFallback>{nurse.name[0]}</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-bold">{nurse.name}</div>
														<div className="text-xs text-gray-400">
															{nurse.id}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant="secondary"
													className={levelStyles[nurse.level]}
												>
													{nurse.level}
												</Badge>
											</TableCell>
											<TableCell>{nurse.role}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<span
														className={`h-2 w-2 rounded-full ${nurse.status === "在職" ? "bg-green-500" : "bg-orange-500"}`}
													/>
													{nurse.status}
												</div>
											</TableCell>

											{/* 工時進度欄位 */}
											<TableCell className="w-[200px]">
												<div className="space-y-1.5">
													<div className="flex justify-between text-[10px] font-medium">
														<span
															className={
																isOvertime
																	? "text-red-600 font-bold"
																	: "text-gray-500"
															}
														>
															{nurse.currentHours} / {nurse.requiredHours} h
														</span>
														<span className="text-gray-400">
															{Math.round(progress)}%
														</span>
													</div>
													<Progress
														value={progress > 100 ? 100 : progress}
														className={`h-2 ${isOvertime ? "[&>div]:bg-red-500" : ""}`}
													/>
												</div>
											</TableCell>

											<TableCell className="text-gray-500">
												{nurse.joinDate}
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger
														render={
															<Button variant="ghost" className="h-8 w-8 p-0">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														}
													></DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem className="cursor-pointer">
															<FileEdit className="mr-2 h-4 w-4" /> 編輯資料
														</DropdownMenuItem>
														<DropdownMenuItem className="cursor-pointer">
															<CalendarDays className="mr-2 h-4 w-4" /> 查看班表
														</DropdownMenuItem>
														<DropdownMenuItem className="text-red-600 cursor-pointer">
															<Trash2 className="mr-2 h-4 w-4" /> 刪除員工
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>

						{/* --- Dialog 塞在這裡 --- */}
						<EmployeeFormDialog
							isOpen={_isDialogOpen}
							onClose={() => _setIsDialogOpen(false)}
						/>
					</div>
				</div>
			)}
		</>
	);
}
