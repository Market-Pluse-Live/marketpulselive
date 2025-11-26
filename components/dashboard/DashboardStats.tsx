"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Radio, CheckCircle, Pause, AlertCircle, Zap } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useTheme } from "@/lib/theme-context";

interface StatItemProps {
	title: string;
	value: number;
	icon: React.ElementType;
	color: string;
	lightColor: string;
	glowColor: string;
	delay?: number;
	tooltip: string;
}

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		let startTime: number;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
			
			// Easing function for smooth animation
			const easeOut = 1 - Math.pow(1 - progress, 3);
			setDisplayValue(Math.floor(easeOut * value));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [value, duration]);

	return <span>{displayValue}</span>;
}

function StatItem({ title, value, icon: Icon, color, lightColor, glowColor, delay = 0, tooltip }: StatItemProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	
	return (
		<Tooltip content={tooltip}>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ delay, duration: 0.4, ease: "easeOut" }}
				whileHover={{ scale: 1.03, y: -2 }}
				className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 cursor-default group ${isDark ? color : lightColor}`}
			>
				{/* Glow effect */}
				<div className={`absolute inset-0 ${glowColor} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
				
				<div className="relative flex items-center justify-between">
					<div>
						<p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
							{title}
						</p>
						<p className="text-2xl font-bold">
							<AnimatedCounter value={value} />
						</p>
					</div>
					<div className={`p-2.5 rounded-xl ${color.includes("emerald") ? "bg-emerald-500/20" : color.includes("blue") ? "bg-blue-500/20" : color.includes("amber") ? "bg-amber-500/20" : color.includes("red") ? "bg-red-500/20" : color.includes("purple") ? "bg-purple-500/20" : "bg-gray-500/20"}`}>
						<Icon className="h-5 w-5" />
					</div>
				</div>
			</motion.div>
		</Tooltip>
	);
}

interface DashboardStatsProps {
	totalRooms: number;
	liveRooms: number;
	activeRooms: number;
	readyRooms: number;
	notConfigured: number;
	errors: number;
}

export function DashboardStats({
	totalRooms,
	liveRooms,
	activeRooms,
	readyRooms,
	notConfigured,
	errors,
}: DashboardStatsProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	
	const stats = [
		{
			title: "Total Rooms",
			value: totalRooms,
			icon: LayoutGrid,
			color: "border-purple-500/30 bg-purple-500/10 text-purple-300",
			lightColor: "border-purple-200 bg-purple-50 text-purple-700",
			glowColor: "bg-purple-500/20",
			tooltip: "Total number of streaming rooms",
		},
		{
			title: "Live Now",
			value: liveRooms,
			icon: Radio,
			color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
			lightColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
			glowColor: "bg-emerald-500/20",
			tooltip: "Rooms currently streaming live",
		},
		{
			title: "Active",
			value: activeRooms,
			icon: CheckCircle,
			color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
			lightColor: "border-blue-200 bg-blue-50 text-blue-700",
			glowColor: "bg-blue-500/20",
			tooltip: "Rooms that are turned on",
		},
		{
			title: "Ready",
			value: readyRooms,
			icon: Pause,
			color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
			lightColor: "border-amber-200 bg-amber-50 text-amber-700",
			glowColor: "bg-amber-500/20",
			tooltip: "Configured but not active",
		},
		{
			title: "Not Set",
			value: notConfigured,
			icon: AlertCircle,
			color: "border-gray-500/30 bg-gray-500/10 text-gray-300",
			lightColor: "border-gray-200 bg-gray-100 text-gray-600",
			glowColor: "bg-gray-500/20",
			tooltip: "Rooms without stream URL",
		},
		{
			title: "Errors",
			value: errors,
			icon: Zap,
			color: "border-red-500/30 bg-red-500/10 text-red-300",
			lightColor: "border-red-200 bg-red-50 text-red-700",
			glowColor: "bg-red-500/20",
			tooltip: "Rooms with configuration errors",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="mb-8"
		>
			<motion.h2
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
			>
				Overview
			</motion.h2>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
				{stats.map((stat, index) => (
					<StatItem key={stat.title} {...stat} delay={index * 0.05} />
				))}
			</div>
		</motion.div>
	);
}
