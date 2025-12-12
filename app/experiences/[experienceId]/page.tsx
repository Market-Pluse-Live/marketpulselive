import { whopsdk } from "@/lib/whop-sdk";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your allowed company ID
const ALLOWED_COMPANY_IDS = ["biz_VlcyoPPLQClcwJ"];

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	// Get company ID from experience using Whop SDK
	let isAllowedCompany = false;
	try {
		const experience = await whopsdk.experiences.retrieve(experienceId);
		const company = experience.company?.id;
		isAllowedCompany = company ? ALLOWED_COMPANY_IDS.includes(company) : false;
	} catch (error) {
		console.error("Error fetching experience:", error);
	}

	return (
		<RoleGate>
			<ViewerDashboard companyId={experienceId} isAllowedCompany={isAllowedCompany} />
		</RoleGate>
	);
}
