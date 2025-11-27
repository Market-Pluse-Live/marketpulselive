"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Eye, LogOut } from "lucide-react";
import { ViewerLiveGrid } from "./ViewerLiveGrid";
import { useTheme } from "@/lib/theme-context";
import { useRole } from "@/lib/role-context";
import type { Room } from "@/lib/types";

interface ViewerDashboardProps {
	companyId: string;
}

export function ViewerDashboard({ companyId }: ViewerDashboardProps) {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { theme } = useTheme();
	const { resetRole } = useRole();
	const isDark = theme === "dark";

	const loadRooms = useCallback(async () => {
		try {
			const response = await fetch(`/api/rooms?companyId=${companyId}`);
			if (response.ok) {
				const data = await response.json();
				setRooms(data.rooms || []);
			}
		} catch (err) {
			console.error("Failed to load rooms:", err);
		} finally {
			setIsLoading(false);
		}
	}, [companyId]);

	useEffect(() => {
		loadRooms();
	}, [loadRooms]);

	// Poll for updates every 10 seconds
	useEffect(() => {
		const interval = setInterval(loadRooms, 10000);
		return () => clearInterval(interval);
	}, [loadRooms]);

	// Get active rooms
	const activeRooms = rooms.filter(r => r.isActive && r.streamUrl);
	const liveCount = activeRooms.length;

	// Loading state
	if (isLoading) {
		return (
			<div className={`min-h-screen transition-colors duration-300 ${
				isDark 
					? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
					: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
			}`}>
				<ViewerHeader liveCount={0} isDark={isDark} onExit={resetRole} />
				<div className="max-w-[1600px] mx-auto px-6 py-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{[...Array(8)].map((_, i) => (
							<div 
								key={i} 
								className={`aspect-video rounded-2xl animate-pulse ${
									isDark ? "bg-gray-800" : "bg-gray-200"
								}`} 
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen transition-colors duration-300 ${
			isDark 
				? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
				: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
		}`}>
			<ViewerHeader liveCount={liveCount} isDark={isDark} onExit={resetRole} />
			
			<div className="max-w-[1600px] mx-auto px-6 py-8">
				{/* Live Streams Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-between mb-4"
				>
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/20">
							<Tv className="h-4 w-4 text-red-400" />
						</div>
						<div>
							<h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
								Live Streams
							</h2>
							<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
								{liveCount > 0 ? (
									<span className="flex items-center gap-1.5">
										<span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
										{liveCount} stream{liveCount !== 1 ? "s" : ""} live • Hover for controls • Click to expand
									</span>
								) : (
									"No streams currently live"
								)}
							</p>
						</div>
					</div>
					
					{liveCount > 0 && (
						<div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
							<Radio className="h-3 w-3 text-red-400 animate-pulse" />
							<span className="text-xs font-medium text-red-300">Live Now</span>
						</div>
					)}
				</motion.div>

				{/* 4×2 Grid of Embedded Streams */}
				<ViewerLiveGrid rooms={rooms} />

				{/* No streams message */}
				{liveCount === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className={`text-center py-16 rounded-2xl border backdrop-blur-sm mt-8 ${
							isDark 
								? "bg-gray-900/50 border-gray-800" 
								: "bg-white/80 border-gray-200"
						}`}
					>
						<div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
							isDark ? "bg-gray-800" : "bg-gray-100"
						}`}>
							<Tv className={`h-8 w-8 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
						</div>
						<h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
							No Active Streams
						</h3>
						<p className={`text-sm max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
							There are no live streams at the moment. Please check back later.
						</p>
					</motion.div>
				)}
			</div>
		</div>
	);
}

// Simplified header for viewers
function ViewerHeader({ liveCount, isDark, onExit }: { liveCount: number; isDark: boolean; onExit: () => void }) {
	return (
		<header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
			isDark 
				? "bg-gray-950/80 border-gray-800" 
				: "bg-white/80 border-gray-200"
		}`}>
			<div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
						<Tv className="h-5 w-5 text-white" />
					</div>
					<div>
						<h1 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
							Market Pulse Live
						</h1>
						<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
							Viewer Mode
						</p>
					</div>
				</div>

				{/* Right side */}
				<div className="flex items-center gap-4">
					{/* Live indicator */}
					{liveCount > 0 && (
						<div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
							<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
							<span className="text-sm font-medium text-red-400">{liveCount} Live</span>
						</div>
					)}

					{/* Viewer badge */}
					<div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
						isDark ? "bg-gray-800" : "bg-gray-100"
					}`}>
						<Eye className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
						<span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Viewer</span>
					</div>

					{/* Exit button */}
					<button
						onClick={onExit}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
							isDark 
								? "text-gray-400 hover:text-white hover:bg-gray-800" 
								: "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
						}`}
					>
						<LogOut className="h-4 w-4" />
						<span className="text-sm hidden sm:inline">Exit</span>
					</button>
				</div>
			</div>
		</header>
	);
}

