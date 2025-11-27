import { NextResponse } from "next/server";
import { getRoomById, updateRoom } from "@/lib/db";
import type { UpdateRoomInput } from "@/lib/types";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	try {
		const { roomId } = await params;
		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Get the room
		const room = await getRoomById(roomId, companyId);

		if (!room) {
			return NextResponse.json({ error: "Room not found" }, { status: 404 });
		}

		return NextResponse.json({ room });
	} catch (error: unknown) {
		console.error("Error fetching room:", error);
		const message = error instanceof Error ? error.message : "Failed to fetch room";
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ roomId: string }> },
) {
	try {
		const { roomId } = await params;
		const body: UpdateRoomInput & { companyId: string } =
			await request.json();
		const { companyId, ...updates } = body;

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId is required" },
				{ status: 400 },
			);
		}

		// Update the room
		const room = await updateRoom(roomId, companyId, updates);

		if (!room) {
			return NextResponse.json({ error: "Room not found" }, { status: 404 });
		}

		return NextResponse.json({ room });
	} catch (error: unknown) {
		console.error("Error updating room:", error);
		const message = error instanceof Error ? error.message : "Failed to update room";
		return NextResponse.json(
			{ error: message },
			{ status: 500 },
		);
	}
}
