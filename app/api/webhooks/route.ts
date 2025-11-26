import type {
	PaymentSucceededWebhookEvent,
	MembershipActivatedWebhookEvent,
	MembershipDeactivatedWebhookEvent,
	EntryApprovedWebhookEvent,
} from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

export async function POST(request: NextRequest): Promise<Response> {
	try {
	// Validate the webhook to ensure it's from Whop
	const requestBodyText = await request.text();
	const headers = Object.fromEntries(request.headers);
		
		let webhookData;
		try {
			webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });
		} catch (error) {
			console.error("[WEBHOOK] Validation failed:", error);
			return new Response("Invalid webhook signature", { status: 401 });
		}

		// Handle different webhook event types (don't await, process in background)
		switch (webhookData.type) {
			case "payment.succeeded":
				handlePaymentSucceeded(webhookData as PaymentSucceededWebhookEvent)
					.catch(err => console.error("[WEBHOOK] Payment handler error:", err));
				break;
			case "membership.activated":
				handleMembershipActivated(webhookData as MembershipActivatedWebhookEvent)
					.catch(err => console.error("[WEBHOOK] Membership activated handler error:", err));
				break;
			case "membership.deactivated":
				handleMembershipDeactivated(webhookData as MembershipDeactivatedWebhookEvent)
					.catch(err => console.error("[WEBHOOK] Membership deactivated handler error:", err));
				break;
			case "entry.approved":
				handleEntryApproved(webhookData as EntryApprovedWebhookEvent)
					.catch(err => console.error("[WEBHOOK] Entry approved handler error:", err));
				break;
			default:
				console.log(`[WEBHOOK] Unhandled event type: ${webhookData.type}`);
	}

	// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
	return new Response("OK", { status: 200 });
	} catch (error) {
		console.error("[WEBHOOK] Unexpected error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}

async function handlePaymentSucceeded(
	event: PaymentSucceededWebhookEvent,
): Promise<void> {
	// Handle successful payment
	// In a real scenario, you might need to:
	// - Update user access in your database
	// - Send confirmation emails
	// - Trigger other business logic
	console.log("[PAYMENT SUCCEEDED]", {
		paymentId: event.data.id,
		userId: (event.data as unknown as { user_id?: string }).user_id || "unknown",
		amount: event.data.total,
		currency: event.data.currency,
	});
}

async function handleMembershipActivated(
	event: MembershipActivatedWebhookEvent,
): Promise<void> {
	// Handle membership activation
	// This grants access to the user
	const data = event.data as unknown as { 
		id: string; 
		user_id?: string; 
		company?: { id?: string }; 
		access_pass_id?: string;
	};
	console.log("[MEMBERSHIP ACTIVATED]", {
		membershipId: data.id,
		userId: data.user_id || "unknown",
		companyId: data.company?.id || "unknown",
		accessPassId: data.access_pass_id || "unknown",
	});

	// In a real scenario, you would:
	// - Update user access in your database
	// - Grant access to streaming rooms
	// - Send welcome notifications
}

async function handleMembershipDeactivated(
	event: MembershipDeactivatedWebhookEvent,
): Promise<void> {
	// Handle membership deactivation
	// This revokes access from the user
	const data = event.data as unknown as { 
		id: string; 
		user_id?: string; 
		company?: { id?: string };
	};
	console.log("[MEMBERSHIP DEACTIVATED]", {
		membershipId: data.id,
		userId: data.user_id || "unknown",
		companyId: data.company?.id || "unknown",
	});

	// In a real scenario, you would:
	// - Revoke user access in your database
	// - Remove access to streaming rooms
	// - Send notification about access removal
}

async function handleEntryApproved(
	event: EntryApprovedWebhookEvent,
): Promise<void> {
	// Handle entry approval (if using access passes)
	const data = event.data as unknown as { 
		id: string; 
		user_id?: string; 
		company_id?: string;
	};
	console.log("[ENTRY APPROVED]", {
		entryId: data.id,
		userId: data.user_id || "unknown",
		companyId: data.company_id || "unknown",
	});

	// Grant access when entry is approved
}
