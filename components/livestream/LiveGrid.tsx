"use client";

import { motion } from "framer-motion";
import { Radio, Tv } from "lucide-react";
import { LivestreamPlayer } from "./LivestreamPlayer";
import { useTheme } from "@/lib/theme-context";
import type { Room } from "@/lib/types";

interface LiveGridProps {
	rooms: Room[];
	onEditRoom?: (room: Room) => void;
}

export function LiveGrid({ rooms, onEditRoom }: LiveGridProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	
	// Get only active rooms with URLs, max 4
	const activeRooms = rooms
		.filter(r => r.isActive && r.streamUrl)
		.slice(0, 4);

	// Pad to 4 slots
	const slots: (Room | null)[] = [...activeRooms];
	while (slots.length < 4) {
		slots.push(null);
	}

	const liveCount = activeRooms.length;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="mb-8"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/20">
						<Tv className="h-5 w-5 text-red-400" />
					</div>
					<div>
						<h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Live Streams</h2>
						<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
							{liveCount > 0 ? (
								<span className="flex items-center gap-1.5">
									<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
									{liveCount} stream{liveCount !== 1 ? "s" : ""} active
								</span>
							) : (
								"No active streams"
							)}
						</p>
					</div>
				</div>
				
				{liveCount > 0 && (
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
						<Radio className="h-4 w-4 text-red-400 animate-pulse" />
						<span className="text-sm font-medium text-red-300">Live Now</span>
					</div>
				)}
			</div>

			{/* 2x2 Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{slots.map((room, index) => (
					<LivestreamPlayer
						key={room?.id || `empty-${index}`}
						room={room}
						index={index}
						onEdit={onEditRoom}
					/>
				))}
			</div>
		</motion.div>
	);
}
