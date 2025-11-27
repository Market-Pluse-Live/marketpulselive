import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;

	// Room initialization is now handled client-side in DashboardClient
	// This prevents server/client hydration mismatches
	return <DashboardClient companyId={companyId} />;
}
