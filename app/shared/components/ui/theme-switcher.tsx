"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted && resolvedTheme === "dark";

	if (!mounted) {
		return (
			<Button variant="ghost" className="px-3" disabled aria-label="Carregando tema">
				<Sun className="size-4" />
			</Button>
		);
	}

	return (
		<Button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			variant="ghost"
			className="px-3"
			aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
		>
			{isDark ? (
				<Sun className="size-4" />
			) : (
				<Moon className="size-4" />
			)}
		</Button>
	);
}
