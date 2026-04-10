// src/app/doctors/page.tsx
"use client";

import { CalendarRange, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getDoctorAction } from "./_actions/get-doctor";
import { DoctorFormDialog } from "./_components/DoctorFormDialog";
import { DoctorListTable } from "./_components/DoctorListTable";

export default function DoctorListPage() {
	// 1. 控制 Dialog 是否顯示
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// 2. 儲存「目前正在編輯」的醫師資料（如果是新增，則為 null）
	const [editingDoctor, setEditingDoctor] = useState<any>(null);

	// 3. 控制側邊按鈕
	const [_activeTab, _setActiveTab] = useState<"list" | "schedule">("list");

	const [_isloading, _setIsLoading] = useState(false);

	const [_doctors, _setDoctors] = useState<any[]>([]);

	useEffect(() => {
		const _getDoctors = async () => {
			_setIsLoading(true);
			const _doctors = await getDoctorAction();
			_setDoctors(_doctors);
			_setIsLoading(false);
		};

		_getDoctors();
	}, []);

	console.log("醫師資料:", _doctors);
	// 處理點擊「新增」
	const handleAdd = () => {
		setEditingDoctor(null); // 清空資料
		setIsDialogOpen(true);
	};

	// 處理點擊「編輯」
	const handleEdit = (doctor: any) => {
		setEditingDoctor(doctor); // 將選中的醫師資料塞進去
		setIsDialogOpen(true);
	};

	return (
		<>
			{_isloading ? (
				<div className="flex items-center justify-center h-64">
					<span className="text-slate-500">載入中...</span>
				</div>
			) : (
				<div className="flex-1 p-8 space-y-6">
					<div className="flex justify-between items-end">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">醫師管理</h1>
							<p className="text-muted-foreground mt-1">
								設定醫師固定診表，作為護理師排班的自動連動基底。
							</p>
						</div>
						{/* 點擊觸發新增 */}
						<Button onClick={handleAdd} className="flex gap-2">
							<UserPlus size={18} /> 新增醫師
						</Button>
					</div>

					<DoctorListTable doctors={_doctors} onEdit={handleEdit} />

					{/* --- Dialog 塞在這裡 --- */}
					{/* 我們傳入 isOpen、onClose 以及當前選中的資料 */}
					<DoctorFormDialog
						isOpen={isDialogOpen}
						onClose={() => setIsDialogOpen(false)}
						initialData={editingDoctor}
					/>

					{/* 提示區塊 */}
					<div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
						<div className="text-blue-600 mt-0.5">
							<CalendarRange size={18} />
						</div>
						<div className="text-sm text-blue-800">
							<p className="font-bold">排班連動提醒：</p>
							<p className="opacity-80">
								修改醫師的固定診次後，系統將自動應用於「尚未發佈」的護理師排班月份。
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
