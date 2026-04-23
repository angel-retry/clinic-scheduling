"use server";

import { revalidatePath } from "next/cache";
import { GetSheet } from "@/lib/google-sheets";

export async function saveScheduleAction(records: any[]) {
	if (records.length === 0) return { success: true };

	try {
		const doc = await GetSheet();
		const sheet = doc.sheetsByTitle.Schedule_Records;
		const rows = await sheet.getRows();

		// 建立索引 Map
		const rowMap = new Map(rows.map((r) => [r.get("record_id"), r]));
		const newRows = [];
		const updatePromises = [];

		for (const rec of records) {
			const existingRow = rowMap.get(rec.record_id);
			if (existingRow) {
				// 更新模式
				existingRow.set("shift_code", rec.shift_code);
				existingRow.set("last_updated", new Date().toISOString());
				updatePromises.push(existingRow.save());
			} else {
				// 新增模式
				newRows.push({
					...rec,
					last_updated: new Date().toISOString(),
					status: "published",
				});
			}
		}

		// 同步執行：並行更新舊行 + 批次寫入新行
		await Promise.all([
			...updatePromises,
			newRows.length > 0 ? sheet.addRows(newRows) : Promise.resolve(),
		]);

		revalidatePath("/schedule");
		return { success: true };
	} catch (error) {
		console.error("儲存失敗:", error);
		return { success: false };
	}
}
