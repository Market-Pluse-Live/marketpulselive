"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tv, Volume2, VolumeX, Volume1, Maximize2, Radio, Minus, Plus } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import type { Room } from "@/lib/types";
import { useRouter } from "next/navigation";

interface ViewerLiveGridProps {
	rooms: Room[];
}

export function ViewerLiveGrid({ rooms }: ViewerLiveGridProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Get active rooms (max 8 for 4×2 grid)
	const activeRooms = rooms
		.filter(r => r.isActive && r.streamUrl)
		.slice(0, 8);

	// Pad to 8 slots for 4×2 grid
	const slots: (Room | null)[] = [...activeRooms];
	while (slots.length < 8) {
		slots.push(null);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{slots.map((room, index) => (
				<LiveStreamCard
					key={room?.id || `empty-${index}`}
					room={room}
					index={index}
					isDark={isDark}
				/>
			))}
		</div>
	);
}

interface LiveStreamCardProps {
	room: Room | null;
	index: number;
	isDark: boolean;
}

function LiveStreamCard({ room, index, isDark }: LiveStreamCardProps) {
	const [volume, setVolume] = useState(0); // Start at 0 for autoplay (0-100)
	const [isHovered, setIsHovered] = useState(false);
	const [showVolumeSlider, setShowVolumeSlider] = useState(false);
	const router = useRouter();
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Derive muted state from volume
	const isMuted = volume === 0;

	// Extract YouTube video ID
	const getYouTubeId = (url: string): string | null => {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^#&?]+)/,
			/(?:youtu\.be\/)([^#&?]+)/,
			/(?:youtube\.com\/embed\/)([^#&?]+)/,
			/(?:youtube\.com\/v\/)([^#&?]+)/,
			/(?:youtube\.com\/live\/)([^#&?]+)/,
			/(?:youtube\.com\/shorts\/)([^#&?]+)/,
		];
		
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match && match[1]) {
				return match[1];
			}
		}
		
		if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
			return url;
		}
		
		return null;
	};

	const handleExpand = () => {
		if (room) {
			router.push(`/rooms/${room.id}?companyId=${room.companyId}`);
		}
	};

	// Volume control functions
	const increaseVolume = (e: React.MouseEvent) => {
		e.stopPropagation();
		setVolume(prev => Math.min(100, prev + 10));
		showVolumeSliderTemporarily();
	};

	const decreaseVolume = (e: React.MouseEvent) => {
		e.stopPropagation();
		setVolume(prev => Math.max(0, prev - 10));
		showVolumeSliderTemporarily();
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		setVolume(Number(e.target.value));
	};

	const toggleMute = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (volume === 0) {
			setVolume(50); // Unmute to 50%
		} else {
			setVolume(0); // Mute
		}
		showVolumeSliderTemporarily();
	};

	const showVolumeSliderTemporarily = () => {
		setShowVolumeSlider(true);
		if (volumeTimeoutRef.current) {
			clearTimeout(volumeTimeoutRef.current);
		}
		volumeTimeoutRef.current = setTimeout(() => {
			setShowVolumeSlider(false);
		}, 3000);
	};

	// Get volume icon based on level
	const getVolumeIcon = () => {
		if (volume === 0) return <VolumeX className="h-5 w-5" />;
		if (volume < 50) return <Volume1 className="h-5 w-5" />;
		return <Volume2 className="h-5 w-5" />;
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (volumeTimeoutRef.current) {
				clearTimeout(volumeTimeoutRef.current);
			}
		};
	}, []);

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
					<Tv className={`h-10 w-10 mx-auto mb-2 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
					<p className={`text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>
						No Stream
					</p>
				</div>
			</motion.div>
		);
	}

	const videoId = room.streamType === "youtube" ? getYouTubeId(room.streamUrl) : null;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.05 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={`relative aspect-video rounded-2xl overflow-hidden group ${
				isDark 
					? "bg-gray-900 border border-gray-800" 
					: "bg-white border border-gray-200"
			} shadow-xl`}
		>
			{/* Embedded Player */}
			{room.streamType === "youtube" && videoId ? (
				<iframe
					ref={iframeRef}
					src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
					title={room.name}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="absolute inset-0 w-full h-full"
				/>
			) : room.streamType === "hls" ? (
				<HLSPlayer 
					streamUrl={room.streamUrl} 
					volume={volume} 
					roomName={room.name}
				/>
			) : (
				<div className={`absolute inset-0 flex items-center justify-center ${
					isDark ? "bg-gray-800" : "bg-gray-100"
				}`}>
					<Tv className={`h-8 w-8 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
				</div>
			)}

			{/* Overlay Controls - Always visible on hover */}
			<div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-200 ${
				isHovered ? "opacity-100" : "opacity-0"
			}`}>
				{/* Top bar */}
				<div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
					{/* Live badge */}
					<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
						<Radio className="h-3 w-3 animate-pulse" />
						LIVE
					</div>
					
					{/* Expand button */}
					<button
						onClick={handleExpand}
						className="p-2.5 rounded-xl bg-black/50 hover:bg-black/70 text-white transition-colors"
						title="Open fullscreen"
					>
						<Maximize2 className="h-5 w-5" />
					</button>
				</div>

				{/* Bottom bar */}
				<div className="absolute bottom-0 left-0 right-0 p-4">
					{/* Room name */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex-1 min-w-0">
							<h3 className="text-white text-lg font-semibold truncate">
								{room.name}
							</h3>
							<p className="text-white/60 text-sm uppercase">
								{room.streamType} stream
							</p>
						</div>
					</div>
					
					{/* Volume Controls */}
					<div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl p-2">
						{/* Decrease Volume Button */}
						<button
							onClick={decreaseVolume}
							className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
							title="Volume Down"
						>
							<Minus className="h-4 w-4" />
						</button>
						
						{/* Mute/Unmute Button */}
						<button
							onClick={toggleMute}
							className={`p-2 rounded-lg transition-colors ${
								isMuted 
									? "bg-white/10 hover:bg-white/20 text-white/70" 
									: "bg-green-500/80 hover:bg-green-500 text-white"
							}`}
							title={isMuted ? "Unmute" : "Mute"}
						>
							{getVolumeIcon()}
						</button>
						
						{/* Volume Slider */}
						<div className="flex-1 flex items-center gap-2">
							<input
								type="range"
								min="0"
								max="100"
								value={volume}
								onChange={handleVolumeChange}
								onClick={(e) => e.stopPropagation()}
								className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/20 
									[&::-webkit-slider-thumb]:appearance-none 
									[&::-webkit-slider-thumb]:w-4 
									[&::-webkit-slider-thumb]:h-4 
									[&::-webkit-slider-thumb]:rounded-full 
									[&::-webkit-slider-thumb]:bg-white 
									[&::-webkit-slider-thumb]:shadow-lg
									[&::-webkit-slider-thumb]:cursor-pointer
									[&::-webkit-slider-thumb]:transition-transform
									[&::-webkit-slider-thumb]:hover:scale-110
									[&::-moz-range-thumb]:w-4 
									[&::-moz-range-thumb]:h-4 
									[&::-moz-range-thumb]:rounded-full 
									[&::-moz-range-thumb]:bg-white 
									[&::-moz-range-thumb]:border-0
									[&::-moz-range-thumb]:cursor-pointer"
								style={{
									background: `linear-gradient(to right, #22c55e ${volume}%, rgba(255,255,255,0.2) ${volume}%)`
								}}
							/>
							<span className="text-white text-sm font-medium min-w-[3ch] text-right">
								{volume}
							</span>
						</div>
						
						{/* Increase Volume Button */}
						<button
							onClick={increaseVolume}
							className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
							title="Volume Up"
						>
							<Plus className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Persistent volume indicator when not hovered */}
			{!isHovered && (
				<div className="absolute bottom-4 right-4 flex items-center gap-2">
					<div className={`px-3 py-2 rounded-xl flex items-center gap-2 ${
						isMuted ? "bg-black/60" : "bg-green-500/90"
					}`}>
						{getVolumeIcon()}
						<span className="text-white text-sm font-medium">{volume}%</span>
					</div>
				</div>
			)}

			{/* Click overlay for expand */}
			<div 
				onClick={handleExpand}
				className="absolute inset-0 cursor-pointer"
				style={{ pointerEvents: isHovered ? 'none' : 'auto' }}
			/>
		</motion.div>
	);
}

// HLS Player Component with Volume Control
function HLSPlayer({ streamUrl, volume, roomName }: { streamUrl: string; volume: number; roomName: string }) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const hlsRef = useRef<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (videoRef.current && streamUrl) {
			import("hls.js").then((Hls) => {
				if (Hls.default.isSupported()) {
					const hls = new Hls.default({
						enableWorker: true,
						lowLatencyMode: true,
					});

					hls.loadSource(streamUrl);
					hls.attachMedia(videoRef.current!);
					hlsRef.current = hls;

					hls.on(Hls.default.Events.ERROR, (event, data) => {
						if (data.fatal) {
							setError("Stream unavailable");
						}
					});
				} else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
					videoRef.current.src = streamUrl;
				} else {
					setError("HLS not supported");
				}
			});

			return () => {
				if (hlsRef.current) {
					hlsRef.current.destroy();
				}
			};
		}
	}, [streamUrl]);

	// Update volume (0-100 to 0-1)
	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.volume = volume / 100;
			videoRef.current.muted = volume === 0;
		}
	}, [volume]);

	if (error) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
				<p className="text-red-400 text-xs">{error}</p>
			</div>
		);
	}

	return (
		<video
			ref={videoRef}
			autoPlay
			playsInline
			muted={volume === 0}
			className="absolute inset-0 w-full h-full object-cover"
		/>
	);
}
