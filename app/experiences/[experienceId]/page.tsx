import { whopsdk } from "@/lib/whop-sdk";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your allowed company ID (for admin access)
const ALLOWED_COMPANY_IDS = ["biz_VlcyoPPLQClcwJ"];

// ⚠️ SET TO FALSE TO TEST FREE VERSION (locks on streams 2-8)
// ⚠️ SET TO TRUE TO TEST PRO VERSION (all streams unlocked)
const TEST_MODE_IS_PRO = false;

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	// Get company ID from experience
	let isAllowedCompany = false;
	
	try {
		const experience = await whopsdk.experiences.retrieve(experienceId);
		const company = experience.company?.id;
		isAllowedCompany = company ? ALLOWED_COMPANY_IDS.includes(company) : false;
	} catch (error) {
		console.error("Error fetching experience:", error);
	}

	// For now, use TEST_MODE to control PRO access
	// Later we'll enable real Whop membership detection
	const isPro = TEST_MODE_IS_PRO;

	return (
		<RoleGate>
			<ViewerDashboard companyId="dev-company" isAllowedCompany={isAllowedCompany} isPro={isPro} />
		</RoleGate>
	);
}
