"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function updateRosterConfig(configs: any[]) {
	try {
		const _doc = await GetSheet();
		const _sheet = _doc.sheetsByTitle.RoleConfigs; // 確保名稱一致

		if (!_sheet) {
			return { success: false, error: "找不到 RoleConfigs 工作表" };
		}

		// 1. 清除舊資料 (從第二行開始)
		// google-spreadsheet 的 clearRows 通常處理比較麻煩，
		// MVP 最快的方法是把整個內容清空，重新寫入 Header 以外的 Rows
		await _sheet.clearRows();

		// 2. 轉換資料格式
		// google-spreadsheet 的 addRows 接受「物件陣列」，
		// key 必須對應你 Google Sheet 第一行的 Header 名稱
		const newRows = configs.map((role) => ({
			RoleId: role.id,
			Label: role.label,
			Type: role.type,
			Value: role.value,
			UpdatedAt: new Date().toLocaleString("zh-TW", {
				timeZone: "Asia/Taipei",
			}),
		}));

		// 3. 寫入新資料
		await _sheet.addRows(newRows);

		return { success: true };
	} catch (error) {
		console.error("Google Sheets Update Error:", error);
		return { success: false, error: "儲存失敗" };
	}
}
