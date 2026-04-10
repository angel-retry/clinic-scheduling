"use client";

import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const DoctorPageSideBar = () => {
	const pathname = usePathname();

	const menuItems = [
		{ id: "list", label: "醫師列表", icon: Users, href: "/doctors" },
		{
			id: "schedule",
			label: "固定診表",
			icon: CalendarDays,
			href: "/doctors/schedule",
		},
	];

	return (
		<div className="w-[120px] flex flex-col gap-2 p-4 border-r bg-slate-50/50 h-full">
			{menuItems.map((item) => {
				const isActive = pathname === item.href;
				const Icon = item.icon;

				return (
					<Link
						key={item.id}
						href={item.href}
						className={cn(
							"flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
							isActive
								? "bg-white shadow-md text-blue-600"
								: "text-slate-500 hover:bg-white",
						)}
					>
						<Icon size={20} />
						<span className="text-xs font-medium">{item.label}</span>
					</Link>
				);
			})}
		</div>
	);
};

// 重點在這裡：必須匯出
export default DoctorPageSideBar;
