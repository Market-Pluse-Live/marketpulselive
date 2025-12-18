"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, Radio, Key, Shield, Loader2, AlertCircle, X, Crown, Clock, Sparkles } from "lucide-react";
import { ViewerLiveGrid } from "./ViewerLiveGrid";
import { useRole } from "@/lib/role-context";
import { SubscriptionProvider, useSubscription } from "@/lib/subscription-context";
import type { Room } from "@/lib/types";

interface ViewerDashboardProps {
	companyId: string;
	isAllowedCompany?: boolean;
	isPro?: boolean;
}

export function ViewerDashboard({ companyId, isAllowedCompany = false, isPro = false }: ViewerDashboardProps) {
	return (
		<SubscriptionProvider isPro={isPro}>
			<ViewerDashboardContent companyId={companyId} isAllowedCompany={isAllowedCompany} />
		</SubscriptionProvider>
	);
}

function ViewerDashboardContent({ companyId, isAllowedCompany }: { companyId: string; isAllowedCompany: boolean }) {
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
			
			{/* Upgrade Modal */}
			<UpgradeModal />
			
			{/* Free tier time remaining indicator */}
			<FreeTimeIndicator />
		</div>
	);
}

// Clean header for viewers with secret admin access via Live button
function ViewerHeader({ liveCount, isAllowedCompany }: { liveCount: number; isAllowedCompany: boolean }) {
	const { setAsAdmin, isAdmin } = useRole();
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

					{/* Right side - Live badge */}
					<div className="flex items-center gap-2 sm:gap-3">
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

// Upgrade Modal Component
function UpgradeModal() {
	const { showUpgradeModal, setShowUpgradeModal, upgradeReason } = useSubscription();
	const [isProcessing, setIsProcessing] = useState(false);
	
	if (!showUpgradeModal) return null;
	
	const handleUpgrade = async () => {
		setIsProcessing(true);
		try {
			// Create checkout configuration on server
			const response = await fetch("/api/checkout", { method: "POST" });
			const data = await response.json();
			
			if (data.purchaseUrl) {
				// Open Whop checkout in new tab (works both in and out of iframe)
				window.open(data.purchaseUrl, "_blank");
			} else if (data.error) {
				console.error("Checkout error:", data.error);
			}
		} catch (error) {
			console.error("Failed to create checkout:", error);
		} finally {
			setIsProcessing(false);
			setShowUpgradeModal(false);
		}
	};
	
	return (
		<AnimatePresence>
			{showUpgradeModal && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
					onClick={() => setShowUpgradeModal(false)}
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 sm:p-8 max-w-md w-full border border-gray-800 shadow-2xl"
					>
						{/* Close button */}
						<button
							onClick={() => setShowUpgradeModal(false)}
							className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
						
						{/* Icon */}
						<div className="flex justify-center mb-6">
							<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
								<Crown className="h-8 w-8 text-white" />
							</div>
						</div>
						
						{/* Title */}
						<h2 className="text-2xl font-bold text-white text-center mb-2">
							Upgrade to PRO
						</h2>
						
						{/* Reason message */}
						<p className="text-gray-400 text-center mb-6">
							{upgradeReason === "time_expired" 
								? "Your free 15-minute session has ended. Upgrade to PRO for unlimited access!"
								: "This stream is only available for PRO members. Upgrade to unlock all 8 streams!"}
						</p>
						
						{/* Features */}
						<div className="space-y-3 mb-6">
							<div className="flex items-center gap-3 text-gray-300">
								<div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
									<Sparkles className="h-4 w-4 text-green-400" />
								</div>
								<span>Unlimited access to all 8 streams</span>
							</div>
							<div className="flex items-center gap-3 text-gray-300">
								<div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
									<Clock className="h-4 w-4 text-blue-400" />
								</div>
								<span>No time limits - watch anytime</span>
							</div>
							<div className="flex items-center gap-3 text-gray-300">
								<div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
									<Tv className="h-4 w-4 text-purple-400" />
								</div>
								<span>HD quality on all streams</span>
							</div>
						</div>
						
						{/* CTA Button */}
						<button
							onClick={handleUpgrade}
							disabled={isProcessing}
							className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
						>
							{isProcessing ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Crown className="h-5 w-5" />
									Upgrade to PRO
								</>
							)}
						</button>
						
						{/* Close link */}
						<button
							onClick={() => setShowUpgradeModal(false)}
							className="w-full mt-3 py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
						>
							Maybe later
						</button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// Free tier time remaining indicator
function FreeTimeIndicator() {
	const { isPro, formatRemainingTime, remainingTime, watchTimeExpired } = useSubscription();
	
	// Don't show for PRO users or if time expired
	if (isPro || watchTimeExpired) return null;
	
	// Only show when time is running (user is watching)
	if (remainingTime >= 15 * 60) return null;
	
	const isLowTime = remainingTime < 5 * 60; // Less than 5 minutes
	
	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-40 ${
				isLowTime ? "animate-pulse" : ""
			}`}
		>
			<div className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl shadow-lg border ${
				isLowTime 
					? "bg-red-500/20 border-red-500/30 text-red-300" 
					: "bg-gray-900/90 border-gray-700 text-white"
			}`}>
				<Clock className={`h-5 w-5 ${isLowTime ? "text-red-400" : "text-amber-400"}`} />
				<div>
					<p className="text-sm font-medium">
						Free trial: <span className="font-bold">{formatRemainingTime()}</span> remaining
					</p>
					<p className="text-xs opacity-70">
						Upgrade to PRO for unlimited access
					</p>
				</div>
			</div>
		</motion.div>
	);
}
