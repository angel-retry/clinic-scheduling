// src/app/doctors/_actions/create-doctor.ts
"use server";

import { revalidatePath } from "next/cache";
import { GetSheet } from "@/lib/google-sheets";

export async function createDoctorAction(formData: {
	name: string;
	specialty: string;
	effectiveDate: string;
	schedule: Record<string, boolean>;
}) {
	try {
		const doc = await GetSheet();
		const sheet = doc.sheetsByTitle.Doctors; // 醫師資料表名稱

		await sheet.addRow({
			ID: `DR${Date.now()}`,
			Name: formData.name,
			Specialty: formData.specialty,
			EffectiveDate: formData.effectiveDate,
			WeeklyTemplate: JSON.stringify(formData.schedule),
			Status: "active",
			CreatedAt: new Date().toISOString(),
		});

		revalidatePath("/doctors"); // 讓醫師列表自動更新
		return { success: true };
	} catch (error) {
		console.error(error);
		return { success: false };
	}
}
