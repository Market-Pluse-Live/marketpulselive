import { supabase } from "./supabase";
import type { Room } from "./types";

// Get all rooms
export async function getRooms(): Promise<Room[]> {
	const { data, error } = await supabase
		.from("rooms")
		.select("*")
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Error fetching rooms:", error);
		return [];
	}

	return (data || []).map(mapDbRoomToRoom);
}

// Get rooms by company ID
export async function getRoomsByCompany(companyId: string): Promise<Room[]> {
	const { data, error } = await supabase
		.from("rooms")
		.select("*")
		.eq("company_id", companyId)
		.order("created_at", { ascending: true });

	if (error) {
		console.error("Error fetching rooms by company:", error);
		return [];
	}

	return (data || []).map(mapDbRoomToRoom);
}

// Get room by ID
export async function getRoomById(
	roomId: string,
	companyId: string
): Promise<Room | null> {
	const { data, error } = await supabase
		.from("rooms")
		.select("*")
		.eq("id", roomId)
		.eq("company_id", companyId)
		.single();

	if (error || !data) {
		return null;
	}

	return mapDbRoomToRoom(data);
}

// Create a new room
export async function createRoom(
	companyId: string,
	roomData: Omit<Room, "id" | "companyId" | "createdAt" | "updatedAt">
): Promise<Room> {
	const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	
	const { data, error } = await supabase
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
		console.error("Error creating room:", error);
		throw new Error("Failed to create room");
	}

	return mapDbRoomToRoom(data);
}

// Update a room
export async function updateRoom(
	roomId: string,
	companyId: string,
	updates: Partial<Omit<Room, "id" | "companyId" | "createdAt">>
): Promise<Room | null> {
	const updateData: Record<string, unknown> = {
		updated_at: new Date().toISOString(),
	};

	if (updates.name !== undefined) updateData.name = updates.name;
	if (updates.streamUrl !== undefined) updateData.stream_url = updates.streamUrl;
	if (updates.streamType !== undefined) updateData.stream_type = updates.streamType;
	if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
	if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
	if (updates.autoStart !== undefined) updateData.auto_start = updates.autoStart;

	const { data, error } = await supabase
		.from("rooms")
		.update(updateData)
		.eq("id", roomId)
		.eq("company_id", companyId)
		.select()
		.single();

	if (error || !data) {
		console.error("Error updating room:", error);
		return null;
	}

	return mapDbRoomToRoom(data);
}

// Delete a room
export async function deleteRoom(roomId: string, companyId: string): Promise<boolean> {
	const { error } = await supabase
		.from("rooms")
		.delete()
		.eq("id", roomId)
		.eq("company_id", companyId);

	if (error) {
		console.error("Error deleting room:", error);
		return false;
	}

	return true;
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
			console.error("Error creating default room:", err);
		}
	}

	return createdRooms;
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
