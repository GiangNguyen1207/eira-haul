"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

interface ExpandableProps {
	label: string;
	content: string;
}

export default function Expandable({ label, content }: ExpandableProps) {
	const [open, setOpen] = useState(false);

	const toggleOpen = () => setOpen((prevOpen) => !prevOpen);

	return (
		<div className="border-t border-border">
			<Button
				label=""
				variant="ghost"
				onClick={toggleOpen}
				className="flex w-full items-center justify-between px-0 py-4 text-left text-sm font-medium text-foreground focus:ring-0 hover:text-foreground focus:text-foreground"
			>
				{label}
				<ChevronDownIcon
					className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				/>
			</Button>
			{open && (
				<p className="pb-4 text-sm leading-relaxed text-foreground/80">
					{content}
				</p>
			)}
		</div>
	);
}
