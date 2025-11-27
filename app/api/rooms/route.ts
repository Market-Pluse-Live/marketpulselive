import { NextResponse } from "next/server";
import {
	getRoomsByCompany,
	createRoom,
	initializeRoomsForCompany,
} from "@/lib/db";
import type { CreateRoomInput } from "@/lib/types";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Initialize rooms if they don't exist
		await initializeRoomsForCompany(companyId);

		// Get rooms for this company
		const rooms = await getRoomsByCompany(companyId);

		return NextResponse.json({ rooms });
	} catch (error: unknown) {
		console.error("Error fetching rooms:", error);
		const message = error instanceof Error ? error.message : "Failed to fetch rooms";
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const body: CreateRoomInput & { companyId: string } =
			await request.json();
		const { companyId, ...roomData } = body;

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Create the room
		const room = await createRoom(companyId, {
			name: roomData.name,
			streamUrl: roomData.streamUrl,
			streamType: roomData.streamType,
			isActive: roomData.isActive ?? false,
		});

		return NextResponse.json({ room }, { status: 201 });
	} catch (error: unknown) {
		console.error("Error creating room:", error);
		const message = error instanceof Error ? error.message : "Failed to create room";
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}

