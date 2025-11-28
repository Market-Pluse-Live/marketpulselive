"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Video, Link2, Play, Home, Radio, Users, Clock, Eye, Search } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useRole } from "@/lib/role-context";
import { Navbar } from "@/components/dashboard/Navbar";
import { AuthModal } from "@/components/auth/AuthModal";

interface Room {
	id: string;
	name: string;
	streamUrl: string;
	streamType: "youtube" | "hls";
	isActive: boolean;
	companyId: string;
	thumbnail?: string;
}

interface StreamCardProps {
	room: Room;
	index: number;
	isDark: boolean;
	onWatch: (room: Room) => void;
}

function StreamCard({ room, index, isDark, onWatch }: StreamCardProps) {
	// Mock live data
	const viewerCount = Math.floor(Math.random() * 500) + 50;
	const duration = `${Math.floor(Math.random() * 3) + 1}h ${Math.floor(Math.random() * 59)}m`;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className={`rounded-2xl border overflow-hidden transition-all duration-300 group cursor-pointer ${
				isDark 
					? "bg-gray-900/70 border-gray-800 hover:border-gray-700" 
					: "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg"
			}`}
			onClick={() => onWatch(room)}
		>
			{/* Thumbnail */}
			<div className="relative aspect-video overflow-hidden">
				{room.thumbnail ? (
					<img 
						src={room.thumbnail} 
						alt={room.name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
						<Play className={`h-12 w-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
					</div>
				)}
				
				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						whileHover={{ scale: 1, opacity: 1 }}
						className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<Play className="h-8 w-8 text-white ml-1" />
					</motion.div>
				</div>

				{/* Live Badge */}
				<div className="absolute top-3 left-3 flex items-center gap-2">
					<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider shadow-lg">
						<span className="w-2 h-2 bg-white rounded-full animate-pulse" />
						Live
					</div>
				</div>

				{/* Viewers */}
				<div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
					<Eye className="h-3 w-3" />
					{viewerCount}
				</div>

				{/* Duration */}
				<div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
					<Clock className="h-3 w-3" />
					{duration}
				</div>
			</div>
			
			{/* Info */}
			<div className="p-4">
				<h3 className={`text-lg font-semibold mb-2 transition-colors ${
					isDark 
						? "text-white group-hover:text-purple-300" 
						: "text-gray-900 group-hover:text-purple-600"
				}`}>
					{room.name}
				</h3>
				<div className="flex items-center justify-between">
					<div className={`flex items-center gap-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
						{room.streamType === "youtube" ? (
							<Video className="h-3.5 w-3.5 text-red-400" />
						) : (
							<Link2 className="h-3.5 w-3.5 text-blue-400" />
						)}
						<span className="uppercase font-medium">{room.streamType}</span>
					</div>
					<div className={`flex items-center gap-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
						<Users className="h-3.5 w-3.5" />
						{viewerCount} watching
					</div>
				</div>
			</div>
		</motion.div>
	);
}

export default function DiscoverPage() {
	const { theme } = useTheme();
	const { isAuthenticated } = useAuth();
	const { isAdmin } = useRole();
	const isDark = theme === "dark";
	
	const [rooms, setRooms] = useState<Room[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState<"all" | "youtube" | "hls">("all");
	const [showAuthModal, setShowAuthModal] = useState(false);

	useEffect(() => {
		async function loadRooms() {
			try {
				const response = await fetch("/api/rooms?companyId=dev-company");
				if (response.ok) {
					const data = await response.json();
					// Only show active rooms with stream URLs (live streams)
					setRooms(data.rooms?.filter((r: Room) => r.isActive && r.streamUrl) || []);
				}
			} catch (error) {
				console.error("Failed to load rooms:", error);
			} finally {
				setIsLoading(false);
			}
		}
		loadRooms();
	}, []);

	const filteredRooms = rooms.filter(room => {
		const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = filterType === "all" || room.streamType === filterType;
		return matchesSearch && matchesType;
	});

	const handleWatch = (room: Room) => {
		window.location.href = `/rooms/${room.id}?companyId=${room.companyId}`;
	};

	if (isLoading) {
		return (
			<div className={`min-h-screen ${
				isDark 
					? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
					: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
			}`}>
				{/* Show admin navbar if admin */}
				{isAdmin && <Navbar />}
				
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Loading live streams...</p>
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
			{/* Auth Modal */}
			<AuthModal 
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				initialMode="signup"
			/>

			{/* Show admin navbar if admin, otherwise show simple header */}
			{isAdmin ? (
				<Navbar />
			) : (
			<header className={`border-b backdrop-blur-xl sticky top-0 z-10 transition-colors duration-300 ${
				isDark 
					? "border-gray-800/50 bg-gray-900/30" 
					: "border-gray-200 bg-white/70"
			}`}>
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
						<Link href={isAuthenticated ? "/dashboard/dev-company" : "/"}>
						<motion.div 
							className="flex items-center gap-3"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
									<Radio className="h-5 w-5 text-white" />
							</div>
							<span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
								Discover{" "}
								<span 
									style={{ 
										background: "linear-gradient(to right, #a78bfa, #ec4899)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text"
									}}
								>
									Live
								</span>
							</span>
						</motion.div>
					</Link>
					
						<div className="flex items-center gap-3">
							<Link href={isAuthenticated ? "/dashboard/dev-company" : "/"}>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
								isDark 
									? "text-gray-400 hover:text-white hover:bg-gray-800/50" 
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
							}`}
						>
							<Home className="h-4 w-4" />
									{isAuthenticated ? "Dashboard" : "Home"}
						</motion.button>
					</Link>
							{!isAuthenticated && (
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => setShowAuthModal(true)}
									className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25"
								>
									Sign Up
								</motion.button>
							)}
						</div>
				</div>
			</header>
			)}
			
			<div className="max-w-6xl mx-auto px-6 py-8">
				{/* Page Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
						<div>
							<h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
								Live Now
							</h1>
							<p className={isDark ? "text-gray-400" : "text-gray-600"}>
								{filteredRooms.length} stream{filteredRooms.length !== 1 ? "s" : ""} currently live
							</p>
						</div>

						{/* Search & Filter */}
						<div className="flex items-center gap-3">
							<div className="relative">
								<Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search streams..."
									className={`h-10 pl-10 pr-4 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
										isDark 
											? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
											: "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
									}`}
								/>
							</div>
							
							<div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
								{(["all", "youtube", "hls"] as const).map((type) => (
									<button
										key={type}
										onClick={() => setFilterType(type)}
										className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
											filterType === type
												? "bg-purple-500 text-white"
												: isDark 
													? "text-gray-400 hover:text-white"
													: "text-gray-600 hover:text-gray-900"
										}`}
									>
										{type === "all" ? "All" : type.toUpperCase()}
									</button>
								))}
							</div>
						</div>
					</div>
				</motion.div>

				{/* Streams Grid */}
				{filteredRooms.length === 0 ? (
					<motion.div 
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className={`text-center py-20 rounded-2xl border ${
							isDark 
								? "border-gray-800 bg-gray-900/30" 
								: "border-gray-200 bg-white"
						}`}
					>
						<div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
							<Radio className={`h-10 w-10 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
						</div>
						<p className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
							No live streams right now
						</p>
						<p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? "text-gray-500" : "text-gray-500"}`}>
							{isAdmin 
								? "Go to the Dashboard to configure and activate streams."
								: "Check back later for live content, or sign up to start your own stream!"
							}
						</p>
						{isAdmin ? (
							<Link href="/dashboard/dev-company">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25"
								>
									Go to Dashboard
								</motion.button>
							</Link>
						) : !isAuthenticated && (
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setShowAuthModal(true)}
								className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25"
							>
								Get Started
							</motion.button>
						)}
					</motion.div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredRooms.map((room, index) => (
							<StreamCard
								key={room.id}
								room={room}
								index={index}
								isDark={isDark}
								onWatch={handleWatch}
							/>
						))}
					</div>
				)}

				{/* CTA Banner - Only for guests */}
				{!isAuthenticated && !isAdmin && filteredRooms.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className={`mt-12 p-8 rounded-2xl border text-center ${
							isDark 
								? "bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/20"
								: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
						}`}
					>
						<h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
							Want to stream your own content?
						</h3>
						<p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
							Create an account to manage your streams and reach your audience.
						</p>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setShowAuthModal(true)}
							className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25"
						>
							Create Free Account
						</motion.button>
					</motion.div>
				)}
			</div>
		</div>
	);
}
