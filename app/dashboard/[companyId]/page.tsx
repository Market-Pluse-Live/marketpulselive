import { initializeRoomsForCompany } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;

	// Auto-initialize 8 rooms if they don't exist
	try {
		await initializeRoomsForCompany(companyId);
	} catch (error) {
		console.error("Error initializing rooms:", error);
		// Continue even if initialization fails - rooms will be empty
	}

	return <DashboardClient companyId={companyId} />;
}
