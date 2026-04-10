"use client";
import { useEffect, useState } from "react";

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [schedules, setSchedules] = useState([]);

	useEffect(() => {
		fetch("/api/schedule")
			.then((res) => res.json())
			.then((data) => setSchedules(data));
	}, []);

	const handleAddSchedule = async () => {
		setLoading(true);
		const testData = {
			date: "2026-05-10",
			shift: "N", // 晚診
			staff: "魏醫師",
			room: "診間二",
		};

		try {
			const res = await fetch("/api/schedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(testData),
			});

			const result = await res.json();
			if (res.ok) {
				alert("排班成功！請查看 Google Sheet");
				window.location.reload(); // 重新整理看結果
			} else {
				alert(`失敗：${result.message}`);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	console.log(schedules);

	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold mb-4">診所排班看板</h1>
			<div className="grid gap-4">
				{Array.isArray(schedules) &&
					schedules.map((item: any) => (
						<div key={item.id} className="p-4 border rounded shadow">
							<p>日期：{item.date}</p>
							<p>
								人員：{item.staff} ({item.shift})
							</p>
						</div>
					))}
			</div>

			<h1 className="text-2xl font-bold mb-4">排班測試</h1>
			<button
				onClick={handleAddSchedule}
				disabled={loading}
				className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
			>
				{loading ? "寫入中..." : "手動新增一筆班表 (測試用)"}
			</button>
		</main>
	);
}
