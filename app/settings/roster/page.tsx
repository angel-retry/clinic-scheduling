"use client";

import { ArrowRight, Info, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getRosterConfig } from "./_action/get-roster";
// 1. 引入你的 Server Action
import { updateRosterConfig } from "./_action/update-roster";

interface RoleConfig {
	id: string;
	label: string;
	type: "per_doctor" | "fixed";
	value: number;
}

export default function ConfigurationPage() {
	const [configs, setConfigs] = useState<RoleConfig[]>([]);
	const [_isLoading, _setIsLoading] = useState(true);
	const [_isSaving, _setIsSaving] = useState(false);

	// 頁面載入時自動取得資料
	useEffect(() => {
		async function init() {
			const result = await getRosterConfig();
			if (result.success && result.data.length > 0) {
				setConfigs(result.data);
			}
			_setIsLoading(false);
		}
		init();
	}, []);

	// 新增職務
	const addRole = () => {
		const newId = `role_${Date.now()}`;
		setConfigs([
			...configs,
			{ id: newId, label: "新職務", type: "fixed", value: 1 },
		]);
	};

	// 修正後的刪除職務 (修正了原本 d !== id 的錯誤)
	const removeRole = (id: string) => {
		setConfigs(configs.filter((c) => c.id !== id));
	};

	// 更新配置項目
	const updateConfig = (id: string, field: keyof RoleConfig, val: any) => {
		setConfigs(configs.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
	};

	// 2. 實作儲存邏輯
	const _handleSave = async () => {
		_setIsSaving(true);
		try {
			const result = await updateRosterConfig(configs);
			if (result.success) {
				alert("設定儲存成功，已同步至 Google Sheets！");
			} else {
				alert(`儲 msg: ${result.error}`);
			}
		} catch (error) {
			console.error(error);
			alert("連線發生錯誤");
		} finally {
			_setIsSaving(false);
		}
	};

	if (_isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<Loader2 className="animate-spin text-indigo-600" size={40} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-end mb-8">
					<div>
						<h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
							<span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
							人力配置基準設定
						</h1>
						<p className="text-slate-500 text-sm mt-2">
							在此設定各職務的人力需求邏輯，設定將作為排班頁面的「基底」依據。
						</p>
					</div>
					{/* 3. 綁定 handleSave 並處理 Loading 樣式 */}
					<button
						type="button"
						disabled={_isSaving}
						onClick={_handleSave}
						className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{_isSaving ? (
							<Loader2 className="animate-spin" size={18} />
						) : (
							<Save size={18} />
						)}
						{_isSaving ? "儲存中..." : "儲存設定"}
					</button>
				</div>

				<div className="grid gap-6">
					{configs.map((role) => (
						<div
							key={role.id}
							className="bg-white border-2 border-transparent hover:border-indigo-100 rounded-2xl p-6 shadow-sm transition-all flex flex-col md:flex-row items-center gap-6"
						>
							<div className="flex-1">
								<label className="block text-xs font-bold text-slate-400 uppercase mb-1">
									職務名稱
								</label>
								<input
									type="text"
									value={role.label}
									onChange={(e) =>
										updateConfig(role.id, "label", e.target.value)
									}
									className="text-lg font-bold text-slate-700 bg-transparent border-b-2 border-slate-100 focus:border-indigo-500 outline-none w-full pb-1"
								/>
							</div>

							<div className="flex-[2] flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
								<div className="flex-1">
									<label className="block text-[10px] font-bold text-slate-400 mb-2">
										計算模式
									</label>
									<select
										value={role.type}
										onChange={(e) =>
											updateConfig(role.id, "type", e.target.value)
										}
										className="w-full bg-white border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
									>
										<option value="per_doctor">隨醫生人數倍增 (動態)</option>
										<option value="fixed">固定人力需求 (不論醫數)</option>
									</select>
								</div>

								<div className="w-24">
									<label className="block text-[10px] font-bold text-slate-400 mb-2">
										需求人數
									</label>
									<div className="relative">
										<input
											type="number"
											value={role.value}
											min={0}
											onChange={(e) =>
												updateConfig(
													role.id,
													"value",
													parseInt(e.target.value, 10) || 0,
												)
											}
											className="w-full border rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
										/>
										<span className="absolute right-3 top-2 text-xs text-slate-400">
											位
										</span>
									</div>
								</div>
							</div>

							<div className="flex-1 text-slate-500 text-sm italic flex items-center gap-2">
								<Info size={14} className="text-indigo-400" />
								<span>
									{role.type === "per_doctor"
										? `若有 2 名醫生，需 ${role.value * 2} 位`
										: `只要有開診，固定需 ${role.value} 位`}
								</span>
							</div>

							<button
								type="button"
								onClick={() => removeRole(role.id)}
								className="p-2 text-slate-300 hover:text-red-500 transition-colors"
							>
								<Trash2 size={20} />
							</button>
						</div>
					))}

					<button
						type="button"
						onClick={addRole}
						className="border-2 border-dashed border-slate-200 rounded-2xl py-4 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
					>
						<Plus size={18} /> 新增職務配置項目
					</button>
				</div>

				{/* 底部預覽維持不變，僅修正與狀態連動的部分 */}
				<div className="mt-12 bg-indigo-900 rounded-2xl p-6 text-white shadow-xl">
					<h2 className="text-lg font-bold mb-4 flex items-center gap-2">
						<ArrowRight className="text-indigo-400" /> 排班頁面套用預覽
					</h2>
					<div className="grid grid-cols-3 gap-4 border-t border-indigo-800 pt-4">
						<div className="text-center">
							<p className="text-indigo-300 text-xs">當該診有 1 位醫生時</p>
							<div className="mt-2 text-sm">
								{configs.map((c) => (
									<div key={c.id}>
										{c.label}:{" "}
										<span className="font-bold text-indigo-200">{c.value}</span>{" "}
										人
									</div>
								))}
							</div>
						</div>
						<div className="text-center border-x border-indigo-800 px-4">
							<p className="text-indigo-300 text-xs">當該診有 2 位醫生時</p>
							<div className="mt-2 text-sm">
								{configs.map((c) => (
									<div key={c.id}>
										{c.label}:{" "}
										<span className="font-bold text-indigo-200">
											{c.type === "per_doctor" ? c.value * 2 : c.value}
										</span>{" "}
										人
									</div>
								))}
							</div>
						</div>
						<div className="text-center">
							<p className="text-indigo-300 text-xs">當該診無醫生時</p>
							<div className="mt-2 text-sm text-indigo-400 italic">
								所有職務需求均為 0
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
