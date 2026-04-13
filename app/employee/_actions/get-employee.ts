"use server";

import { GetSheet } from "@/lib/google-sheets";

export async function getEmployeesAction() {
	try {
		const _doc = await GetSheet();
		const _sheet = _doc.sheetsByTitle.Employees;
		const _rows = await _sheet.getRows();

		return _rows.map((row) => ({
			id: row.get("ID"),
			name: row.get("Name"),
			level: row.get("Level"),
			role: row.get("Role"),
			status: row.get("Status"),
			joinDate: row.get("JoinDate"),
			currentHours: row.get("CurrentHours"),
			requiredHours: row.get("RequiredHours"),
		}));
	} catch (_error) {
		console.error("Error fetching doctor data:", _error);
		return [];
	}
}
