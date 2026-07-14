"use client";

import {
	CheckCircleIcon,
	XCircleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
	return (
		<Sonner
			position="top-right"
			icons={{
				success: <CheckCircleIcon className="size-4 text-primary" />,
				error: <XCircleIcon className="size-4 text-destructive" />,
				info: (
					<InformationCircleIcon className="size-4 text-muted-foreground" />
				),
			}}
			toastOptions={{
				classNames: {
					toast:
						"!rounded-xl !border !border-border !bg-card !text-foreground !shadow-md !text-sm",
					description: "!text-muted-foreground",
					success: "!border-primary/30",
					error: "!border-destructive/30",
				},
			}}
		/>
	);
}
