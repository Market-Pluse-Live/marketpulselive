import { promises as fs } from "fs";
import path from "path";
import type { Room } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "rooms.json");

// Ensure data directory exists
async function ensureDataDir() {
	const dataDir = path.dirname(DB_PATH);
	try {
		await fs.access(dataDir);
	} catch {
		await fs.mkdir(dataDir, { recursive: true });
	}
}

// Read rooms from file
export async function getRooms(): Promise<Room[]> {
	await ensureDataDir();
	try {
		const data = await fs.readFile(DB_PATH, "utf-8");
		return JSON.parse(data);
	} catch {
		return [];
	}
}

// Write rooms to file
export async function saveRooms(rooms: Room[]): Promise<void> {
	await ensureDataDir();
	await fs.writeFile(DB_PATH, JSON.stringify(rooms, null, 2), "utf-8");
}

// Get rooms by company ID
export async function getRoomsByCompany(companyId: string): Promise<Room[]> {
	const rooms = await getRooms();
	return rooms.filter((room) => room.companyId === companyId);
}

// Get room by ID
export async function getRoomById(
	roomId: string,
	companyId: string,
): Promise<Room | null> {
	const rooms = await getRoomsByCompany(companyId);
	return rooms.find((room) => room.id === roomId) || null;
}

// Create a new room
export async function createRoom(
	companyId: string,
	roomData: Omit<Room, "id" | "companyId" | "createdAt" | "updatedAt">,
): Promise<Room> {
	const rooms = await getRooms();
	const newRoom: Room = {
		id: `room_${Date.now()}_${Math.random().toString(36).substring(7)}`,
		...roomData,
		companyId,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
	rooms.push(newRoom);
	await saveRooms(rooms);
	return newRoom;
}

// Update a room
export async function updateRoom(
	roomId: string,
	companyId: string,
	updates: Partial<Omit<Room, "id" | "companyId" | "createdAt">>,
): Promise<Room | null> {
	const rooms = await getRooms();
	const roomIndex = rooms.findIndex(
		(room) => room.id === roomId && room.companyId === companyId,
	);

	if (roomIndex === -1) {
		return null;
	}

	rooms[roomIndex] = {
		...rooms[roomIndex],
		...updates,
		updatedAt: new Date().toISOString(),
	};

	await saveRooms(rooms);
	return rooms[roomIndex];
}

// Initialize 8 default rooms for a company
export async function initializeRoomsForCompany(
	companyId: string,
): Promise<Room[]> {
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
		const room = await createRoom(companyId, {
			...roomData,
			isActive: false,
		});
		createdRooms.push(room);
	}

	return createdRooms;
}

