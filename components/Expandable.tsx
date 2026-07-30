"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { PortableText, type PortableTextBlock } from "@portabletext/react";
import Button from "./Button";

type SanityBlock = { _type: string; _key: string; [key: string]: unknown };

const NormalBlock = ({ children }: { children?: ReactNode }) => (
	<p className="mt-3 first:mt-0">{children}</p>
);

const BulletList = ({ children }: { children?: ReactNode }) => (
	<ul className="mt-3 list-disc pl-5 space-y-1 first:mt-0">{children}</ul>
);

const NumberList = ({ children }: { children?: ReactNode }) => (
	<ol className="mt-3 list-decimal pl-5 space-y-1 first:mt-0">{children}</ol>
);

const portableTextComponents = {
	block: { normal: NormalBlock },
	list: { bullet: BulletList, number: NumberList },
};

interface ExpandableProps {
	label: string;
	content: string | SanityBlock[];
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
				<div className="pb-4 text-sm leading-relaxed text-foreground/80">
					{typeof content === "string" ? (
						<p>{content}</p>
					) : (
						<PortableText
							value={content as unknown as PortableTextBlock[]}
              components={portableTextComponents}
						/>
					)}
				</div>
			)}
		</div>
	);
}
