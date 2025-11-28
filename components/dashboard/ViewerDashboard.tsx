"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Tv, Radio, Eye, LogOut, RefreshCw } from "lucide-react";
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
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { theme } = useTheme();
	const { resetRole } = useRole();
	const isDark = theme === "dark";

	const loadRooms = useCallback(async (showRefresh = false) => {
		try {
			if (showRefresh) setIsRefreshing(true);
			console.log("ViewerDashboard: Fetching rooms for companyId:", companyId);
			const response = await fetch(`/api/rooms?companyId=${companyId}`);
			if (response.ok) {
				const data = await response.json();
				console.log("ViewerDashboard: Received rooms:", data.rooms);
				console.log("ViewerDashboard: Active rooms:", data.rooms?.filter((r: Room) => r.isActive && r.streamUrl));
				setRooms(data.rooms || []);
			} else {
				console.error("ViewerDashboard: API returned error:", response.status);
			}
		} catch (err) {
			console.error("Failed to load rooms:", err);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, [companyId]);

	useEffect(() => {
		loadRooms();
	}, [loadRooms]);

	// Poll for updates every 10 seconds
	useEffect(() => {
		const interval = setInterval(() => loadRooms(false), 10000);
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
				<ViewerHeader liveCount={0} isDark={isDark} onExit={resetRole} onRefresh={() => {}} isRefreshing={false} />
				<div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{[...Array(8)].map((_, i) => (
							<div 
								key={i} 
								className={`aspect-video rounded-xl sm:rounded-2xl animate-pulse ${
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
			<ViewerHeader 
				liveCount={liveCount} 
				isDark={isDark} 
				onExit={resetRole} 
				onRefresh={() => loadRooms(true)} 
				isRefreshing={isRefreshing} 
			/>
			
			<div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
				{/* Live Streams Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-between mb-3 sm:mb-4"
				>
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/20">
							<Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
						</div>
						<div>
							<h2 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
								Live Streams
							</h2>
							<p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
								{liveCount > 0 ? (
									<span className="flex items-center gap-1 sm:gap-1.5">
										<span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full animate-pulse" />
										{liveCount} stream{liveCount !== 1 ? "s" : ""} live
										<span className="hidden sm:inline">• Tap for controls</span>
									</span>
								) : (
									"No streams currently live"
								)}
							</p>
						</div>
					</div>
					
					{liveCount > 0 && (
						<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
							<Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-400 animate-pulse" />
							<span className="text-[10px] sm:text-xs font-medium text-red-300">Live</span>
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
						className={`text-center py-10 sm:py-16 rounded-xl sm:rounded-2xl border backdrop-blur-sm mt-6 sm:mt-8 ${
							isDark 
								? "bg-gray-900/50 border-gray-800" 
								: "bg-white/80 border-gray-200"
						}`}
					>
						<div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 ${
							isDark ? "bg-gray-800" : "bg-gray-100"
						}`}>
							<Tv className={`h-6 w-6 sm:h-8 sm:w-8 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
						</div>
						<h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
							No Active Streams
						</h3>
						<p className={`text-xs sm:text-sm max-w-md mx-auto px-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
							There are no live streams at the moment. Please check back later.
						</p>
					</motion.div>
				)}
			</div>
		</div>
	);
}

// Mobile-optimized header for viewers
function ViewerHeader({ 
	liveCount, 
	isDark, 
	onExit, 
	onRefresh, 
	isRefreshing 
}: { 
	liveCount: number; 
	isDark: boolean; 
	onExit: () => void; 
	onRefresh: () => void;
	isRefreshing: boolean;
}) {
	return (
		<header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
			isDark 
				? "bg-gray-950/80 border-gray-800" 
				: "bg-white/80 border-gray-200"
		}`}>
			<div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
				{/* Logo */}
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
						<Tv className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
					</div>
					<div>
						<h1 className={`font-bold text-sm sm:text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
							Market Pulse Live
						</h1>
						<p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-500" : "text-gray-400"} hidden xs:block`}>
							Viewer Mode
						</p>
					</div>
				</div>

				{/* Right side */}
				<div className="flex items-center gap-2 sm:gap-4">
					{/* Live indicator - hidden on very small screens */}
					{liveCount > 0 && (
						<div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
							<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
							<span className="text-xs sm:text-sm font-medium text-red-400">{liveCount} Live</span>
						</div>
					)}

					{/* Mobile live badge */}
					{liveCount > 0 && (
						<div className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white">
							<span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
							<span className="text-[10px] font-bold">{liveCount}</span>
						</div>
					)}

					{/* Refresh button */}
					<button
						onClick={onRefresh}
						disabled={isRefreshing}
						className={`p-2 sm:p-2.5 rounded-lg transition-colors touch-manipulation ${
							isDark 
								? "text-gray-400 hover:text-white active:bg-gray-800" 
								: "text-gray-500 hover:text-gray-900 active:bg-gray-100"
						} ${isRefreshing ? 'animate-spin' : ''}`}
						title="Refresh"
					>
						<RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
					</button>

					{/* Viewer badge - hidden on mobile */}
					<div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${
						isDark ? "bg-gray-800" : "bg-gray-100"
					}`}>
						<Eye className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
						<span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Viewer</span>
					</div>

					{/* Exit button */}
					<button
						onClick={onExit}
						className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors touch-manipulation ${
							isDark 
								? "text-gray-400 hover:text-white active:bg-gray-800 bg-gray-800/50" 
								: "text-gray-500 hover:text-gray-900 active:bg-gray-200 bg-gray-100"
						}`}
					>
						<LogOut className="h-4 w-4" />
						<span className="text-xs sm:text-sm font-medium">Exit</span>
					</button>
				</div>
			</div>
		</header>
	);
}

