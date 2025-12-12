"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Radio, Key, Shield, Loader2, AlertCircle, X, Sun, Moon } from "lucide-react";
import { ViewerLiveGrid } from "./ViewerLiveGrid";
import { useTheme } from "@/lib/theme-context";
import { useRole } from "@/lib/role-context";
import type { Room } from "@/lib/types";

interface ViewerDashboardProps {
	companyId: string;
	isAllowedCompany?: boolean;
}

export function ViewerDashboard({ companyId, isAllowedCompany = false }: ViewerDashboardProps) {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [isLoading, setIsLoading] = useState(true);

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
		const interval = setInterval(() => loadRooms(), 10000);
		return () => clearInterval(interval);
	}, [loadRooms]);

	// Get active rooms
	const activeRooms = rooms.filter(r => r.isActive && r.streamUrl);
	const liveCount = activeRooms.length;

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen transition-colors duration-300 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
				<ViewerHeader liveCount={0} isAllowedCompany={isAllowedCompany} />
				<div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						{[...Array(8)].map((_, i) => (
							<div 
								key={i} 
								className="aspect-video rounded-xl sm:rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800" 
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen transition-colors duration-300 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
			<ViewerHeader liveCount={liveCount} isAllowedCompany={isAllowedCompany} />
			
			<div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-8">
				{/* Live Streams Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-between mb-3 sm:mb-4"
				>
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border bg-gradient-to-br from-red-50 to-pink-50 border-red-200 dark:from-red-500/20 dark:to-pink-500/20 dark:border-red-500/20">
							<Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 dark:text-red-400" />
						</div>
						<div>
							<h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
								Live Streams
							</h2>
							<p className="text-[10px] sm:text-xs text-gray-500">
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
						<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
							<Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse text-red-500 dark:text-red-400" />
							<span className="text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-300">Live</span>
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
						className="text-center py-10 sm:py-16 rounded-xl sm:rounded-2xl border backdrop-blur-sm mt-6 sm:mt-8 bg-white/80 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800"
					>
						<div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 bg-gray-100 dark:bg-gray-800">
							<Tv className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">
							No Active Streams
						</h3>
						<p className="text-xs sm:text-sm max-w-md mx-auto px-4 text-gray-500 dark:text-gray-400">
							There are no live streams at the moment. Please check back later.
						</p>
					</motion.div>
				)}
			</div>
		</div>
	);
}

// Clean header for viewers with secret admin access via Live button
function ViewerHeader({ liveCount, isAllowedCompany }: { liveCount: number; isAllowedCompany: boolean }) {
	const { setAsAdmin, isAdmin } = useRole();
	const { toggleTheme, theme } = useTheme();
	const router = useRouter();
	
	// Redirect to admin dashboard when admin key is successfully entered
	useEffect(() => {
		if (isAdmin) {
			router.push("/dashboard/dev-company");
		}
	}, [isAdmin, router]);
	
	// Secret admin access - click Live badge 5 times
	// Only allowed for your company (checked server-side via Whop SDK)
	const [badgeClickCount, setBadgeClickCount] = useState(0);
	const [showAdminModal, setShowAdminModal] = useState(false);
	const [adminKey, setAdminKey] = useState("");
	const [adminError, setAdminError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	
	// Handle Live badge click for secret admin access
	const handleLiveClick = () => {
		setBadgeClickCount(prev => prev + 1);
		
		if (clickTimeoutRef.current) {
			clearTimeout(clickTimeoutRef.current);
		}
		
		clickTimeoutRef.current = setTimeout(() => {
			setBadgeClickCount(0);
		}, 3000);
	};
	
	// Show admin modal when 5 clicks reached (only for allowed company)
	useEffect(() => {
		if (badgeClickCount >= 5 && isAllowedCompany) {
			setShowAdminModal(true);
		}
		if (badgeClickCount >= 5) {
			setBadgeClickCount(0);
		}
	}, [badgeClickCount, isAllowedCompany]);
	
	// Handle admin key submission
	const handleAdminSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAdminError("");
		setIsVerifying(true);
		
		await new Promise(resolve => setTimeout(resolve, 500));
		
		const success = setAsAdmin(adminKey);
		if (success) {
			setShowAdminModal(false);
			setAdminKey("");
		} else {
			setAdminError("Invalid admin key");
			setAdminKey("");
		}
		setIsVerifying(false);
	};
	
	return (
		<>
			<header className="sticky top-0 z-50 backdrop-blur-xl border-b bg-white/80 border-gray-200 dark:bg-gray-950/80 dark:border-gray-800">
				<div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
							<Tv className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
						</div>
						<div>
							<h1 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">
								Market Pulse Live
							</h1>
						</div>
					</div>

					{/* Right side - Theme toggle and Live badge */}
					<div className="flex items-center gap-2 sm:gap-3">
						{/* Theme toggle button */}
						<button
							onClick={toggleTheme}
							className="p-2 sm:p-2.5 rounded-lg transition-all active:scale-95 text-gray-600 hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-gray-800"
							title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
						>
							<Sun className="h-4 w-4 sm:h-5 sm:w-5 hidden dark:block" />
							<Moon className="h-4 w-4 sm:h-5 sm:w-5 block dark:hidden" />
						</button>
						
					{/* Live badge - click 5x for admin access (only for allowed company) */}
						<div
							onClick={isAllowedCompany ? handleLiveClick : undefined}
							className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full select-none transition-all active:scale-95 bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 ${
								isAllowedCompany ? "cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20" : "cursor-default"
							}`}
						>
							<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
							<span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">{liveCount} Live</span>
						</div>
					</div>
				</div>
			</header>
			
			{/* Secret Admin Access Modal */}
			<AnimatePresence>
				{showAdminModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
						onClick={() => setShowAdminModal(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							onClick={(e) => e.stopPropagation()}
							className="relative w-full max-w-sm p-6 rounded-2xl border shadow-2xl bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
						>
							{/* Close button */}
							<button
								onClick={() => setShowAdminModal(false)}
								className="absolute top-4 right-4 p-1 rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
							>
								<X className="h-5 w-5" />
							</button>
							
							{/* Header */}
							<div className="text-center mb-6">
								<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-purple-100 dark:bg-purple-500/20">
									<Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
									Admin Access
								</h3>
								<p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
									Enter your admin key
								</p>
							</div>
							
							{/* Form */}
							<form onSubmit={handleAdminSubmit} className="space-y-4">
								<input
									type="password"
									value={adminKey}
									onChange={(e) => {
										setAdminKey(e.target.value);
										setAdminError("");
									}}
									placeholder="Enter admin key..."
									autoFocus
									className={`w-full px-4 py-3 rounded-xl border text-center font-mono tracking-widest transition-colors focus:outline-none bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 ${adminError ? "border-red-500" : ""}`}
								/>
								
								{adminError && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"
									>
										<AlertCircle className="h-4 w-4 text-red-400" />
										<span className="text-sm text-red-400">{adminError}</span>
									</motion.div>
								)}
								
								<motion.button
									type="submit"
									disabled={!adminKey.trim() || isVerifying}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
										adminKey.trim() && !isVerifying
											? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
											: "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
									}`}
								>
									{isVerifying ? (
										<>
											<Loader2 className="h-5 w-5 animate-spin" />
											Verifying...
										</>
									) : (
										<>
											<Shield className="h-5 w-5" />
											Access Admin
										</>
									)}
								</motion.button>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
