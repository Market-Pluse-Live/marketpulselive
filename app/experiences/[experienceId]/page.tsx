"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Video, Link2, Play, Home, Settings, Radio } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface Room {
	id: string;
	name: string;
	streamUrl: string;
	streamType: "youtube" | "hls";
	isActive: boolean;
}

export default function ExperiencePage() {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [rooms, setRooms] = useState<Room[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadRooms() {
			try {
				const response = await fetch("/api/rooms?companyId=dev-company");
				if (response.ok) {
					const data = await response.json();
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

	if (isLoading) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${
				isDark 
					? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
					: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
			}`}>
				<div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className={`min-h-screen transition-colors duration-300 ${
			isDark 
				? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
				: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
		}`}>
			{/* Header */}
			<header className={`border-b backdrop-blur-xl sticky top-0 z-10 transition-colors duration-300 ${
				isDark 
					? "border-gray-800/50 bg-gray-900/30" 
					: "border-gray-200 bg-white/70"
			}`}>
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link href="/">
						<motion.div 
							className="flex items-center gap-3"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
								<Radio className="h-5 w-5 text-white" />
							</div>
							<span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
								Live{" "}
								<span 
									style={{ 
										background: "linear-gradient(to right, #a78bfa, #ec4899)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text"
									}}
								>
									Streams
								</span>
							</span>
						</motion.div>
					</Link>
					
					<div className="flex items-center gap-3">
						<Link href="/">
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
								Home
							</motion.button>
						</Link>
						<Link href="/dashboard/dev-company">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
									isDark 
										? "text-gray-400 hover:text-white hover:bg-gray-800/50" 
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
								}`}
							>
								<Settings className="h-4 w-4" />
								Dashboard
							</motion.button>
				</Link>
			</div>
				</div>
			</header>
			
			<div className="max-w-6xl mx-auto px-6 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Available Streams</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-600"}>Choose a room to start watching</p>
				</motion.div>

				{rooms.length === 0 ? (
					<motion.div 
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className={`text-center py-16 rounded-2xl border ${
							isDark 
								? "border-gray-800 bg-gray-900/30" 
								: "border-gray-200 bg-white"
						}`}
					>
						<div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
							<Video className={`h-8 w-8 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
						</div>
						<p className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>No active streams</p>
						<p className={`text-sm mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Check back later for live content</p>
						<Link href="/dashboard/dev-company">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`px-6 py-3 rounded-xl font-medium transition-colors ${
									isDark 
										? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" 
										: "bg-purple-100 text-purple-700 hover:bg-purple-200"
								}`}
							>
								Go to Dashboard
							</motion.button>
						</Link>
					</motion.div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{rooms.map((room, index) => (
							<Link key={room.id} href={`/rooms/${room.id}`}>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
									whileHover={{ y: -4, transition: { duration: 0.2 } }}
									className={`rounded-2xl border p-5 transition-all duration-300 group cursor-pointer ${
										isDark 
											? "bg-gray-900/70 border-gray-800 hover:border-gray-700" 
											: "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
									}`}
								>
									{/* Thumbnail */}
									<div className={`aspect-video rounded-xl mb-4 flex items-center justify-center overflow-hidden relative ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
										<Play className={`h-12 w-12 transition-colors ${isDark ? "text-gray-600 group-hover:text-gray-500" : "text-gray-400 group-hover:text-gray-500"}`} />
										<div className="absolute top-3 left-3 px-2 py-1 rounded bg-red-500/90 text-white text-[10px] font-bold uppercase flex items-center gap-1">
											<span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
											Live
										</div>
									</div>
									
									{/* Info */}
									<div className="flex items-start justify-between">
										<div>
											<h3 className={`text-lg font-semibold mb-1 transition-colors ${
												isDark 
													? "text-white group-hover:text-purple-300" 
													: "text-gray-900 group-hover:text-purple-600"
											}`}>
												{room.name}
											</h3>
											<div className={`flex items-center gap-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
												{room.streamType === "youtube" ? (
													<Video className="h-3 w-3" />
												) : (
													<Link2 className="h-3 w-3" />
												)}
												<span className="uppercase">{room.streamType}</span>
											</div>
										</div>
									</div>
								</motion.div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
