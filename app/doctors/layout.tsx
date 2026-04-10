// app/doctors/layout.tsx

import DoctorPageSideBar from "./_components/DoctorPageSideBar";

export default function DoctorsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen bg-white">
			{/* 側邊欄固定在左邊 */}
			<DoctorPageSideBar />

			{/* 右側會根據路由動態顯示 page.tsx 或 schedule/page.tsx */}
			<main className="flex-1 overflow-auto bg-slate-50/30">{children}</main>
		</div>
	);
}
