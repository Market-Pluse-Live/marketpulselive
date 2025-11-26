import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { initializeRoomsForCompany } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";

// Set to true for local development testing without Whop auth
const DEV_MODE = process.env.NODE_ENV === "development";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;

	// In dev mode, skip Whop auth entirely
	if (!DEV_MODE) {
		try {
			// Ensure the user is logged in on whop.
			const { userId } = await whopsdk.verifyUserToken(await headers());

			// Fetch the necessary data we want from whop.
			await Promise.all([
				whopsdk.companies.retrieve(companyId),
				whopsdk.users.retrieve(userId),
				whopsdk.users.checkAccess(companyId, { id: userId }),
			]);
		} catch (error) {
			console.error("Auth error:", error);
			throw error;
		}
	}

	// Auto-initialize 8 rooms if they don't exist
	await initializeRoomsForCompany(companyId);

	return <DashboardClient companyId={companyId} />;
}
