import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { getRoomById, updateRoom } from "@/lib/db";
import type { UpdateRoomInput } from "@/lib/types";

// Dev mode for local testing without Whop auth
const DEV_MODE = process.env.NODE_ENV === "development";

async function verifyAccess(companyId: string): Promise<boolean> {
	if (DEV_MODE) {
		return true;
	}
	try {
		const { userId } = await whopsdk.verifyUserToken(await headers());
		await whopsdk.users.checkAccess(companyId, { id: userId });
		return true;
	} catch {
		return false;
	}
}

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

		// Verify user has access to this company (bypassed in dev mode)
		const hasAccess = await verifyAccess(companyId);
		if (!hasAccess) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get the room
		const room = await getRoomById(roomId, companyId);

		if (!room) {
			return NextResponse.json({ error: "Room not found" }, { status: 404 });
		}

		return NextResponse.json({ room });
	} catch (error: any) {
		console.error("Error fetching room:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch room" },
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

		// Verify user has access to this company (bypassed in dev mode)
		const hasAccess = await verifyAccess(companyId);
		if (!hasAccess) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Update the room
		const room = await updateRoom(roomId, companyId, updates);

		if (!room) {
			return NextResponse.json({ error: "Room not found" }, { status: 404 });
		}

		return NextResponse.json({ room });
	} catch (error: any) {
		console.error("Error updating room:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to update room" },
			{ status: 500 },
		);
	}
}

