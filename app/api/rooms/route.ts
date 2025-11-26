import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import {
	getRoomsByCompany,
	createRoom,
	initializeRoomsForCompany,
} from "@/lib/db";
import type { CreateRoomInput } from "@/lib/types";

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

		// Verify user has access to this company (bypassed in dev mode)
		const hasAccess = await verifyAccess(companyId);
		if (!hasAccess) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Initialize rooms if they don't exist
		await initializeRoomsForCompany(companyId);

		// Get rooms for this company
		const rooms = await getRoomsByCompany(companyId);

		return NextResponse.json({ rooms });
	} catch (error: any) {
		console.error("Error fetching rooms:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch rooms" },
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

		// Verify user has access to this company (bypassed in dev mode)
		const hasAccess = await verifyAccess(companyId);
		if (!hasAccess) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Create the room
		const room = await createRoom(companyId, {
			name: roomData.name,
			streamUrl: roomData.streamUrl,
			streamType: roomData.streamType,
			isActive: roomData.isActive ?? false,
		});

		return NextResponse.json({ room }, { status: 201 });
	} catch (error: any) {
		console.error("Error creating room:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create room" },
			{ status: 500 },
		);
	}
}

