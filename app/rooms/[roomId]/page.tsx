import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";
import { getRooms } from "@/lib/db";
import { Button } from "@whop/react/components";
import { StreamPlayer } from "@/components/viewer/StreamPlayer";
import { LockScreen } from "@/components/viewer/LockScreen";
import { ArrowLeft, Home } from "lucide-react";

const DEV_MODE = process.env.NODE_ENV === "development";

export default async function RoomViewerPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const { roomId } = await params;

	let room = null;
	let hasAccess = false;

	const allRooms = await getRooms();
	room = allRooms.find((r) => r.id === roomId) || null;

	if (room) {
		// In dev mode, grant access without Whop authentication
		if (DEV_MODE) {
			hasAccess = true;
		} else {
			// Production: verify with Whop
			try {
				const { userId } = await whopsdk.verifyUserToken(await headers());
				try {
					await whopsdk.users.checkAccess(room.companyId, { id: userId });
					hasAccess = true;
				} catch {
					hasAccess = false;
				}
			} catch (error) {
				console.error("Auth error:", error);
				hasAccess = false;
			}
		}
	}

	if (!room) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Not Found</h1>
					<p className="text-gray-500 dark:text-gray-400">
						The requested livestream room does not exist.
					</p>
					<Link href="/">
						<Button variant="ghost">
							<Home className="h-4 w-4 mr-1" />
							Go Home
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (!room.isActive) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stream Offline</h1>
					<p className="text-gray-500 dark:text-gray-400">
						This room is currently inactive.
					</p>
					<Link href="/discover">
						<Button variant="ghost">
							<ArrowLeft className="h-4 w-4 mr-1" />
							Browse Streams
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (!hasAccess) {
		return <LockScreen />;
	}

	if (!room.streamUrl) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Stream URL not configured yet.
					</p>
					<Link href="/dashboard/dev-company">
						<Button variant="ghost">Go to Dashboard</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-950">
			{/* Header */}
			<header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/discover">
							<Button variant="ghost" size="2">
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<div>
							<h1 className="text-lg font-semibold text-white">{room.name}</h1>
							<div className="flex items-center gap-2">
								<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
								<span className="text-xs text-gray-400 uppercase">Live</span>
							</div>
						</div>
					</div>
					<Link href="/">
						<Button variant="ghost" size="2">
							<Home className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-6 py-6">
				<StreamPlayer
					streamUrl={room.streamUrl}
					streamType={room.streamType}
					roomName={room.name}
				/>
			</div>
		</div>
	);
}
