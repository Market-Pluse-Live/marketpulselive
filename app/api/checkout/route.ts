import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

// Your PRO plan ID from Whop
const PRO_PLAN_ID = "prod_wQqWrjERBaVub";

export async function POST(request: NextRequest) {
	try {
		// Create a checkout configuration for the PRO plan
		const checkoutConfig = await whopsdk.checkoutConfigurations.create({
			companyId: "biz_VlcyoPPLQClcwJ",
			planId: PRO_PLAN_ID,
		});

		return NextResponse.json({
			id: checkoutConfig.id,
			planId: PRO_PLAN_ID,
			purchaseUrl: checkoutConfig.purchaseUrl,
		});
	} catch (error) {
		console.error("Error creating checkout configuration:", error);
		return NextResponse.json(
			{ error: "Failed to create checkout" },
			{ status: 500 }
		);
	}
}
