// app/settings/roster/_action/get-roster.ts
"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function getShifts() {
	try {
		const _doc = await GetSheet();
		const _sheet = _doc.sheetsByTitle.ShiftConfigs;

		if (!_sheet) {
			return { success: false, data: [] };
		}

		// 取得所有資料列
		const rows = await _sheet.getRows();

		// 將 Google Sheets 的 Row 物件轉回前端使用的 ShiftConfig 格式
		const configs = rows.map((row) => ({
			id: row.get("id"),
			name: row.get("name"),
			code: row.get("code"),
			bg_color: row.get("bg_color"),
			text_color: row.get("text_color"),
			start_time: row.get("start_time"),
			end_time: row.get("end_time"),
		}));

		return { success: true, data: configs };
	} catch (error) {
		console.error("Google Sheets Fetch Error:", error);
		return { success: false, data: [] };
	}
}
