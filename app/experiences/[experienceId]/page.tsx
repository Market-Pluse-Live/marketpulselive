import { whopsdk } from "@/lib/whop-sdk";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your test experience IDs (these see FREE tier for testing)
// Add your own experienceIds here if you want them to show FREE tier
const FREE_EXPERIENCE_IDS: string[] = ["exp_8HCBvNKMU6MHbF"];

// Your app developer company ID (for admin access)
const APP_DEVELOPER_COMPANY = "biz_VlcyoPPLQClcwJ";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	// SIMPLE PRO LOGIC:
	// - Your test experience (exp_8HCBvNKMU6MHbF) = FREE tier
	// - ALL other experiences = PRO tier (they paid to install your app!)
	const isFreeExperience = FREE_EXPERIENCE_IDS.includes(experienceId);
	const isPro = !isFreeExperience;
	
	// Check if this is your company for admin access
	let isAllowedCompany = false;
	try {
		const experience = await whopsdk.experiences.retrieve(experienceId);
		isAllowedCompany = experience.company?.id === APP_DEVELOPER_COMPANY;
	} catch {
		// If error, still allow the page to render
	}

	return (
		<RoleGate>
			<ViewerDashboard 
				companyId="dev-company" 
				isAllowedCompany={isAllowedCompany} 
				isPro={isPro} 
			/>
		</RoleGate>
	);
}
