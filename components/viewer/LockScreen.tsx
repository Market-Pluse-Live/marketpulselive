import Link from "next/link";
import { Lock, Home } from "lucide-react";
import { Button } from "@whop/react/components";

export function LockScreen() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
			<div className="text-center space-y-6 max-w-md">
				<div className="flex justify-center">
					<div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
						<Lock className="h-8 w-8 text-gray-400 dark:text-gray-600" />
					</div>
				</div>
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Content Locked
					</h1>
					<p className="text-gray-500 dark:text-gray-400">
						This livestream is exclusive to members with access.
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
					<Button
						onClick={() => window.location.reload()}
						variant="solid"
					>
						Check Access Again
					</Button>
					<Link href="/">
						<Button variant="ghost">
							<Home className="h-4 w-4 mr-1" />
							Go Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
