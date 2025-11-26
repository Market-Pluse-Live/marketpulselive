"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
	BarChart3, TrendingUp, Users, Clock, Eye, Monitor, Smartphone, Tablet,
	ArrowLeft, Tv, Globe, Activity, Zap, ChevronDown, ArrowUp, ArrowDown
} from "lucide-react";
import {
	LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
	Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useTheme } from "@/lib/theme-context";
import { Navbar } from "@/components/dashboard/Navbar";

// Mock data
const viewerTrendData = [
	{ time: "00:00", viewers: 145, streams: 2 },
	{ time: "02:00", viewers: 98, streams: 2 },
	{ time: "04:00", viewers: 67, streams: 1 },
	{ time: "06:00", viewers: 89, streams: 2 },
	{ time: "08:00", viewers: 234, streams: 3 },
	{ time: "10:00", viewers: 456, streams: 4 },
	{ time: "12:00", viewers: 678, streams: 4 },
	{ time: "14:00", viewers: 543, streams: 4 },
	{ time: "16:00", viewers: 765, streams: 4 },
	{ time: "18:00", viewers: 892, streams: 4 },
	{ time: "20:00", viewers: 1023, streams: 4 },
	{ time: "22:00", viewers: 756, streams: 3 },
];

const streamHealthData = [
	{ time: "00:00", bitrate: 4500, latency: 45 },
	{ time: "04:00", bitrate: 4800, latency: 42 },
	{ time: "08:00", bitrate: 5200, latency: 38 },
	{ time: "12:00", bitrate: 4900, latency: 52 },
	{ time: "16:00", bitrate: 5100, latency: 35 },
	{ time: "20:00", bitrate: 4700, latency: 48 },
	{ time: "24:00", bitrate: 5000, latency: 40 },
];

const roomPerformanceData = [
	{ id: "room-1", name: "Main Stage", views: 12450, watchTime: 342, peakViewers: 456, avgDuration: "18m" },
	{ id: "room-2", name: "Tech Talk", views: 8932, watchTime: 245, peakViewers: 312, avgDuration: "22m" },
	{ id: "room-3", name: "Music Live", views: 7654, watchTime: 198, peakViewers: 287, avgDuration: "15m" },
	{ id: "room-4", name: "Gaming Arena", views: 6543, watchTime: 178, peakViewers: 234, avgDuration: "25m" },
	{ id: "room-5", name: "Workshop", views: 4321, watchTime: 156, peakViewers: 189, avgDuration: "32m" },
	{ id: "room-6", name: "Q&A Session", views: 3210, watchTime: 98, peakViewers: 145, avgDuration: "12m" },
	{ id: "room-7", name: "News Room", views: 2345, watchTime: 67, peakViewers: 112, avgDuration: "8m" },
	{ id: "room-8", name: "Podcast", views: 1890, watchTime: 89, peakViewers: 98, avgDuration: "35m" },
];

const deviceData = [
	{ name: "Desktop", value: 58, color: "#8b5cf6" },
	{ name: "Mobile", value: 32, color: "#ec4899" },
	{ name: "Tablet", value: 10, color: "#10b981" },
];

const geographyData = [
	{ country: "United States", viewers: 4523, percentage: 35 },
	{ country: "United Kingdom", viewers: 2134, percentage: 16 },
	{ country: "Germany", viewers: 1876, percentage: 14 },
	{ country: "Canada", viewers: 1234, percentage: 10 },
	{ country: "Australia", viewers: 987, percentage: 8 },
	{ country: "Other", viewers: 2246, percentage: 17 },
];

type TimeRange = "24h" | "7d" | "30d" | "all";

interface StatCardProps {
	title: string;
	value: string;
	change: string;
	positive: boolean;
	icon: React.ElementType;
	color: string;
	isDark: boolean;
	delay?: number;
}

function StatCard({ title, value, change, positive, icon: Icon, color, isDark, delay = 0 }: StatCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className={`p-6 rounded-2xl border transition-all duration-300 ${
				isDark 
					? "bg-gray-900/50 border-gray-800 hover:border-gray-700" 
					: "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
			}`}
		>
			<div className="flex items-start justify-between mb-4">
				<div className={`p-3 rounded-xl ${color}`}>
					<Icon className="h-5 w-5" />
				</div>
				<div className={`flex items-center gap-1 text-xs font-medium ${
					positive ? "text-emerald-400" : "text-red-400"
				}`}>
					{positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
					{change}
				</div>
			</div>
			<p className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
			<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>{title}</p>
		</motion.div>
	);
}

export default function AnalyticsPage() {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [timeRange, setTimeRange] = useState<TimeRange>("24h");
	const [sortBy, setSortBy] = useState<"views" | "watchTime" | "peakViewers">("views");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const sortedRoomData = [...roomPerformanceData].sort((a, b) => {
		const multiplier = sortOrder === "desc" ? -1 : 1;
		return (a[sortBy] - b[sortBy]) * multiplier;
	});

	const handleSort = (column: "views" | "watchTime" | "peakViewers") => {
		if (sortBy === column) {
			setSortOrder(sortOrder === "desc" ? "asc" : "desc");
		} else {
			setSortBy(column);
			setSortOrder("desc");
		}
	};

	return (
		<div className={`min-h-screen transition-colors duration-300 ${
			isDark 
				? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
				: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
		}`}>
			<Navbar />

			<div className="max-w-[1600px] mx-auto px-6 py-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
				>
					<div>
						<h1 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
							Analytics
						</h1>
						<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
							Track your streaming performance and viewer engagement
						</p>
					</div>

					{/* Time Range Selector */}
					<div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
						{(["24h", "7d", "30d", "all"] as TimeRange[]).map((range) => (
							<button
								key={range}
								onClick={() => setTimeRange(range)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									timeRange === range
										? "bg-purple-500 text-white shadow-lg"
										: isDark 
											? "text-gray-400 hover:text-white"
											: "text-gray-600 hover:text-gray-900"
								}`}
							>
								{range === "all" ? "All Time" : range}
							</button>
						))}
					</div>
				</motion.div>

				{/* Key Metrics */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<StatCard
						title="Total Views"
						value="47,345"
						change="+12.5%"
						positive={true}
						icon={Eye}
						color="bg-purple-500/20 text-purple-400"
						isDark={isDark}
						delay={0}
					/>
					<StatCard
						title="Watch Time"
						value="1,373h"
						change="+8.2%"
						positive={true}
						icon={Clock}
						color="bg-blue-500/20 text-blue-400"
						isDark={isDark}
						delay={0.05}
					/>
					<StatCard
						title="Peak Viewers"
						value="1,023"
						change="+24.3%"
						positive={true}
						icon={Users}
						color="bg-emerald-500/20 text-emerald-400"
						isDark={isDark}
						delay={0.1}
					/>
					<StatCard
						title="Avg. Session"
						value="18m 24s"
						change="-2.1%"
						positive={false}
						icon={Activity}
						color="bg-amber-500/20 text-amber-400"
						isDark={isDark}
						delay={0.15}
					/>
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
					{/* Viewer Trends Chart */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className={`p-6 rounded-2xl border ${
							isDark 
								? "bg-gray-900/50 border-gray-800" 
								: "bg-white border-gray-200 shadow-sm"
						}`}
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
									Viewer Trends
								</h3>
								<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
									Viewers over the past 24 hours
								</p>
							</div>
							<div className="flex items-center gap-4 text-xs">
								<div className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
									<span className={isDark ? "text-gray-400" : "text-gray-500"}>Viewers</span>
								</div>
								<div className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
									<span className={isDark ? "text-gray-400" : "text-gray-500"}>Streams</span>
								</div>
							</div>
						</div>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={viewerTrendData}>
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
										tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }}
									/>
									<YAxis 
										axisLine={false} 
										tickLine={false}
										tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }}
										width={40}
									/>
									<RechartsTooltip
										contentStyle={{
											backgroundColor: isDark ? '#1f2937' : '#ffffff',
											border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
											borderRadius: '12px',
											fontSize: '12px',
											boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
										}}
										labelStyle={{ color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}
									/>
									<Area
										type="monotone"
										dataKey="viewers"
										stroke="#8b5cf6"
										strokeWidth={2}
										fill="url(#viewerGradient)"
									/>
									<Line
										type="monotone"
										dataKey="streams"
										stroke="#10b981"
										strokeWidth={2}
										dot={false}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</motion.div>

					{/* Stream Health Chart */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25 }}
						className={`p-6 rounded-2xl border ${
							isDark 
								? "bg-gray-900/50 border-gray-800" 
								: "bg-white border-gray-200 shadow-sm"
						}`}
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
									Stream Health
								</h3>
								<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
									Bitrate and latency metrics
								</p>
							</div>
							<div className="flex items-center gap-4 text-xs">
								<div className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
									<span className={isDark ? "text-gray-400" : "text-gray-500"}>Bitrate (kbps)</span>
								</div>
								<div className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
									<span className={isDark ? "text-gray-400" : "text-gray-500"}>Latency (ms)</span>
								</div>
							</div>
						</div>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={streamHealthData}>
									<XAxis 
										dataKey="time" 
										axisLine={false} 
										tickLine={false}
										tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }}
									/>
									<YAxis 
										yAxisId="left"
										axisLine={false} 
										tickLine={false}
										tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }}
										width={45}
									/>
									<YAxis 
										yAxisId="right"
										orientation="right"
										axisLine={false} 
										tickLine={false}
										tick={{ fontSize: 11, fill: isDark ? '#6b7280' : '#9ca3af' }}
										width={35}
									/>
									<RechartsTooltip
										contentStyle={{
											backgroundColor: isDark ? '#1f2937' : '#ffffff',
											border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
											borderRadius: '12px',
											fontSize: '12px',
											boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
										}}
										labelStyle={{ color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '4px' }}
									/>
									<Line
										yAxisId="left"
										type="monotone"
										dataKey="bitrate"
										stroke="#3b82f6"
										strokeWidth={2}
										dot={false}
									/>
									<Line
										yAxisId="right"
										type="monotone"
										dataKey="latency"
										stroke="#f59e0b"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</motion.div>
				</div>

				{/* Room Performance & Side Stats */}
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
					{/* Room Performance Table */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className={`xl:col-span-2 rounded-2xl border overflow-hidden ${
							isDark 
								? "bg-gray-900/50 border-gray-800" 
								: "bg-white border-gray-200 shadow-sm"
						}`}
					>
						<div className={`px-6 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
							<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
								Room Performance
							</h3>
							<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
								Detailed metrics for each streaming room
							</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className={isDark ? "bg-gray-800/50" : "bg-gray-50"}>
										<th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
											Room
										</th>
										<th 
											onClick={() => handleSort("views")}
											className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors ${isDark ? "text-gray-400" : "text-gray-500"}`}
										>
											<span className="flex items-center gap-1">
												Views {sortBy === "views" && (sortOrder === "desc" ? "↓" : "↑")}
											</span>
										</th>
										<th 
											onClick={() => handleSort("watchTime")}
											className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors ${isDark ? "text-gray-400" : "text-gray-500"}`}
										>
											<span className="flex items-center gap-1">
												Watch Time {sortBy === "watchTime" && (sortOrder === "desc" ? "↓" : "↑")}
											</span>
										</th>
										<th 
											onClick={() => handleSort("peakViewers")}
											className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-purple-400 transition-colors ${isDark ? "text-gray-400" : "text-gray-500"}`}
										>
											<span className="flex items-center gap-1">
												Peak {sortBy === "peakViewers" && (sortOrder === "desc" ? "↓" : "↑")}
											</span>
										</th>
										<th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
											Avg. Duration
										</th>
									</tr>
								</thead>
								<tbody className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-100"}`}>
									{sortedRoomData.map((room, index) => (
										<motion.tr
											key={room.id}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.35 + index * 0.03 }}
											className={`transition-colors ${
												isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
											}`}
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
														index === 0 ? "bg-amber-500/20 text-amber-400" :
														index === 1 ? "bg-gray-400/20 text-gray-400" :
														index === 2 ? "bg-amber-700/20 text-amber-600" :
														isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-400"
													}`}>
														#{index + 1}
													</div>
													<span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
														{room.name}
													</span>
												</div>
											</td>
											<td className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
												{room.views.toLocaleString()}
											</td>
											<td className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
												{room.watchTime}h
											</td>
											<td className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
												{room.peakViewers}
											</td>
											<td className={`px-6 py-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
												{room.avgDuration}
											</td>
										</motion.tr>
									))}
								</tbody>
							</table>
						</div>
					</motion.div>

					{/* Side Stats */}
					<div className="space-y-6">
						{/* Device Breakdown */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.35 }}
							className={`p-6 rounded-2xl border ${
								isDark 
									? "bg-gray-900/50 border-gray-800" 
									: "bg-white border-gray-200 shadow-sm"
							}`}
						>
							<h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
								Device Breakdown
							</h3>
							<div className="flex items-center justify-between">
								<div className="h-32 w-32">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={deviceData}
												cx="50%"
												cy="50%"
												innerRadius={35}
												outerRadius={55}
												paddingAngle={3}
												dataKey="value"
											>
												{deviceData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="space-y-3">
									{deviceData.map((device) => (
										<div key={device.name} className="flex items-center gap-2">
											<span className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
											<span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
												{device.name}
											</span>
											<span className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
												{device.value}%
											</span>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						{/* Geography */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className={`p-6 rounded-2xl border ${
								isDark 
									? "bg-gray-900/50 border-gray-800" 
									: "bg-white border-gray-200 shadow-sm"
							}`}
						>
							<div className="flex items-center gap-2 mb-4">
								<Globe className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
								<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
									Top Regions
								</h3>
							</div>
							<div className="space-y-3">
								{geographyData.slice(0, 5).map((geo, index) => (
									<div key={geo.country} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className={`text-xs font-medium w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
												{index + 1}.
											</span>
											<span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
												{geo.country}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<div className={`w-16 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
												<div
													className="h-full rounded-full bg-purple-500"
													style={{ width: `${geo.percentage}%` }}
												/>
											</div>
											<span className={`text-xs font-medium w-8 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}>
												{geo.percentage}%
											</span>
										</div>
									</div>
								))}
							</div>
						</motion.div>
					</div>
				</div>

				{/* Top Performing Rooms */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.45 }}
					className={`p-6 rounded-2xl border ${
						isDark 
							? "bg-gray-900/50 border-gray-800" 
							: "bg-white border-gray-200 shadow-sm"
					}`}
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
								Top Performing Rooms
							</h3>
							<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
								Based on total views this period
							</p>
						</div>
						<Link href="/dashboard/dev-company">
							<button className={`text-xs font-medium transition-colors ${
								isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"
							}`}>
								View All Rooms
							</button>
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{roomPerformanceData.slice(0, 4).map((room, index) => (
							<div
								key={room.id}
								className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
									isDark 
										? "bg-gray-800/50 border-gray-700 hover:border-gray-600" 
										: "bg-gray-50 border-gray-200 hover:border-gray-300"
								}`}
							>
								<div className="flex items-center gap-3 mb-3">
									<div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
										index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white" :
										index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white" :
										index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
										"bg-purple-500/20 text-purple-400"
									}`}>
										{index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
									</div>
									<div>
										<p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
											{room.name}
										</p>
										<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
											{room.views.toLocaleString()} views
										</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-2">
									<div className={`p-2 rounded-lg ${isDark ? "bg-gray-900/50" : "bg-white"}`}>
										<p className={`text-[10px] uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>
											Watch Time
										</p>
										<p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
											{room.watchTime}h
										</p>
									</div>
									<div className={`p-2 rounded-lg ${isDark ? "bg-gray-900/50" : "bg-white"}`}>
										<p className={`text-[10px] uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>
											Peak
										</p>
										<p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
											{room.peakViewers}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</motion.div>
			</div>
		</div>
	);
}

