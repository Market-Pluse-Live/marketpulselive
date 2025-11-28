"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
	const [showControls, setShowControls] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [playerReady, setPlayerReady] = useState(false);
	const router = useRouter();
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const playerRef = useRef<any>(null);
	const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Detect mobile device
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

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

	const handleExpand = useCallback(() => {
		if (room) {
			router.push(`/rooms/${room.id}?companyId=${room.companyId}`);
		}
	}, [room, router]);

	// Send command to YouTube iframe using postMessage API
	const sendYouTubeCommand = useCallback((command: string, args?: any) => {
		if (iframeRef.current && iframeRef.current.contentWindow) {
			const message = JSON.stringify({
				event: 'command',
				func: command,
				args: args || []
			});
			iframeRef.current.contentWindow.postMessage(message, '*');
		}
	}, []);

	// Volume control using YouTube API (without reloading iframe)
	useEffect(() => {
		if (room?.streamType === "youtube" && playerReady) {
			if (volume === 0) {
				sendYouTubeCommand('mute');
			} else {
				sendYouTubeCommand('unMute');
				sendYouTubeCommand('setVolume', [volume]);
			}
		}
	}, [volume, playerReady, room?.streamType, sendYouTubeCommand]);

	// Listen for YouTube player ready
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			try {
				const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
				if (data.event === 'onReady' || data.info?.playerState !== undefined) {
					setPlayerReady(true);
				}
			} catch {
				// Ignore non-JSON messages
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	// Volume control functions with touch support
	const increaseVolume = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setVolume(prev => Math.min(100, prev + 10));
		showControlsTemporarily();
	}, []);

	const decreaseVolume = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setVolume(prev => Math.max(0, prev - 10));
		showControlsTemporarily();
	}, []);

	const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		setVolume(Number(e.target.value));
	}, []);

	const toggleMute = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (volume === 0) {
			setVolume(50); // Unmute to 50%
		} else {
			setVolume(0); // Mute
		}
		showControlsTemporarily();
	}, [volume]);

	const showControlsTemporarily = useCallback(() => {
		setShowControls(true);
		if (controlsTimeoutRef.current) {
			clearTimeout(controlsTimeoutRef.current);
		}
		controlsTimeoutRef.current = setTimeout(() => {
			if (!isMobile) {
				setShowControls(false);
			}
		}, 4000);
	}, [isMobile]);

	// Handle tap on mobile to show controls
	const handleContainerTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		if (isMobile) {
			e.preventDefault();
			showControlsTemporarily();
		}
	}, [isMobile, showControlsTemporarily]);

	// Get volume icon based on level
	const getVolumeIcon = (size: string = "h-5 w-5") => {
		if (volume === 0) return <VolumeX className={size} />;
		if (volume < 50) return <Volume1 className={size} />;
		return <Volume2 className={size} />;
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (controlsTimeoutRef.current) {
				clearTimeout(controlsTimeoutRef.current);
			}
		};
	}, []);

	// Show controls on mobile by default
	useEffect(() => {
		if (isMobile) {
			setShowControls(true);
		}
	}, [isMobile]);

	if (!room) {
		// Empty slot
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: index * 0.05 }}
				className={`aspect-video rounded-xl sm:rounded-2xl border-2 border-dashed flex items-center justify-center ${
					isDark 
						? "bg-gray-900/30 border-gray-800" 
						: "bg-gray-50 border-gray-200"
				}`}
			>
				<div className="text-center">
					<Tv className={`h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
					<p className={`text-xs sm:text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>
						No Stream
					</p>
				</div>
			</motion.div>
		);
	}

	const videoId = room.streamType === "youtube" ? getYouTubeId(room.streamUrl) : null;
	const isMuted = volume === 0;

	return (
		<motion.div
			ref={containerRef}
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: index * 0.05 }}
			onMouseEnter={() => !isMobile && setShowControls(true)}
			onMouseLeave={() => !isMobile && setShowControls(false)}
			onClick={handleContainerTap}
			onTouchStart={handleContainerTap}
			className={`relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden ${
				isDark 
					? "bg-gray-900 border border-gray-800" 
					: "bg-white border border-gray-200"
			} shadow-xl`}
		>
			{/* Embedded Player - Always starts muted for autoplay compliance */}
			{room.streamType === "youtube" && videoId ? (
				<iframe
					ref={iframeRef}
					src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
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

			{/* Overlay Controls */}
			<div 
				className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
					showControls || isMobile ? "opacity-100" : "opacity-0"
				}`}
			>
				{/* Top bar */}
				<div className="absolute top-0 left-0 right-0 p-2 sm:p-4 flex items-center justify-between">
					{/* Live badge */}
					<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
						<Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse" />
						<span className="text-[10px] sm:text-xs">LIVE</span>
					</div>
					
					{/* Expand button */}
					<button
						onClick={(e) => { e.stopPropagation(); handleExpand(); }}
						onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleExpand(); }}
						className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-black/50 active:bg-black/70 text-white transition-colors touch-manipulation"
						title="Open fullscreen"
					>
						<Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
					</button>
				</div>

				{/* Bottom bar */}
				<div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
					{/* Room name */}
					<div className="flex items-center justify-between mb-2 sm:mb-3">
						<div className="flex-1 min-w-0">
							<h3 className="text-white text-sm sm:text-lg font-semibold truncate">
								{room.name}
							</h3>
							<p className="text-white/60 text-xs sm:text-sm uppercase hidden sm:block">
								{room.streamType} stream
							</p>
						</div>
					</div>
					
					{/* Volume Controls - Mobile Optimized */}
					<div className="flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-2">
						{/* Decrease Volume Button */}
						<button
							onClick={decreaseVolume}
							onTouchEnd={decreaseVolume}
							className="p-2.5 sm:p-2 rounded-lg bg-white/10 active:bg-white/30 text-white transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
							title="Volume Down"
						>
							<Minus className="h-5 w-5 sm:h-4 sm:w-4" />
						</button>
						
						{/* Mute/Unmute Button */}
						<button
							onClick={toggleMute}
							onTouchEnd={toggleMute}
							className={`p-2.5 sm:p-2 rounded-lg transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
								isMuted 
									? "bg-white/10 active:bg-white/30 text-white/70" 
									: "bg-green-500/80 active:bg-green-600 text-white"
							}`}
							title={isMuted ? "Unmute" : "Mute"}
						>
							{getVolumeIcon("h-5 w-5 sm:h-5 sm:w-5")}
						</button>
						
						{/* Volume Slider */}
						<div className="flex-1 flex items-center gap-2 px-1">
							<input
								type="range"
								min="0"
								max="100"
								value={volume}
								onChange={handleVolumeChange}
								onClick={(e) => e.stopPropagation()}
								onTouchStart={(e) => e.stopPropagation()}
								className="w-full h-3 sm:h-2 rounded-full appearance-none cursor-pointer bg-white/20 touch-manipulation
									[&::-webkit-slider-thumb]:appearance-none 
									[&::-webkit-slider-thumb]:w-6 
									[&::-webkit-slider-thumb]:h-6 
									[&::-webkit-slider-thumb]:sm:w-4 
									[&::-webkit-slider-thumb]:sm:h-4 
									[&::-webkit-slider-thumb]:rounded-full 
									[&::-webkit-slider-thumb]:bg-white 
									[&::-webkit-slider-thumb]:shadow-lg
									[&::-webkit-slider-thumb]:cursor-pointer
									[&::-moz-range-thumb]:w-6 
									[&::-moz-range-thumb]:h-6
									[&::-moz-range-thumb]:sm:w-4 
									[&::-moz-range-thumb]:sm:h-4 
									[&::-moz-range-thumb]:rounded-full 
									[&::-moz-range-thumb]:bg-white 
									[&::-moz-range-thumb]:border-0
									[&::-moz-range-thumb]:cursor-pointer"
								style={{
									background: `linear-gradient(to right, #22c55e ${volume}%, rgba(255,255,255,0.2) ${volume}%)`
								}}
							/>
							<span className="text-white text-xs sm:text-sm font-medium min-w-[32px] sm:min-w-[3ch] text-right">
								{volume}%
							</span>
						</div>
						
						{/* Increase Volume Button */}
						<button
							onClick={increaseVolume}
							onTouchEnd={increaseVolume}
							className="p-2.5 sm:p-2 rounded-lg bg-white/10 active:bg-white/30 text-white transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
							title="Volume Up"
						>
							<Plus className="h-5 w-5 sm:h-4 sm:w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Persistent volume indicator when controls hidden (desktop only) */}
			{!showControls && !isMobile && (
				<div className="absolute bottom-3 right-3 flex items-center gap-2">
					<div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
						isMuted ? "bg-black/60" : "bg-green-500/90"
					}`}>
						{getVolumeIcon("h-4 w-4")}
						<span className="text-white text-xs font-medium">{volume}%</span>
					</div>
				</div>
			)}

			{/* Tap hint for mobile (shows briefly) */}
			{isMobile && !showControls && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/30">
					<p className="text-white text-sm">Tap for controls</p>
				</div>
			)}
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
