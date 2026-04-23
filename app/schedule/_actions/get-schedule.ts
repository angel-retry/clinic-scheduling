// src/app/schedule/_actions/get-schedule.ts
"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function getScheduleAction(year: number, month: number) {
	try {
		const doc = await GetSheet();
		const sheet = doc.sheetsByTitle.Schedule_Records;
		const rows = await sheet.getRows();

		const monthPrefix = `${year}${month.toString().padStart(2, "0")}`;

		console.log(`正在取得 ${monthPrefix} 的排班資料...`);

		// 篩選符合年月的資料，並且只回傳必要的欄位 (ID, Date, ShiftCode)
		const filteredData = rows
			.filter((row) => row.get("date").startsWith(monthPrefix))
			.map((row) => ({
				record_id: row.get("record_id"),
				employee_id: row.get("employee_id"),
				date: row.get("date"), // 格式為 20260401
				shift_code: row.get("shift_code"),
			}));

		return { success: true, data: filteredData };
	} catch (error) {
		console.error("Get Schedule Error:", error);
		return { success: false, data: [] };
	}
}
