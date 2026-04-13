// src/app/doctors/_actions/update-doctor.ts
"use server";

import { revalidatePath } from "next/cache";
import { GetSheet } from "@/lib/google-sheets";

export async function updateEmployeeAction(formData: {
	id: string; // 必須提供 ID 才能找到對應的列
	name: string;
	level: string;
	role: string;
	status: string;
	requiredHours: number;
	joinDate: string;
	schedule: Record<string, boolean>;
}) {
	try {
		const doc = await GetSheet();
		const sheet = doc.sheetsByTitle.Employees;

		// 1. 取得所有列資料
		const rows = await sheet.getRows();

		// 2. 尋找對應的 ID (假設你的 ID 欄位名稱是 "ID")
		const rowToUpdate = rows.find((row) => row.get("ID") === formData.id);

		if (!rowToUpdate) {
			return { success: false, message: "找不到該醫師資料" };
		}

		// 3. 更新欄位內容
		rowToUpdate.set("Name", formData.name);
		rowToUpdate.set("Level", formData.level);
		rowToUpdate.set("Role", formData.role);
		rowToUpdate.set("Status", formData.status);
		rowToUpdate.set("RequiredHours", formData.requiredHours);
		rowToUpdate.set("JoinDate", formData.joinDate);
		rowToUpdate.set("WeeklyTemplate", JSON.stringify(formData.schedule));
		// 如果有修改時間也可以記錄
		rowToUpdate.set("UpdatedAt", new Date().toISOString());

		// 4. 儲存變更
		await rowToUpdate.save();

		// 5. 重新驗證快取
		revalidatePath("/employees");

		return { success: true };
	} catch (error) {
		console.error("Update Employee Error:", error);
		return { success: false };
	}
}
