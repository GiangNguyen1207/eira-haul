import {
	BUSINESS_ID,
	FOOTER_ADDRESS,
	FOOTER_EMAIL,
	FOOTER_PHONE,
	FOOTER_TEXT,
	FROM_JP,
	LOGO,
} from "@/constant";

export default function Footer() {
	return (
		<footer className="border-t border-border/60 bg-secondary/40">
			<div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
				<div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
					<div className="flex flex-col gap-1">
						<p className="font-serif text-base text-foreground">
							{LOGO} · {FROM_JP}
						</p>
						<p>{FOOTER_ADDRESS}</p>
						<p>{BUSINESS_ID}</p>
					</div>
					<div className="flex flex-col gap-1">
						<p>{FOOTER_EMAIL}</p>
						<p>{FOOTER_PHONE}</p>
					</div>
				</div>
				<p className="mt-6 border-t border-border/60 pt-4">
					© {new Date().getFullYear()} {LOGO}. {FOOTER_TEXT}
				</p>
			</div>
		</footer>
	);
}
