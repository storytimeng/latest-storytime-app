"use client";

import { ReactNode } from "react";
import { cn } from "./utils";
import { HeroUIProvider } from "@heroui/react";

export function MaxWidthWrapper({ className, children }: { className?: string; children: ReactNode }) {
	return (
		<main className={cn("w-full min-h-screen max-w-md mx-auto bg-[#FFFAF1]", className)}>
			<HeroUIProvider>{children}</HeroUIProvider>
		</main>
	);
}
