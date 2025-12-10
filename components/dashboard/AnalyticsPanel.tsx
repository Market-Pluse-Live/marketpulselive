"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Users, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useTheme } from "@/lib/theme-context";

// Mock data for charts
const viewerData = [
	{ time: "00:00", viewers: 45 },
	{ time: "04:00", viewers: 32 },
	{ time: "08:00", viewers: 78 },
	{ time: "12:00", viewers: 156 },
	{ time: "16:00", viewers: 234 },
	{ time: "20:00", viewers: 189 },
	{ time: "24:00", viewers: 145 },
];

const bitrateData = [
	{ time: "00:00", bitrate: 4500 },
	{ time: "04:00", bitrate: 4800 },
	{ time: "08:00", bitrate: 5200 },
	{ time: "12:00", bitrate: 4900 },
	{ time: "16:00", bitrate: 5100 },
	{ time: "20:00", bitrate: 4700 },
	{ time: "24:00", bitrate: 5000 },
];

interface StatBlockProps {
	label: string;
	value: string;
	change?: string;
	positive?: boolean;
	icon: React.ElementType;
	isDark: boolean;
}

function StatBlock({ label, value, change, positive, icon: Icon, isDark }: StatBlockProps) {
	return (
		<div className={`p-4 rounded-xl border ${
			isDark 
				? "bg-gray-800/40 border-gray-700/50" 
				: "bg-gray-50 border-gray-200"
		}`}>
			<div className="flex items-center justify-between mb-2">
				<p className={`text-[10px] uppercase tracking-wider font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
				<Icon className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
			</div>
			<div className="flex items-end gap-2">
				<p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
				{change && (
					<span className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
						{positive ? "↑" : "↓"} {change}
					</span>
				)}
			</div>
		</div>
	);
}

export function AnalyticsPanel() {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [timeRange, setTimeRange] = useState("24h");
	const [canRender, setCanRender] = useState(false);

	// Prevent Recharts from rendering during SSR (causes width/height -1 error)
	useEffect(() => {
		setCanRender(true);
	}, []);

	if (!canRender) {
		return (
			<div className={`rounded-2xl border backdrop-blur-sm overflow-hidden h-96 animate-pulse ${
				isDark 
					? "border-gray-800 bg-gray-900/50" 
					: "border-gray-200 bg-white/80"
			}`} />
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
			className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
				isDark 
					? "border-gray-800 bg-gray-900/50" 
					: "border-gray-200 bg-white/80"
			}`}
		>
			{/* Header */}
			<div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-gray-800" : "border-gray-200"}`}>
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-lg bg-blue-500/20">
						<BarChart3 className="h-4 w-4 text-blue-400" />
					</div>
					<div>
						<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Analytics</h3>
						<p className={`text-[10px] uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>Stream performance</p>
					</div>
				</div>
				
				{/* Time Range Selector */}
				<button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
					isDark 
						? "bg-gray-800 text-gray-300 hover:bg-gray-700"
						: "bg-gray-100 text-gray-600 hover:bg-gray-200"
				}`}>
					{timeRange}
					<ChevronDown className="h-3 w-3" />
				</button>
			</div>

			{/* Stats */}
			<div className="p-5 grid grid-cols-2 gap-3">
				<StatBlock 
					label="Peak Viewers" 
					value="234" 
					change="12%" 
					positive 
					icon={Users} 
					isDark={isDark}
				/>
				<StatBlock 
					label="Avg. Watch Time" 
					value="24m" 
					change="8%" 
					positive 
					icon={Clock} 
					isDark={isDark}
				/>
				<StatBlock 
					label="Stream Uptime" 
					value="99.2%" 
					change="0.3%" 
					positive={false} 
					icon={TrendingUp} 
					isDark={isDark}
				/>
				<StatBlock 
					label="Avg. Bitrate" 
					value="4.9k" 
					change="2%" 
					positive 
					icon={BarChart3} 
					isDark={isDark}
				/>
			</div>

			{/* Viewer Chart */}
			<div className="px-5 pb-5">
				<p className={`text-[10px] uppercase tracking-wider font-medium mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Viewers Over Time</p>
				<div className="h-32 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={viewerData}>
							<defs>
								<linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
									<stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
								</linearGradient>
							</defs>
							<XAxis 
								dataKey="time" 
								axisLine={false} 
								tickLine={false} 
								tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#9ca3af' }}
							/>
							<YAxis 
								axisLine={false} 
								tickLine={false} 
								tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#9ca3af' }}
								width={30}
							/>
							<RechartsTooltip
								contentStyle={{
									backgroundColor: isDark ? '#1f2937' : '#ffffff',
									border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
									borderRadius: '8px',
									fontSize: '12px',
									color: isDark ? '#fff' : '#111827',
								}}
								labelStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
							/>
							<Area 
								type="monotone" 
								dataKey="viewers" 
								stroke="#8b5cf6" 
								strokeWidth={2}
								fill="url(#viewerGradient)" 
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Bitrate Chart */}
			<div className="px-5 pb-5">
				<p className={`text-[10px] uppercase tracking-wider font-medium mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Bitrate (kbps)</p>
				<div className="h-24 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={bitrateData}>
							<XAxis 
								dataKey="time" 
								axisLine={false} 
								tickLine={false} 
								tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#9ca3af' }}
							/>
							<YAxis 
								axisLine={false} 
								tickLine={false} 
								tick={{ fontSize: 10, fill: isDark ? '#6b7280' : '#9ca3af' }}
								width={35}
								domain={['dataMin - 500', 'dataMax + 500']}
							/>
							<RechartsTooltip
								contentStyle={{
									backgroundColor: isDark ? '#1f2937' : '#ffffff',
									border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
									borderRadius: '8px',
									fontSize: '12px',
									color: isDark ? '#fff' : '#111827',
								}}
								labelStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
							/>
							<Line 
								type="monotone" 
								dataKey="bitrate" 
								stroke="#10b981" 
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</motion.div>
	);
}
