"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: number;
	icon: LucideIcon;
	color: "blue" | "green" | "amber" | "red" | "gray" | "purple";
}

const colorClasses = {
	blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	red: "bg-red-500/10 text-red-400 border-red-500/20",
	gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
	purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const iconBgClasses = {
	blue: "bg-blue-500/20",
	green: "bg-emerald-500/20",
	amber: "bg-amber-500/20",
	red: "bg-red-500/20",
	gray: "bg-gray-500/20",
	purple: "bg-purple-500/20",
};

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
	return (
		<div className={`relative overflow-hidden rounded-xl border p-4 ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{title}</p>
					<p className="text-2xl font-bold">{value}</p>
				</div>
				<div className={`p-2.5 rounded-lg ${iconBgClasses[color]}`}>
					<Icon className="h-5 w-5" />
				</div>
			</div>
		</div>
	);
}

