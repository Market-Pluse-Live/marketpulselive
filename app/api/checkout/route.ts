import { NextResponse } from "next/server";

// Your PRO plan ID from Whop
const PRO_PLAN_ID = "prod_wQqWrjERBaVub";

export async function POST() {
	// Direct checkout URL using the plan ID
	// Format: https://whop.com/checkout/{planId}
	const purchaseUrl = `https://whop.com/checkout/${PRO_PLAN_ID}`;

	return NextResponse.json({
		planId: PRO_PLAN_ID,
		purchaseUrl: purchaseUrl,
	});
}
