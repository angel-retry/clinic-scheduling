"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function updateShiftsAction(configs: any[]) {
	try {
		const _doc = await GetSheet();
		// 確保這裡的名稱與你 Google Sheet 的分頁名稱完全一致
		const _sheet = _doc.sheetsByTitle.ShiftConfigs;

		if (!_sheet) {
			return { success: false, error: "找不到 ShiftConfigs 工作表" };
		}

		// 1. 清除舊資料 (從第二行開始)
		await _sheet.clearRows();

		// 2. 轉換資料格式
		// 注意：這裡的 Key (例如 ShiftId) 必須與 Google Sheet 第一行的標題完全一致
		const newRows = configs.map((shift) => ({
			id: shift.id,
			code: shift.code,
			name: shift.name,
			bg_color: shift.bg_color,
			text_color: shift.text_color,
			start_time: `'${shift.start_time}`,
			end_time: `'${shift.end_time}`,
			updated_at: new Date().toLocaleString("zh-TW", {
				timeZone: "Asia/Taipei",
			}),
		}));

		// 3. 寫入新資料
		if (newRows.length > 0) {
			await _sheet.addRows(newRows);
		}

		return { success: true };
	} catch (error) {
		console.error("Google Sheets Update Shifts Error:", error);
		return { success: false, error: "儲存班別設定失敗" };
	}
}
