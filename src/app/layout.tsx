import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-dm-sans",
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	weight: ["400", "500"],
	display: "swap",
});

const generalSans = localFont({
	src: [
		{ path: "./fonts/general-sans/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
		{ path: "./fonts/general-sans/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
		{ path: "./fonts/general-sans/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
		{ path: "./fonts/general-sans/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
	],
	variable: "--font-general-sans",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Gestor de Créditos",
	description: "Sistema de gestión de créditos y pagos",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body
				className={`${generalSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
				suppressHydrationWarning
			>
				<AuthProvider>{children}</AuthProvider>
				<Toaster />
			</body>
		</html>
	);
}
