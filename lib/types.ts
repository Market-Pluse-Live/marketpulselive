export type StreamType = "youtube" | "hls" | "embed";

export type RoomStatus = "live" | "active" | "configured" | "inactive" | "error";

export interface StreamMetrics {
	viewerCount: number;
	health: "good" | "fair" | "poor";
	bitrate: number; // kbps
	latency: number; // ms
}

export interface Room {
	id: string;
	name: string;
	streamUrl: string;
	streamType: StreamType;
	isActive: boolean;
	companyId: string;
	thumbnail?: string;
	autoStart?: boolean;
	lastUpdated?: string;
	metrics?: StreamMetrics;
	createdAt?: string;
	updatedAt?: string;
}

export interface UpdateRoomInput {
	name?: string;
	streamUrl?: string;
	streamType?: StreamType;
	isActive?: boolean;
	thumbnail?: string;
	autoStart?: boolean;
}

export interface CreateRoomInput {
	name: string;
	streamUrl: string;
	streamType: StreamType;
	isActive?: boolean;
	thumbnail?: string;
	autoStart?: boolean;
}

export interface ActivityLogEntry {
	id: string;
	roomId: string;
	roomName: string;
	action: "created" | "updated" | "activated" | "deactivated" | "started_stream" | "stopped_stream";
	timestamp: string;
}

export interface DashboardStats {
	totalRooms: number;
	liveRooms: number;
	activeRooms: number;
	configuredRooms: number;
	notConfiguredRooms: number;
	errorRooms: number;
}

export function getRoomStatus(room: Room): RoomStatus {
	if (!room.streamUrl) return "inactive";
	if (!room.isActive) return "configured";
	// Mock: randomly show some as live for demo
	if (room.isActive && room.streamUrl && room.id.includes("1")) return "live";
	return "active";
}

export function generateMockMetrics(): StreamMetrics {
	return {
		viewerCount: Math.floor(Math.random() * 500) + 10,
		health: ["good", "fair", "poor"][Math.floor(Math.random() * 3)] as "good" | "fair" | "poor",
		bitrate: Math.floor(Math.random() * 6000) + 2000,
		latency: Math.floor(Math.random() * 200) + 50,
	};
}
