// lib/staffing-logic.ts

export interface RoleConfig {
	id: string;
	label: string;
	type: "per_doctor" | "fixed";
	value: number;
}

/**
 * 核心計算引擎：根據醫生人數與配置規則，算出應有人數
 */
export function calculateRequiredCount(
	drCount: number,
	config: RoleConfig,
): number {
	if (drCount === 0) return 0;

	if (config.type === "per_doctor") {
		return drCount * config.value;
	}

	if (config.type === "fixed") {
		return config.value;
	}

	return 0;
}
