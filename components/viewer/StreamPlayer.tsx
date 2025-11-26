"use client";

import { useEffect, useRef, useState } from "react";
import type { StreamType } from "@/lib/types";

interface StreamPlayerProps {
	streamUrl: string;
	streamType: StreamType;
	roomName: string;
}

export function StreamPlayer({
	streamUrl,
	streamType,
	roomName,
}: StreamPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const hlsRef = useRef<any>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (streamType === "hls" && videoRef.current && streamUrl) {
			// Dynamically import hls.js only for HLS streams
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
							switch (data.type) {
								case Hls.default.ErrorTypes.NETWORK_ERROR:
									setError("Network error. Please check your connection.");
									break;
								case Hls.default.ErrorTypes.MEDIA_ERROR:
									setError("Media error. The stream may be unavailable.");
									break;
								default:
									setError("An error occurred while loading the stream.");
									break;
							}
						}
					});
				} else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
					// Native HLS support (Safari)
					videoRef.current.src = streamUrl;
				} else {
					setError("HLS playback is not supported in your browser.");
				}
			});

			return () => {
				if (hlsRef.current) {
					hlsRef.current.destroy();
				}
			};
		}
	}, [streamType, streamUrl]);

	if (streamType === "youtube") {
		// Extract YouTube video ID from various URL formats
		const getYouTubeId = (url: string): string | null => {
			// Handle various YouTube URL formats
			const patterns = [
				/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^#&?]+)/,  // watch?v=ID
				/(?:youtu\.be\/)([^#&?]+)/,  // youtu.be/ID
				/(?:youtube\.com\/embed\/)([^#&?]+)/,  // embed/ID
				/(?:youtube\.com\/v\/)([^#&?]+)/,  // v/ID
				/(?:youtube\.com\/live\/)([^#&?]+)/,  // live/ID (live streams)
				/(?:youtube\.com\/shorts\/)([^#&?]+)/,  // shorts/ID
			];
			
			for (const pattern of patterns) {
				const match = url.match(pattern);
				if (match && match[1]) {
					return match[1];
				}
			}
			
			// If URL is just a video ID (11 characters)
			if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
				return url;
			}
			
			return null;
		};

		const videoId = getYouTubeId(streamUrl);

		if (!videoId) {
			return (
				<div className="w-full aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center gap-4">
					<p className="text-red-400 font-medium">Invalid YouTube URL</p>
					<p className="text-gray-500 text-sm text-center max-w-md">
						Please use a valid YouTube URL format like:<br/>
						• youtube.com/watch?v=VIDEO_ID<br/>
						• youtu.be/VIDEO_ID<br/>
						• youtube.com/live/VIDEO_ID
					</p>
				</div>
			);
		}

		return (
			<div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
				<iframe
					src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
					title={roomName}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="w-full h-full"
				/>
			</div>
		);
	}

	// HLS stream
	return (
		<div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative">
			{error ? (
				<div className="flex items-center justify-center h-full">
					<p className="text-white">{error}</p>
				</div>
			) : (
				<video
					ref={videoRef}
					controls
					autoPlay
					playsInline
					className="w-full h-full"
				>
					Your browser does not support the video tag.
				</video>
			)}
		</div>
	);
}

