"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}
	interface Navigator {
		standalone?: boolean;
	}
}

const DISMISSED_KEY = "comynity:pwa-install-dismissed";

export function InstallPrompt() {
	const [installEvent, setInstallEvent] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const standalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			navigator.standalone === true;
		if (standalone || window.sessionStorage.getItem(DISMISSED_KEY)) return;

		const handleInstallPrompt = (event: BeforeInstallPromptEvent) => {
			event.preventDefault();
			setInstallEvent(event);
			setVisible(true);
		};
		const hidePrompt = () => setVisible(false);

		window.addEventListener("beforeinstallprompt", handleInstallPrompt);
		window.addEventListener("appinstalled", hidePrompt);
		return () => {
			window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
			window.removeEventListener("appinstalled", hidePrompt);
		};
	}, []);

	const dismiss = () => {
		window.sessionStorage.setItem(DISMISSED_KEY, "true");
		setVisible(false);
	};

	const install = async () => {
		if (!installEvent) return;
		await installEvent.prompt();
		await installEvent.userChoice;
		setInstallEvent(null);
		setVisible(false);
	};

	if (!visible || !installEvent) return null;

	return (
		<aside
			className="flex min-h-14 w-full items-center gap-2 bg-brand px-3 py-2 text-white shadow-sm  "
			aria-label="Install Comynity"
		>
			<button
				type="button"
				onClick={dismiss}
				aria-label="Dismiss install prompt"
				className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white"
			>
				<i className="fa-regular fa-xmark text-lg" aria-hidden="true" />
			</button>
			<Image
				src="/app-icons/icon-128X128.png"
				alt=""
				width={40}
				height={40}
				className="size-10 shrink-0 "
			/>
			<p className="min-w-0 flex-1 text-sm font-bold ">
				Install the app for a better experience
			</p>
			<button
				type="button"
				onClick={() => void install()}
				className="shrink-0 rounded-xl bg-black px-5 py-3 text-[15px] font-extrabold text-white transition-colors hover:bg-gray-900  "
			>
				Use app
			</button>
		</aside>
	);
}
