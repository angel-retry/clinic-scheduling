"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function getDoctorAction() {
	try {
		const _doc = await GetSheet();
		const _sheet = _doc.sheetsByTitle.Doctors;
		const _rows = await _sheet.getRows();

		return _rows.map((row) => ({
			id: row.get("ID"),
			name: row.get("Name"),
			specialty: row.get("Specialty"),
			effectiveDate: row.get("EffectiveDate"),
			// 把存進去的 JSON 字串轉回物件，或轉成陣列顯示
			schedule: JSON.parse(row.get("WeeklyTemplate") || "{}"),
			status: row.get("Status"),
		}));
	} catch (_error) {
		console.error("Error fetching doctor data:", _error);
		return [];
	}
}
