import { supabase, isSupabaseConfigured } from "./supabase";
import type { Room } from "./types";

// In-memory storage for development when Supabase is not configured
const inMemoryRooms: Map<string, Room[]> = new Map();

// Flag to track if we should use in-memory storage (after Supabase fails)
let useInMemoryFallback = false;

// Helper function to check if we should use in-memory storage
function shouldUseInMemory(): boolean {
	return !isSupabaseConfigured || !supabase || useInMemoryFallback;
}

// Helper function to map database room to Room type
function mapDbRoomToRoom(dbRoom: {
	id: string;
	name: string;
	stream_url: string;
	stream_type: string;
	is_active: boolean;
	company_id: string;
	thumbnail: string | null;
	auto_start: boolean;
	created_at: string;
	updated_at: string;
}): Room {
	return {
		id: dbRoom.id,
		name: dbRoom.name,
		streamUrl: dbRoom.stream_url,
		streamType: dbRoom.stream_type as "youtube" | "hls" | "embed",
		isActive: dbRoom.is_active,
		companyId: dbRoom.company_id,
		thumbnail: dbRoom.thumbnail || undefined,
		autoStart: dbRoom.auto_start,
		createdAt: dbRoom.created_at,
		updatedAt: dbRoom.updated_at,
	};
}

// Get all rooms
export async function getRooms(): Promise<Room[]> {
	if (shouldUseInMemory()) {
		const allRooms: Room[] = [];
		inMemoryRooms.forEach((rooms) => allRooms.push(...rooms));
		return allRooms;
	}

	try {
		const { data, error } = await supabase!
			.from("rooms")
			.select("*")
			.order("created_at", { ascending: true });

		if (error) {
			console.warn("Supabase error, falling back to in-memory storage:", error);
			useInMemoryFallback = true;
			return [];
		}

		return (data || []).map(mapDbRoomToRoom);
	} catch (err) {
		console.warn("Supabase connection failed, using in-memory storage");
		useInMemoryFallback = true;
		return [];
	}
}

// Get rooms by company ID
export async function getRoomsByCompany(companyId: string): Promise<Room[]> {
	if (shouldUseInMemory()) {
		const rooms = inMemoryRooms.get(companyId) || [];
		console.log("[DB] getRoomsByCompany (in-memory):", companyId, "- found", rooms.length, "rooms");
		return rooms;
	}

	try {
		const { data, error } = await supabase!
			.from("rooms")
			.select("*")
			.eq("company_id", companyId)
			.order("created_at", { ascending: true });

		if (error) {
			console.warn("Supabase error, falling back to in-memory storage");
			useInMemoryFallback = true;
			return inMemoryRooms.get(companyId) || [];
		}

		return (data || []).map(mapDbRoomToRoom);
	} catch (err) {
		console.warn("Supabase connection failed, using in-memory storage");
		useInMemoryFallback = true;
		return inMemoryRooms.get(companyId) || [];
	}
}

// Get room by ID
export async function getRoomById(
	roomId: string,
	companyId: string
): Promise<Room | null> {
	if (shouldUseInMemory()) {
		const companyRooms = inMemoryRooms.get(companyId) || [];
		return companyRooms.find((r) => r.id === roomId) || null;
	}

	try {
		const { data, error } = await supabase!
			.from("rooms")
			.select("*")
			.eq("id", roomId)
			.eq("company_id", companyId)
			.single();

		if (error || !data) {
			return null;
		}

		return mapDbRoomToRoom(data);
	} catch (err) {
		useInMemoryFallback = true;
		const companyRooms = inMemoryRooms.get(companyId) || [];
		return companyRooms.find((r) => r.id === roomId) || null;
	}
}

// Create a new room
export async function createRoom(
	companyId: string,
	roomData: Omit<Room, "id" | "companyId" | "createdAt" | "updatedAt">
): Promise<Room> {
	const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	const now = new Date().toISOString();

	const newRoom: Room = {
		id: roomId,
		name: roomData.name,
		streamUrl: roomData.streamUrl || "",
		streamType: roomData.streamType,
		isActive: roomData.isActive || false,
		companyId: companyId,
		thumbnail: roomData.thumbnail,
		autoStart: roomData.autoStart || false,
		createdAt: now,
		updatedAt: now,
	};

	if (shouldUseInMemory()) {
		const companyRooms = inMemoryRooms.get(companyId) || [];
		companyRooms.push(newRoom);
		inMemoryRooms.set(companyId, companyRooms);
		return newRoom;
	}

	try {
		const { data, error } = await supabase!
			.from("rooms")
			.insert({
				id: roomId,
				name: roomData.name,
				stream_url: roomData.streamUrl || "",
				stream_type: roomData.streamType,
				is_active: roomData.isActive || false,
				company_id: companyId,
				thumbnail: roomData.thumbnail || null,
				auto_start: roomData.autoStart || false,
			})
			.select()
			.single();

		if (error) {
			console.warn("Supabase error, falling back to in-memory storage");
			useInMemoryFallback = true;
			// Create in memory instead
			const companyRooms = inMemoryRooms.get(companyId) || [];
			companyRooms.push(newRoom);
			inMemoryRooms.set(companyId, companyRooms);
			return newRoom;
		}

		return mapDbRoomToRoom(data);
	} catch (err) {
		console.warn("Supabase connection failed, using in-memory storage");
		useInMemoryFallback = true;
		const companyRooms = inMemoryRooms.get(companyId) || [];
		companyRooms.push(newRoom);
		inMemoryRooms.set(companyId, companyRooms);
		return newRoom;
	}
}

// Update a room
export async function updateRoom(
	roomId: string,
	companyId: string,
	updates: Partial<Omit<Room, "id" | "companyId" | "createdAt">>
): Promise<Room | null> {
	if (shouldUseInMemory()) {
		const companyRooms = inMemoryRooms.get(companyId) || [];
		const roomIndex = companyRooms.findIndex((r) => r.id === roomId);
		if (roomIndex === -1) return null;

		const updatedRoom: Room = {
			...companyRooms[roomIndex],
			...updates,
			updatedAt: new Date().toISOString(),
		};
		companyRooms[roomIndex] = updatedRoom;
		inMemoryRooms.set(companyId, companyRooms);
		return updatedRoom;
	}

	try {
		const updateData: Record<string, unknown> = {
			updated_at: new Date().toISOString(),
		};

		if (updates.name !== undefined) updateData.name = updates.name;
		if (updates.streamUrl !== undefined) updateData.stream_url = updates.streamUrl;
		if (updates.streamType !== undefined) updateData.stream_type = updates.streamType;
		if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
		if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
		if (updates.autoStart !== undefined) updateData.auto_start = updates.autoStart;

		const { data, error } = await supabase!
			.from("rooms")
			.update(updateData)
			.eq("id", roomId)
			.eq("company_id", companyId)
			.select()
			.single();

		if (error || !data) {
			console.warn("Supabase error updating room, using in-memory fallback");
			useInMemoryFallback = true;
			// Try updating in memory
			const companyRooms = inMemoryRooms.get(companyId) || [];
			const roomIndex = companyRooms.findIndex((r) => r.id === roomId);
			if (roomIndex === -1) return null;
			const updatedRoom: Room = {
				...companyRooms[roomIndex],
				...updates,
				updatedAt: new Date().toISOString(),
			};
			companyRooms[roomIndex] = updatedRoom;
			inMemoryRooms.set(companyId, companyRooms);
			return updatedRoom;
		}

		return mapDbRoomToRoom(data);
	} catch (err) {
		useInMemoryFallback = true;
		const companyRooms = inMemoryRooms.get(companyId) || [];
		const roomIndex = companyRooms.findIndex((r) => r.id === roomId);
		if (roomIndex === -1) return null;
		const updatedRoom: Room = {
			...companyRooms[roomIndex],
			...updates,
			updatedAt: new Date().toISOString(),
		};
		companyRooms[roomIndex] = updatedRoom;
		inMemoryRooms.set(companyId, companyRooms);
		return updatedRoom;
	}
}

// Delete a room
export async function deleteRoom(roomId: string, companyId: string): Promise<boolean> {
	if (shouldUseInMemory()) {
		const companyRooms = inMemoryRooms.get(companyId) || [];
		const filteredRooms = companyRooms.filter((r) => r.id !== roomId);
		inMemoryRooms.set(companyId, filteredRooms);
		return true;
	}

	try {
		const { error } = await supabase!
			.from("rooms")
			.delete()
			.eq("id", roomId)
			.eq("company_id", companyId);

		if (error) {
			useInMemoryFallback = true;
			const companyRooms = inMemoryRooms.get(companyId) || [];
			const filteredRooms = companyRooms.filter((r) => r.id !== roomId);
			inMemoryRooms.set(companyId, filteredRooms);
			return true;
		}

		return true;
	} catch (err) {
		useInMemoryFallback = true;
		const companyRooms = inMemoryRooms.get(companyId) || [];
		const filteredRooms = companyRooms.filter((r) => r.id !== roomId);
		inMemoryRooms.set(companyId, filteredRooms);
		return true;
	}
}

// Initialize 8 default rooms for a company
export async function initializeRoomsForCompany(companyId: string): Promise<Room[]> {
	const existingRooms = await getRoomsByCompany(companyId);
	if (existingRooms.length > 0) {
		return existingRooms;
	}

	const defaultRooms = [
		{ name: "Room 1", streamUrl: "", streamType: "youtube" as const },
		{ name: "Room 2", streamUrl: "", streamType: "youtube" as const },
		{ name: "Room 3", streamUrl: "", streamType: "youtube" as const },
		{ name: "Room 4", streamUrl: "", streamType: "youtube" as const },
		{ name: "Room 5", streamUrl: "", streamType: "hls" as const },
		{ name: "Room 6", streamUrl: "", streamType: "hls" as const },
		{ name: "Room 7", streamUrl: "", streamType: "hls" as const },
		{ name: "Room 8", streamUrl: "", streamType: "hls" as const },
	];

	const createdRooms: Room[] = [];
	for (const roomData of defaultRooms) {
		try {
			const room = await createRoom(companyId, {
				...roomData,
				isActive: false,
			});
			createdRooms.push(room);
		} catch (err) {
			console.warn("Error creating default room:", err);
		}
	}

	return createdRooms;
}
