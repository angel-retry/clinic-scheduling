import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

// 封裝一個取得 Google Sheet 實例的函式
export async function GetSheet() {
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
