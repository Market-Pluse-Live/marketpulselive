"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { UserProvider } from "@/lib/user-context";
import { NotificationProvider } from "@/lib/notification-context";
import { RoleProvider } from "@/lib/role-context";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<RoleProvider>
				<AuthProvider>
					<UserProvider>
						<NotificationProvider>
							{children}
						</NotificationProvider>
					</UserProvider>
				</AuthProvider>
			</RoleProvider>
		</ThemeProvider>
	);
}

