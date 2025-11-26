"use client";

import { motion } from "framer-motion";
import { Circle, AlertCircle, CheckCircle, Radio, Pause } from "lucide-react";
import type { RoomStatus } from "@/lib/types";

interface RoomStatusBadgeProps {
	status: RoomStatus;
	size?: "sm" | "md";
	showPulse?: boolean;
}

const statusConfig: Record<RoomStatus, { 
	label: string; 
	color: string; 
	bgColor: string; 
	borderColor: string;
	icon: React.ElementType;
	glow?: string;
}> = {
	live: {
		label: "Live",
		color: "text-emerald-300",
		bgColor: "bg-emerald-500/15",
		borderColor: "border-emerald-500/30",
		icon: Radio,
		glow: "shadow-emerald-500/30",
	},
	active: {
		label: "Active",
		color: "text-blue-300",
		bgColor: "bg-blue-500/15",
		borderColor: "border-blue-500/30",
		icon: CheckCircle,
	},
	configured: {
		label: "Ready",
		color: "text-amber-300",
		bgColor: "bg-amber-500/15",
		borderColor: "border-amber-500/30",
		icon: Circle,
	},
	inactive: {
		label: "Not Set",
		color: "text-gray-400",
		bgColor: "bg-gray-500/15",
		borderColor: "border-gray-500/30",
		icon: Pause,
	},
	error: {
		label: "Error",
		color: "text-red-300",
		bgColor: "bg-red-500/15",
		borderColor: "border-red-500/30",
		icon: AlertCircle,
	},
};

export function RoomStatusBadge({ status, size = "sm", showPulse = true }: RoomStatusBadgeProps) {
	const config = statusConfig[status];
	const Icon = config.icon;
	const sizeClasses = size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs";
	const isLive = status === "live";

	return (
		<motion.span
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${config.bgColor} ${config.borderColor} ${config.color} ${sizeClasses} ${config.glow ? `shadow-lg ${config.glow}` : ""}`}
		>
			{isLive && showPulse ? (
				<span className="relative flex h-2 w-2">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
					<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
				</span>
			) : (
				<Icon className="h-3 w-3" />
			)}
			{config.label}
		</motion.span>
	);
}
