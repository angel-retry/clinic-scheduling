"use server";
// src/app/doctors/_actions/create-doctor.ts
"use server";

import { revalidatePath } from "next/cache";
import { GetSheet } from "@/lib/google-sheets";

export async function createEmployeeAction(formData: {
	name: string;
	level: string;
	role: string;
	status: string;
	joinDate: string;
	currentHours: number;
	requiredHours: number;
}) {
	try {
		const doc = await GetSheet();
		const sheet = doc.sheetsByTitle.Employees; // 員工資料表名稱

		await sheet.addRow({
			ID: `EM${Date.now()}`,
			Name: formData.name,
			Level: formData.level,
			Role: formData.role,
			Status: formData.status,
			JoinDate: formData.joinDate,
			CurrentHours: 0,
			RequiredHours: formData.requiredHours,
			CreatedAt: new Date().toISOString(),
		});

		revalidatePath("/employees"); // 讓員工列表自動更新
		return { success: true };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}
