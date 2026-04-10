"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDoctorAction } from "../_actions/create-doctor";

// 定義一週的天數與診次時段
const DAYS = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
const SLOTS = [
	{ id: "morning", label: "早診" },
	{ id: "afternoon", label: "午診" },
	{ id: "evening", label: "晚診" },
];

export function DoctorFormDialog({
	isOpen,
	onClose,
	initialData,
}: {
	isOpen: boolean;
	onClose: () => void;
	initialData?: any;
}) {
	// 狀態管理：醫師姓名、生效日期、排班表
	const [name, setName] = useState(initialData?.name || "");
	const [effectiveDate, setEffectiveDate] = useState(
		initialData?.effectiveDate || "2026-04-01",
	);

	// 排班表狀態 (例如：{ "週一-morning": true })
	const [schedule, setSchedule] = useState<Record<string, boolean>>(
		initialData?.schedule || {},
	);

	// 關鍵：當 Dialog 開啟或 initialData 改變時，重設 state
	useEffect(() => {
		if (isOpen) {
			setName(initialData?.name || "");
			setEffectiveDate(initialData?.effectiveDate || "2026-04-01");
			setSchedule(initialData?.schedule || {});
		}
	}, [isOpen, initialData]);

	const toggleSlot = (day: string, slot: string) => {
		const key = `${day}-${slot}`;
		setSchedule((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleSubmit = async () => {
		// 1. 整理資料
		const _payload = {
			name: name,
			specialty: "一般科",
			effectiveDate: effectiveDate,
			schedule: schedule,
		};

		// 2. 執行 Server Action
		const _result = await createDoctorAction(_payload);

		if (_result.success) {
			console.log("儲存醫師資料:", _payload);
			// 成功後關閉彈窗
			onClose();
			// 你可以在這裡加個 toast 提示家人「存好了！」
		} else {
			alert(`儲存失敗`);
		}

		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{initialData ? "編輯醫師資訊" : "新增醫師資料"}
					</DialogTitle>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					{/* 基本資訊 */}
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">醫師姓名</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="例如：王大明"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="date">排班生效日期</Label>
							<div className="relative">
								<Input
									id="date"
									type="date"
									value={effectiveDate}
									onChange={(e) => setEffectiveDate(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="grid gap-2">
						<Label>固定週診設定 (勾選代表該時段有診)</Label>
						<div className="border rounded-md p-4 bg-slate-50">
							{/* 診表頭部 */}
							<div className="grid grid-cols-8 mb-2 border-b pb-2 text-center text-xs font-bold text-slate-500">
								<div>時段</div>
								{DAYS.map((d) => (
									<div key={d}>{d}</div>
								))}
							</div>

							{/* 診表身體 */}
							{SLOTS.map((slot) => (
								<div
									key={slot.id}
									className="grid grid-cols-8 items-center py-2 border-b last:border-0"
								>
									<div className="text-xs font-medium text-slate-600">
										{slot.label}
									</div>
									{DAYS.map((day) => (
										<div
											key={`${day}-${slot.id}`}
											className="flex justify-center"
										>
											<Checkbox
												checked={schedule[`${day}-${slot.id}`] || false}
												onCheckedChange={() => toggleSlot(day, slot.id)}
												className="h-5 w-5"
											/>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						取消
					</Button>
					<Button onClick={handleSubmit}>儲存資料</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
