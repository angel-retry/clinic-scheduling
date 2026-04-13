"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createEmployeeAction } from "../_actions/create-employee";

export function EmployeeFormDialog({
	isOpen,
	onClose,
	initialData,
}: {
	isOpen: boolean;
	onClose: () => void;
	initialData?: any;
}) {
	// 狀態管理
	const [formData, setFormData] = useState({
		name: "",
		level: "N1",
		role: "",
		status: "在職",
		requiredHours: 160,
		joinDate: new Date().toISOString().split("T")[0],
	});

	const [_isloading, _setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen && initialData) {
			setFormData({
				name: initialData.name || "",
				level: initialData.level || "N1",
				role: initialData.role || "",
				status: initialData.status || "在職",
				requiredHours: initialData.requiredHours || 160,
				joinDate: initialData.joinDate || "",
			});
		}
	}, [isOpen, initialData]);

	const handleSubmit = async () => {
		// 這裡調用你的 Action，例如 updateEmployeeAction(formData)
		console.log("提交員工資料:", formData);
		const _payload = formData;

		try {
			_setIsLoading(true);
			const _result = await createEmployeeAction(_payload);

			if (_result.success) {
				alert(`員工資料已儲存`);
			}
		} catch (error) {
			alert(`儲存失敗`);
			console.error("儲存員工資料失敗:", error);
		} finally {
			_setIsLoading(false);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{initialData ? "編輯員工資訊" : "新增員工資料"}
					</DialogTitle>
				</DialogHeader>

				<div className="grid gap-5 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">姓名</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="level">職級</Label>
							<Select
								value={formData.level}
								onValueChange={(val) =>
									setFormData({ ...formData, level: val })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="選擇職級" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="N1">N1</SelectItem>
									<SelectItem value="N2">N2</SelectItem>
									<SelectItem value="N3">N3</SelectItem>
									<SelectItem value="N4">N4</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="role">職位名稱</Label>
							<Input
								id="role"
								value={formData.role}
								placeholder="例如：護理師"
								onChange={(e) =>
									setFormData({ ...formData, role: e.target.value })
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="status">狀態</Label>
							<Select
								value={formData.status}
								onValueChange={(val) =>
									setFormData({ ...formData, status: val })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="在職">在職</SelectItem>
									<SelectItem value="離職">離職</SelectItem>
									<SelectItem value="休假">休假</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="hours">本月應休/應上工時</Label>
							<Input
								id="hours"
								type="number"
								value={formData.requiredHours}
								onChange={(e) =>
									setFormData({
										...formData,
										requiredHours: Number(e.target.value),
									})
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="joinDate">到職日期</Label>
							<Input
								id="joinDate"
								type="date"
								value={formData.joinDate}
								onChange={(e) =>
									setFormData({ ...formData, joinDate: e.target.value })
								}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						取消
					</Button>
					<Button onClick={handleSubmit} disabled={_isloading}>
						{_isloading ? "儲存中..." : "儲存資料"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
