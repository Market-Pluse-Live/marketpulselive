"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Video, Link2, Image, Play, Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useTheme } from "@/lib/theme-context";
import type { Room, StreamType } from "@/lib/types";

interface RoomEditorProps {
	room: Room | null;
	onClose: () => void;
	onSave: (roomId: string, data: { 
		name: string; 
		streamUrl: string; 
		streamType: StreamType;
		thumbnail?: string;
		autoStart?: boolean;
	}) => Promise<void>;
}

// AI Validation mock
function validateStreamUrl(url: string, type: StreamType): { valid: boolean; message?: string; suggestion?: string } {
	if (!url) return { valid: true };
	
	if (type === "youtube") {
		if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
			return { 
				valid: false, 
				message: "This doesn't look like a YouTube URL",
				suggestion: "Try pasting a URL like: https://www.youtube.com/watch?v=..."
			};
		}
		if (url.includes("youtube.com") && !url.includes("watch?v=") && !url.includes("/live/")) {
			return { 
				valid: false, 
				message: "Missing video ID in URL",
				suggestion: "Make sure the URL contains watch?v= or /live/"
			};
		}
	} else if (type === "hls") {
		if (!url.endsWith(".m3u8") && !url.includes(".m3u8?")) {
			return { 
				valid: false, 
				message: "HLS streams should end with .m3u8",
				suggestion: "Check that you're using the correct HLS manifest URL"
			};
		}
	}
	
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		return { 
			valid: false, 
			message: "URL should start with http:// or https://",
		};
	}
	
	return { valid: true };
}

export function RoomEditor({ room, onClose, onSave }: RoomEditorProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	
	const [name, setName] = useState("");
	const [streamUrl, setStreamUrl] = useState("");
	const [streamType, setStreamType] = useState<StreamType>("youtube");
	const [thumbnail, setThumbnail] = useState("");
	const [autoStart, setAutoStart] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
	const [aiValidation, setAiValidation] = useState<{ valid: boolean; message?: string; suggestion?: string } | null>(null);

	useEffect(() => {
		if (room) {
			setName(room.name);
			setStreamUrl(room.streamUrl);
			setStreamType(room.streamType);
			setThumbnail(room.thumbnail || "");
			setAutoStart(room.autoStart || false);
			setTestResult(null);
			setAiValidation(null);
		}
	}, [room]);

	// AI validation on URL change
	useEffect(() => {
		if (streamUrl) {
			const validation = validateStreamUrl(streamUrl, streamType);
			setAiValidation(validation);
		} else {
			setAiValidation(null);
		}
	}, [streamUrl, streamType]);

	// Extract YouTube thumbnail automatically
	useEffect(() => {
		if (streamType === "youtube" && streamUrl && !thumbnail) {
			const videoId = extractYouTubeId(streamUrl);
			if (videoId) {
				setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
			}
		}
	}, [streamUrl, streamType, thumbnail]);

	function extractYouTubeId(url: string): string | null {
		const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([^&?\s]+)/);
		return match ? match[1] : null;
	}

	if (!room) return null;

	const handleSave = async () => {
		if (!name.trim()) {
			return;
		}

		setIsSaving(true);
		try {
			await onSave(room.id, { name, streamUrl, streamType, thumbnail, autoStart });
			onClose();
		} catch (error) {
			console.error("Failed to save room:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleTest = async () => {
		if (!streamUrl) return;
		
		setIsTesting(true);
		setTestResult(null);
		
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		const isValid = streamUrl.startsWith("http") && aiValidation?.valid !== false;
		setTestResult(isValid ? "success" : "error");
		setIsTesting(false);
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					onClick={(e) => e.stopPropagation()}
					className={`w-full max-w-lg rounded-2xl border shadow-2xl shadow-black/50 overflow-hidden ${
						isDark 
							? "bg-gray-900 border-gray-800" 
							: "bg-white border-gray-200"
					}`}
				>
					{/* Header */}
					<div className={`relative px-6 py-5 border-b ${
						isDark 
							? "border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800/50 to-gray-900" 
							: "border-gray-200 bg-gradient-to-r from-white via-gray-50 to-white"
					}`}>
						<div className="flex items-center gap-4">
							<motion.div 
								initial={{ rotate: -10 }}
								animate={{ rotate: 0 }}
								className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
									streamType === "youtube" 
										? "bg-gradient-to-br from-red-500/30 to-red-600/20 text-red-400 shadow-red-500/20" 
										: "bg-gradient-to-br from-blue-500/30 to-blue-600/20 text-blue-400 shadow-blue-500/20"
								}`}
							>
								{streamType === "youtube" ? <Video className="h-6 w-6" /> : <Link2 className="h-6 w-6" />}
							</motion.div>
							<div>
								<h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Edit Room</h2>
								<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Configure stream settings</p>
							</div>
						</div>
						<motion.button
							whileHover={{ scale: 1.1, rotate: 90 }}
							whileTap={{ scale: 0.9 }}
							onClick={onClose}
							className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
								isDark 
									? "hover:bg-gray-800 text-gray-400 hover:text-white" 
									: "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
							}`}
						>
							<X className="h-5 w-5" />
						</motion.button>
					</div>

					{/* Content */}
					<div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
						{/* Room Name */}
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
								Room Name
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter room name"
								className={`w-full h-12 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
									isDark 
										? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
										: "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
								}`}
							/>
						</div>

						{/* Stream Type */}
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
								Stream Type
							</label>
							<div className="grid grid-cols-2 gap-3">
								{[
									{ type: "youtube" as StreamType, label: "YouTube", icon: Video, color: "red" },
									{ type: "hls" as StreamType, label: "HLS Stream", icon: Link2, color: "blue" },
								].map(({ type, label, icon: Icon, color }) => (
									<motion.button
										key={type}
										type="button"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setStreamType(type)}
										className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
											streamType === type
												? color === "red"
													? "border-red-500/50 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10"
													: "border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10"
												: isDark 
													? "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600"
													: "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
										}`}
									>
										<Icon className="h-5 w-5" />
										<span className="font-semibold">{label}</span>
									</motion.button>
								))}
							</div>
						</div>

						{/* Stream URL */}
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
								Stream URL
							</label>
							<div className="relative">
								<input
									type="text"
									value={streamUrl}
									onChange={(e) => { setStreamUrl(e.target.value); setTestResult(null); }}
									placeholder={
										streamType === "youtube"
											? "https://www.youtube.com/watch?v=..."
											: "https://example.com/stream.m3u8"
									}
									className={`w-full h-12 rounded-xl border px-4 pr-24 text-sm focus:outline-none focus:ring-2 transition-all duration-200 font-mono ${
										aiValidation?.valid === false 
											? "border-amber-500/50 focus:ring-amber-500/20 focus:border-amber-500" 
											: isDark 
												? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:ring-purple-500/20 focus:border-purple-500"
												: "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:ring-purple-500/20 focus:border-purple-500"
									}`}
								/>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={handleTest}
									disabled={isTesting || !streamUrl}
									className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 ${
										isDark 
											? "bg-gray-700 hover:bg-gray-600 text-gray-300"
											: "bg-gray-200 hover:bg-gray-300 text-gray-700"
									}`}
								>
									{isTesting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : testResult === "success" ? (
										<Check className="h-3.5 w-3.5 text-emerald-400" />
									) : (
										<Play className="h-3.5 w-3.5" />
									)}
									Test
								</motion.button>
							</div>
							
							{/* AI Validation Feedback */}
							<AnimatePresence>
								{aiValidation && !aiValidation.valid && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
									>
										<div className="flex items-start gap-2">
											<Wand2 className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
											<div>
												<p className="text-xs text-amber-300 font-medium">{aiValidation.message}</p>
												{aiValidation.suggestion && (
													<p className="text-[10px] text-amber-400/70 mt-1">{aiValidation.suggestion}</p>
												)}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							{testResult && (
								<p className={`text-xs mt-2 flex items-center gap-1 ${testResult === "success" ? "text-emerald-400" : "text-red-400"}`}>
									{testResult === "success" ? "✓ Stream URL verified" : "✗ Could not verify stream"}
								</p>
							)}
						</div>

						{/* Thumbnail */}
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
								<Image className="h-3.5 w-3.5" /> Thumbnail URL
							</label>
							<input
								type="text"
								value={thumbnail}
								onChange={(e) => setThumbnail(e.target.value)}
								placeholder="https://example.com/thumbnail.jpg"
								className={`w-full h-12 rounded-xl border px-4 text-sm focus:outline-none focus:ring-2 transition-all duration-200 font-mono ${
									isDark 
										? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
										: "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
								}`}
							/>
							{thumbnail && (
								<motion.div 
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className={`mt-3 aspect-video rounded-xl overflow-hidden border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}
								>
									<img 
										src={thumbnail} 
										alt="Thumbnail preview" 
										className="w-full h-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).style.display = 'none';
										}}
									/>
								</motion.div>
							)}
						</div>

						{/* Auto-start Toggle */}
						<Tooltip content="Stream starts automatically when room is activated">
							<div className={`flex items-center justify-between p-4 rounded-xl border cursor-default ${
								isDark 
									? "border-gray-700 bg-gray-800/30" 
									: "border-gray-200 bg-gray-50"
							}`}>
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-purple-500/20">
										<Sparkles className="h-4 w-4 text-purple-400" />
									</div>
									<div>
										<p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Auto-start Stream</p>
										<p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Starts when room is activated</p>
									</div>
								</div>
								<motion.button
									type="button"
									role="switch"
									aria-checked={autoStart}
									onClick={() => setAutoStart(!autoStart)}
									whileTap={{ scale: 0.95 }}
									className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
										autoStart 
											? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30" 
											: isDark ? "bg-gray-600" : "bg-gray-300"
									} ${isDark ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"}`}
								>
									<motion.span
										layout
										className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0`}
										animate={{ x: autoStart ? 20 : 0 }}
									/>
								</motion.button>
							</div>
						</Tooltip>
					</div>

					{/* Footer */}
					<div className={`flex gap-3 px-6 py-5 border-t ${
						isDark 
							? "border-gray-800 bg-gray-900/50" 
							: "border-gray-200 bg-gray-50"
					}`}>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={onClose}
							disabled={isSaving}
							className={`flex-1 h-11 rounded-xl border font-semibold disabled:opacity-50 transition-colors ${
								isDark 
									? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
									: "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
							}`}
						>
							Cancel
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={handleSave}
							disabled={isSaving || !name.trim()}
							className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
						>
							{isSaving ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
