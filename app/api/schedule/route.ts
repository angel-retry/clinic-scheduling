import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { NextResponse } from "next/server";

// 封裝一個取得 Google Sheet 實例的函式
async function getSheet() {
	const serviceAccountAuth = new JWT({
		email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
		key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
		scopes: ["https://www.googleapis.com/auth/spreadsheets"],
	});

	const doc = new GoogleSpreadsheet(
		process.env.GOOGLE_SHEET_ID!,
		serviceAccountAuth,
	);
	await doc.loadInfo(); // 載入檔案資訊
	return doc;
}

// GET: 讀取排班資料
export async function GET() {
	try {
		const doc = await getSheet();

		const sheet = doc.sheetsByTitle.Schedule_Records; // 確保 Sheet 名稱正確
		const rows = await sheet.getRows();

		const data = rows.map((row) => ({
			id: row.get("ID"),
			date: row.get("Date"),
			shift: row.get("ShiftID"),
			staff: row.get("StaffID"),
			room: row.get("RoomID"),
		}));

		return NextResponse.json(data);
	} catch (error: any) {
		// 將錯誤詳細資訊印在終端機 (Terminal)
		console.error("完整錯誤詳情:", error);
		return NextResponse.json(
			{
				error: "讀取失敗",
				message: error.message, // 這裡會告訴你為什麼失敗
				stack: error.stack,
			},
			{ status: 500 },
		);
	}
}

// POST: 新增排班紀錄
export async function POST(request: Request) {
	try {
		const body = await request.json(); // 接收前端傳來的 JSON 資料
		const doc = await getSheet();
		const sheet = doc.sheetsByTitle.Schedule_Records;

		if (!sheet) {
			throw new Error("找不到 Schedule_Records 分頁");
		}

		// 將資料新增到試算表
		// 注意：物件的 Key 必須與 Excel 第一列的標題文字「完全一致」
		const newRow = await sheet.addRow({
			ID: crypto.randomUUID(), // 自動產生唯一 ID
			Date: body.date, // 格式建議：YYYY-MM-DD
			ShiftID: body.shift, // 例如：M, A, N
			StaffID: body.staff, // 例如：王醫師
			RoomID: body.room, // 例如：診間 1
		});

		return NextResponse.json({
			message: "排班成功",
			data: { id: newRow.get("ID") },
		});
	} catch (error: any) {
		console.error("寫入失敗:", error);
		return NextResponse.json(
			{ error: "寫入失敗", message: error.message },
			{ status: 500 },
		);
	}
}
