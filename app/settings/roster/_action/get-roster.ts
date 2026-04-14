// app/settings/roster/_action/get-roster.ts
"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function getRosterConfig() {
	try {
		const _doc = await GetSheet();
		const _sheet = _doc.sheetsByTitle.RoleConfigs;

		if (!_sheet) {
			return { success: false, data: [] };
		}

		// 取得所有資料列
		const rows = await _sheet.getRows();

		// 將 Google Sheets 的 Row 物件轉回前端使用的 RoleConfig 格式
		const configs = rows.map((row) => ({
			id: row.get("RoleId"),
			label: row.get("Label"),
			type: row.get("Type"),
			value: parseInt(row.get("Value"), 10) || 0,
		}));

		return { success: true, data: configs };
	} catch (error) {
		console.error("Google Sheets Fetch Error:", error);
		return { success: false, data: [] };
	}
}
