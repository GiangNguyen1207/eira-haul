type Step = {
	jp: string;
	title: string;
	body: string;
};

type Props = {
	steps: Step[];
};

export default function ProcessSteps({ steps }: Readonly<Props>) {
	return (
		<ol className="relative space-y-10 border-l border-border pl-8">
			{steps.map((step, i) => (
				<li key={step.title} className="relative">
					<span className="absolute -left-13.25 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card font-display text-sm text-primary">
						{String(i + 1).padStart(2, "0")}
					</span>
					<div className="rounded-xl border border-border bg-card p-6">
						<p className="font-display text-xs uppercase tracking-[0.2em] text-primary">
							Step {i + 1} · {step.jp}
						</p>
						<h2 className="mt-2 font-display text-2xl text-foreground">
							{step.title}
						</h2>
						<p className="mt-3 text-muted-foreground">{step.body}</p>
					</div>
				</li>
			))}
		</ol>
	);
}
