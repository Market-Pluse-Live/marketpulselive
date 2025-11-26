import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Market Pulse Live - Stream Manager",
	description: "Professional livestream management platform",
};

// Conditionally import WhopApp only if app ID is set
const hasWhopAppId = !!process.env.NEXT_PUBLIC_WHOP_APP_ID;

async function WhopWrapper({ children }: { children: React.ReactNode }) {
	if (hasWhopAppId) {
		const { WhopApp } = await import("@whop/react/components");
		return <WhopApp>{children}</WhopApp>;
	}
	return <>{children}</>;
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<WhopWrapper>
					<Providers>{children}</Providers>
				</WhopWrapper>
			</body>
		</html>
	);
}
