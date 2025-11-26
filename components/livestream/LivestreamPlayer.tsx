"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video, Volume2, VolumeX, Settings, Users } from "lucide-react";
import Hls from "hls.js";
import { useTheme } from "@/lib/theme-context";
import type { Room } from "@/lib/types";

interface LivestreamPlayerProps {
	room: Room | null;
	index: number;
	onEdit?: (room: Room) => void;
}

function extractYouTubeId(url: string): string | null {
	const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([^&?\s]+)/);
	return match ? match[1] : null;
}

export function LivestreamPlayer({ room, index, onEdit }: LivestreamPlayerProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const videoRef = useRef<HTMLVideoElement>(null);
	const hlsRef = useRef<Hls | null>(null);
	const [isMuted, setIsMuted] = useState(true);
	const [viewerCount] = useState(() => Math.floor(Math.random() * 500) + 50);

	useEffect(() => {
		if (!room || room.streamType !== "hls" || !room.streamUrl || !videoRef.current) {
			return;
		}

		if (Hls.isSupported()) {
			const hls = new Hls();
			hlsRef.current = hls;
			hls.loadSource(room.streamUrl);
			hls.attachMedia(videoRef.current);
		} else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
			videoRef.current.src = room.streamUrl;
		}

		return () => {
			hlsRef.current?.destroy();
		};
	}, [room]);

	// Empty slot placeholder
	if (!room || !room.streamUrl || !room.isActive) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: index * 0.1 }}
				className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 group transition-colors ${
					isDark 
						? "bg-gray-900/70 border-gray-700 hover:border-gray-600" 
						: "bg-gray-100 border-gray-300 hover:border-gray-400"
				}`}
			>
				<div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
					<Video className={`h-8 w-8 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
				</div>
				<div className="text-center">
					<p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-500"}`}>Slot {index + 1}</p>
					<p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>No active stream</p>
				</div>
				<p className={`text-[10px] absolute bottom-3 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
					Activate a room to display here
				</p>
			</motion.div>
		);
	}

	const youtubeId = room.streamType === "youtube" ? extractYouTubeId(room.streamUrl) : null;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.1 }}
			className="relative aspect-video rounded-2xl overflow-hidden bg-black group"
		>
			{/* Live Badge */}
			<div className="absolute top-3 left-3 z-20 flex items-center gap-2">
				<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider shadow-lg">
					<span className="w-2 h-2 bg-white rounded-full animate-pulse" />
					Live
				</div>
				<div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs">
					<Users className="h-3 w-3" />
					{viewerCount}
				</div>
			</div>

			{/* Room Name */}
			<div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-semibold text-white">{room.name}</p>
						<p className="text-[10px] text-gray-400 uppercase">{room.streamType} Stream</p>
					</div>
					<div className="flex items-center gap-1">
						<button
							onClick={() => setIsMuted(!isMuted)}
							className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
						>
							{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
						</button>
						{onEdit && (
							<button
								onClick={() => onEdit(room)}
								className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
							>
								<Settings className="h-4 w-4" />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Video Player */}
			{room.streamType === "youtube" && youtubeId ? (
				<iframe
					src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
					className="absolute inset-0 w-full h-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			) : room.streamType === "hls" ? (
				<video
					ref={videoRef}
					className="absolute inset-0 w-full h-full object-cover"
					autoPlay
					muted={isMuted}
					playsInline
				/>
			) : (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
					<p className="text-gray-500">Invalid stream URL</p>
				</div>
			)}

			{/* Hover overlay */}
			<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
		</motion.div>
	);
}
