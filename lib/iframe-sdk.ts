"use client";

// Whop iframe SDK for in-app purchases
// This communicates with the parent Whop window

interface InAppPurchaseParams {
	planId: string;
	id: string; // checkout configuration id
}

interface InAppPurchaseResponse {
	status: "ok" | "error";
	data?: {
		receipt_id: string;
	};
	error?: string;
}

class IframeSdk {
	private isInIframe(): boolean {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}

	async inAppPurchase(params: InAppPurchaseParams): Promise<InAppPurchaseResponse> {
		if (!this.isInIframe()) {
			console.warn("Not in iframe, cannot trigger in-app purchase");
			return { status: "error", error: "Not in Whop iframe" };
		}

		return new Promise((resolve) => {
			const messageId = `purchase_${Date.now()}`;
			
			const handleMessage = (event: MessageEvent) => {
				if (event.data?.type === "whop_purchase_response" && event.data?.id === messageId) {
					window.removeEventListener("message", handleMessage);
					resolve(event.data.response);
				}
			};
			
			window.addEventListener("message", handleMessage);
			
			// Send purchase request to parent Whop window
			window.parent.postMessage({
				type: "whop_in_app_purchase",
				id: messageId,
				planId: params.planId,
				checkoutConfigId: params.id,
			}, "*");
			
			// Timeout after 60 seconds
			setTimeout(() => {
				window.removeEventListener("message", handleMessage);
				resolve({ status: "error", error: "Purchase timeout" });
			}, 60000);
		});
	}
}

export const iframeSdk = new IframeSdk();
