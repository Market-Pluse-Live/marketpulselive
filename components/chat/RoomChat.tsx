"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
	MessageCircle, 
	Send, 
	X, 
	User, 
	Trash2, 
	Shield,
	ChevronRight,
	ChevronLeft,
	Smile
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useRole } from "@/lib/role-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Message {
	id: string;
	room_id: string;
	nickname: string;
	content: string;
	is_admin: boolean;
	created_at: string;
}

interface RoomChatProps {
	roomId: string;
	roomName: string;
}

export function RoomChat({ roomId, roomName }: RoomChatProps) {
	const [isOpen, setIsOpen] = useState(true);
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [nickname, setNickname] = useState("");
	const [showNicknameModal, setShowNicknameModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	
	const { theme } = useTheme();
	const { isAdmin } = useRole();
	const isDark = theme === "dark";

	// Load nickname from localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedNickname = localStorage.getItem("mpl-chat-nickname");
			if (savedNickname) {
				setNickname(savedNickname);
			}
		}
	}, []);

	// Scroll to bottom when new messages arrive
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	// Fetch initial messages
	useEffect(() => {
		const fetchMessages = async () => {
			if (!isSupabaseConfigured || !supabase) {
				setIsLoading(false);
				return;
			}

			try {
				const { data, error } = await supabase
					.from("messages")
					.select("*")
					.eq("room_id", roomId)
					.order("created_at", { ascending: true })
					.limit(100);

				if (error) {
					console.error("Error fetching messages:", error);
				} else {
					setMessages(data || []);
				}
			} catch (err) {
				console.error("Failed to fetch messages:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchMessages();
	}, [roomId]);

	// Subscribe to real-time messages
	useEffect(() => {
		if (!isSupabaseConfigured || !supabase) return;

		const channel = supabase
			.channel(`room-${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `room_id=eq.${roomId}`,
				},
				(payload) => {
					const newMsg = payload.new as Message;
					// Avoid duplicates - check if message already exists
					setMessages((prev) => {
						const exists = prev.some((m) => m.id === newMsg.id);
						if (exists) return prev;
						// Also check for temp messages with same content to avoid duplicates
						const tempMatch = prev.find(
							(m) => m.id.startsWith("temp-") && 
							m.content === newMsg.content && 
							m.nickname === newMsg.nickname
						);
						if (tempMatch) {
							// Replace temp message with real one
							return prev.map((m) => m.id === tempMatch.id ? newMsg : m);
						}
						return [...prev, newMsg];
					});
				}
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "messages",
					filter: `room_id=eq.${roomId}`,
				},
				(payload) => {
					const deletedId = payload.old.id;
					setMessages((prev) => prev.filter((m) => m.id !== deletedId));
				}
			)
			.subscribe();

		return () => {
			if (supabase) {
				supabase.removeChannel(channel);
			}
		};
	}, [roomId]);

	// Save nickname
	const saveNickname = (name: string) => {
		const trimmedName = name.trim();
		if (trimmedName) {
			setNickname(trimmedName);
			if (typeof window !== "undefined") {
				localStorage.setItem("mpl-chat-nickname", trimmedName);
			}
			setShowNicknameModal(false);
		}
	};

	// Send message
	const sendMessage = async () => {
		if (!newMessage.trim()) return;
		
		if (!nickname) {
			setShowNicknameModal(true);
			return;
		}

		const messageContent = newMessage.trim();
		const tempId = `temp-${Date.now()}`;
		
		// Optimistically add message to UI immediately
		const optimisticMessage: Message = {
			id: tempId,
			room_id: roomId,
			nickname: nickname,
			content: messageContent,
			is_admin: isAdmin,
			created_at: new Date().toISOString(),
		};
		setMessages((prev) => [...prev, optimisticMessage]);
		setNewMessage("");

		if (!isSupabaseConfigured || !supabase) {
			// Keep the optimistic message if Supabase isn't configured
			return;
		}

		setIsSending(true);
		try {
			const { data, error } = await supabase
				.from("messages")
				.insert({
					room_id: roomId,
					nickname: nickname,
					content: messageContent,
					is_admin: isAdmin,
				})
				.select()
				.single();

			if (error) {
				console.error("Error sending message:", error);
				// Remove optimistic message on error
				setMessages((prev) => prev.filter((m) => m.id !== tempId));
			} else if (data) {
				// Replace temp message with real one from database
				setMessages((prev) => 
					prev.map((m) => m.id === tempId ? data : m)
				);
			}
		} catch (err) {
			console.error("Failed to send message:", err);
			// Remove optimistic message on error
			setMessages((prev) => prev.filter((m) => m.id !== tempId));
		} finally {
			setIsSending(false);
		}
	};

	// Delete message (admin only)
	const deleteMessage = async (messageId: string) => {
		if (!isAdmin || !isSupabaseConfigured || !supabase) return;

		try {
			const { error } = await supabase
				.from("messages")
				.delete()
				.eq("id", messageId);

			if (error) {
				console.error("Error deleting message:", error);
			}
		} catch (err) {
			console.error("Failed to delete message:", err);
		}
	};

	// Handle key press
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Format timestamp
	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	// Quick emoji picker
	const emojis = ["👍", "❤️", "😂", "🔥", "👏", "🎉", "💯", "🚀"];
	const [showEmojis, setShowEmojis] = useState(false);

	const addEmoji = (emoji: string) => {
		setNewMessage((prev) => prev + emoji);
		setShowEmojis(false);
		inputRef.current?.focus();
	};

	return (
		<>
			{/* Chat Panel */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ x: "100%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "100%", opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className={`w-80 sm:w-96 h-full flex flex-col border-l ${
							isDark
								? "bg-gray-900/95 border-gray-800"
								: "bg-white/95 border-gray-200"
						} backdrop-blur-xl`}
					>
						{/* Chat Header */}
						<div className={`flex items-center justify-between p-4 border-b ${
							isDark ? "border-gray-800" : "border-gray-200"
						}`}>
							<div className="flex items-center gap-2">
								<MessageCircle className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
								<h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
									Live Chat
								</h3>
								<span className={`text-xs px-2 py-0.5 rounded-full ${
									isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
								}`}>
									{messages.length}
								</span>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className={`p-1.5 rounded-lg transition-colors ${
									isDark
										? "hover:bg-gray-800 text-gray-400"
										: "hover:bg-gray-100 text-gray-500"
								}`}
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</div>

						{/* Nickname Display */}
						{nickname && (
							<div className={`px-4 py-2 border-b flex items-center justify-between ${
								isDark ? "border-gray-800 bg-gray-800/50" : "border-gray-100 bg-gray-50"
							}`}>
								<div className="flex items-center gap-2">
									<User className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
									<span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
										Chatting as <span className="font-medium">{nickname}</span>
									</span>
									{isAdmin && (
										<span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 flex items-center gap-1">
											<Shield className="h-3 w-3" />
											Admin
										</span>
									)}
								</div>
								<button
									onClick={() => setShowNicknameModal(true)}
									className={`text-xs ${isDark ? "text-purple-400" : "text-purple-600"} hover:underline`}
								>
									Change
								</button>
							</div>
						)}

						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							{isLoading ? (
								<div className="flex items-center justify-center h-full">
									<div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
										isDark ? "border-purple-400" : "border-purple-600"
									}`} />
								</div>
							) : messages.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-center">
									<MessageCircle className={`h-12 w-12 mb-3 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
										No messages yet
									</p>
									<p className={`text-xs mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
										Be the first to say hello! 👋
									</p>
								</div>
							) : (
								messages.map((message) => (
									<motion.div
										key={message.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className={`group relative ${
											message.is_admin ? "pl-2 border-l-2 border-purple-500" : ""
										}`}
									>
										<div className="flex items-start gap-2">
											<div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
												message.is_admin
													? "bg-purple-500/20 text-purple-400"
													: isDark
														? "bg-gray-800 text-gray-400"
														: "bg-gray-100 text-gray-500"
											}`}>
												{message.is_admin ? (
													<Shield className="h-4 w-4" />
												) : (
													<span className="text-sm font-medium">
														{message.nickname.charAt(0).toUpperCase()}
													</span>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<span className={`text-sm font-medium truncate ${
														message.is_admin
															? "text-purple-400"
															: isDark
																? "text-white"
																: "text-gray-900"
													}`}>
														{message.nickname}
													</span>
													{message.is_admin && (
														<span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">
															ADMIN
														</span>
													)}
													<span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
														{formatTime(message.created_at)}
													</span>
												</div>
												<p className={`text-sm mt-0.5 break-words ${
													isDark ? "text-gray-300" : "text-gray-700"
												}`}>
													{message.content}
												</p>
											</div>
											{/* Admin delete button */}
											{isAdmin && (
												<button
													onClick={() => deleteMessage(message.id)}
													className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-500/20 transition-all"
													title="Delete message"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											)}
										</div>
									</motion.div>
								))
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Message Input */}
						<div className={`p-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
							{/* Emoji Picker */}
							<AnimatePresence>
								{showEmojis && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										className={`flex gap-1 mb-2 p-2 rounded-lg ${
											isDark ? "bg-gray-800" : "bg-gray-100"
										}`}
									>
										{emojis.map((emoji) => (
											<button
												key={emoji}
												onClick={() => addEmoji(emoji)}
												className="p-1.5 hover:bg-white/10 rounded transition-colors text-lg"
											>
												{emoji}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
							
							<div className="flex items-center gap-2">
								<button
									onClick={() => setShowEmojis(!showEmojis)}
									className={`p-2 rounded-lg transition-colors ${
										isDark
											? "hover:bg-gray-800 text-gray-400"
											: "hover:bg-gray-100 text-gray-500"
									}`}
								>
									<Smile className="h-5 w-5" />
								</button>
								<input
									ref={inputRef}
									type="text"
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder={nickname ? "Type a message..." : "Set nickname to chat"}
									disabled={!nickname && !showNicknameModal}
									className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors ${
										isDark
											? "bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50"
											: "bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50"
									}`}
								/>
								<button
									onClick={sendMessage}
									disabled={!newMessage.trim() || isSending}
									className={`p-2.5 rounded-xl transition-colors ${
										newMessage.trim()
											? "bg-purple-500 hover:bg-purple-600 text-white"
											: isDark
												? "bg-gray-800 text-gray-600"
												: "bg-gray-100 text-gray-400"
									}`}
								>
									<Send className={`h-5 w-5 ${isSending ? "animate-pulse" : ""}`} />
								</button>
							</div>
							
							{!nickname && (
								<button
									onClick={() => setShowNicknameModal(true)}
									className={`w-full mt-2 py-2 text-sm rounded-lg transition-colors ${
										isDark
											? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
											: "bg-purple-50 text-purple-600 hover:bg-purple-100"
									}`}
								>
									Set your nickname to start chatting
								</button>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Toggle Button (when chat is closed) */}
			{!isOpen && (
				<motion.button
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					onClick={() => setIsOpen(true)}
					className={`fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-l-xl shadow-lg transition-colors z-50 ${
						isDark
							? "bg-purple-500 hover:bg-purple-600 text-white"
							: "bg-purple-500 hover:bg-purple-600 text-white"
					}`}
				>
					<div className="flex items-center gap-2">
						<ChevronLeft className="h-5 w-5" />
						<MessageCircle className="h-5 w-5" />
						{messages.length > 0 && (
							<span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
								{messages.length > 99 ? "99+" : messages.length}
							</span>
						)}
					</div>
				</motion.button>
			)}

			{/* Nickname Modal */}
			<AnimatePresence>
				{showNicknameModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						onClick={() => setShowNicknameModal(false)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
							className={`w-full max-w-sm rounded-2xl p-6 ${
								isDark ? "bg-gray-900" : "bg-white"
							}`}
						>
							<h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
								Choose your nickname
							</h3>
							<p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
								This will be displayed when you send messages
							</p>
							<NicknameInput
								initialValue={nickname}
								onSave={saveNickname}
								onCancel={() => setShowNicknameModal(false)}
								isDark={isDark}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

// Nickname Input Component
function NicknameInput({
	initialValue,
	onSave,
	onCancel,
	isDark,
}: {
	initialValue: string;
	onSave: (name: string) => void;
	onCancel: () => void;
	isDark: boolean;
}) {
	const [value, setValue] = useState(initialValue);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (value.trim()) {
			onSave(value.trim());
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Enter your nickname"
				maxLength={20}
				className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${
					isDark
						? "bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50"
						: "bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50"
				}`}
			/>
			<div className="flex gap-3">
				<button
					type="button"
					onClick={onCancel}
					className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
						isDark
							? "bg-gray-800 text-gray-300 hover:bg-gray-700"
							: "bg-gray-100 text-gray-600 hover:bg-gray-200"
					}`}
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={!value.trim()}
					className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
						value.trim()
							? "bg-purple-500 hover:bg-purple-600 text-white"
							: isDark
								? "bg-gray-800 text-gray-600"
								: "bg-gray-200 text-gray-400"
					}`}
				>
					Save
				</button>
			</div>
		</form>
	);
}

