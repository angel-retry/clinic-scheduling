"use client";

import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
			{/* 背景裝飾：增加專業感 */}
			<div className="absolute inset-0 z-0 overflow-hidden">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
				<div className="absolute top-0 -right-24 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 text-center border border-slate-100">
					{/* Logo 示意 */}
					<div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-10 w-10 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>

					<h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
						診所管理系統
					</h1>
					<p className="text-slate-500 mb-10 text-sm leading-relaxed">
						Clinic Management System v1.0 <br />
						歡迎回來，請選擇功能模組開始操作
					</p>

					<div className="space-y-4">
						<Link
							href="/schedule"
							className="group flex items-center justify-between w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
						>
							{/* 加入 text-left 確保文字靠左，flex-1 確保佔滿剩餘空間 */}
							<span className="text-white text-left flex-1">進入排班看板</span>

							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 flex-shrink-0 transform group-hover:translate-x-1 transition-transform"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								/>
							</svg>
						</Link>
					</div>
				</div>

				<p className="mt-8 text-center text-slate-400 text-xs">
					© 2026 Clinic Admin. All rights reserved.
				</p>
			</div>
		</main>
	);
}
