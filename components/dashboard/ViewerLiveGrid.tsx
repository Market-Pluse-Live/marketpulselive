"use client";

import { motion } from "framer-motion";
import { Tv, Play, Radio } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import type { Room } from "@/lib/types";
import { useRouter } from "next/navigation";

interface ViewerLiveGridProps {
	rooms: Room[];
}

export function ViewerLiveGrid({ rooms }: ViewerLiveGridProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const router = useRouter();

	// Get active rooms (max 8 for 4×2 grid)
	const activeRooms = rooms
		.filter(r => r.isActive && r.streamUrl)
		.slice(0, 8);

	// Pad to 8 slots for 4×2 grid
	const slots: (Room | null)[] = [...activeRooms];
	while (slots.length < 8) {
		slots.push(null);
	}

	const handleRoomClick = (room: Room) => {
		router.push(`/rooms/${room.id}?companyId=${room.companyId}`);
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{slots.map((room, index) => (
				<ViewerStreamCard
					key={room?.id || `empty-${index}`}
					room={room}
					index={index}
					isDark={isDark}
					onClick={room ? () => handleRoomClick(room) : undefined}
				/>
			))}
		</div>
	);
}

interface ViewerStreamCardProps {
	room: Room | null;
	index: number;
	isDark: boolean;
	onClick?: () => void;
}

function ViewerStreamCard({ room, index, isDark, onClick }: ViewerStreamCardProps) {
	const isLive = room?.isActive && room?.streamUrl;

	// Extract YouTube thumbnail if available
	const getThumbnail = (url: string): string | null => {
		const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
		if (match) {
			return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
		}
		return null;
	};

	const thumbnail = room?.thumbnail || (room?.streamUrl ? getThumbnail(room.streamUrl) : null);

	if (!room) {
		// Empty slot
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: index * 0.05 }}
				className={`aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center ${
					isDark 
						? "bg-gray-900/30 border-gray-800" 
						: "bg-gray-50 border-gray-200"
				}`}
			>
				<div className="text-center">
					<Tv className={`h-8 w-8 mx-auto mb-2 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
					<p className={`text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>
						No Stream
					</p>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.05 }}
			whileHover={{ scale: 1.02, y: -4 }}
			onClick={onClick}
			className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer group ${
				isDark 
					? "bg-gray-900 border border-gray-800" 
					: "bg-white border border-gray-200"
			} shadow-lg hover:shadow-xl transition-all duration-300`}
		>
			{/* Thumbnail/Preview */}
			{thumbnail ? (
				<img
					src={thumbnail}
					alt={room.name}
					className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			) : (
				<div className={`absolute inset-0 flex items-center justify-center ${
					isDark 
						? "bg-gradient-to-br from-gray-800 to-gray-900" 
						: "bg-gradient-to-br from-gray-100 to-gray-200"
				}`}>
					<Tv className={`h-12 w-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
				</div>
			)}

			{/* Overlay gradient */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

			{/* Live badge */}
			{isLive && (
				<div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
					<Radio className="h-3 w-3 animate-pulse" />
					LIVE
				</div>
			)}

			{/* Stream type badge */}
			<div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
				room.streamType === "youtube" 
					? "bg-red-500/90 text-white" 
					: "bg-blue-500/90 text-white"
			}`}>
				{room.streamType === "youtube" ? "YouTube" : "HLS"}
			</div>

			{/* Play button overlay */}
			<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
				<motion.div
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
				>
					<Play className="h-8 w-8 text-white fill-white ml-1" />
				</motion.div>
			</div>

			{/* Room info */}
			<div className="absolute bottom-0 left-0 right-0 p-4">
				<h3 className="text-white font-semibold text-lg truncate">
					{room.name}
				</h3>
				<p className="text-white/70 text-sm truncate">
					{room.streamUrl ? "Click to watch" : "No stream configured"}
				</p>
			</div>
		</motion.div>
	);
}

