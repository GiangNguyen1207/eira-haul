"use client";

import { useState, useTransition } from "react";
import { PlusIcon, SparklesIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency, formatPct, formatSigned } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";
import Button from "@/components/Button";
import { saveMarketplacePlan, type MarketplaceItem, type MarketplacePlanValues } from "./actions";


let _nextKey = 1;
function newKey() { return `new_${_nextKey++}`; }

function NumInput({
	value,
	onChange,
	step = 0.5,
	min = 0,
	className = "w-20",
}: {
	value: number;
	onChange: (v: number) => void;
	step?: number;
	min?: number;
	className?: string;
}) {
	return (
		<input
			type="number"
			value={value}
			min={min}
			step={step}
			onChange={(e) => onChange(Number(e.target.value) || 0)}
			className={`${className} rounded border border-border bg-background px-2 py-1 text-right text-sm tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-primary`}
		/>
	);
}

type ItemRow = MarketplaceItem & { _key: string };

function itemToRow(item: MarketplaceItem): ItemRow {
	return { ...item, _key: item.id };
}

function blankRow(): ItemRow {
	return { _key: newKey(), id: "", name: "", singlePrice: 0, pairTotal: 0, cogsPerUnit: 0, worstCupsPerDay: 0, normalCupsPerDay: 0, bestCupsPerDay: 0, sortOrder: 0 };
}

export default function MarketplacePlan({ initial }: { initial: MarketplacePlanValues }) {
	// All hooks must be declared before any early return
	const [planName,        setPlanName]        = useState(initial.name);
	const [days,            setDays]            = useState(initial.days);
	const [worstPairPct,    setWorstPairPct]    = useState(initial.worstPairPct);
	const [normalPairPct,   setNormalPairPct]   = useState(initial.normalPairPct);
	const [bestPairPct,     setBestPairPct]     = useState(initial.bestPairPct);
	const [kioskCost,       setKioskCost]       = useState(initial.kioskCost);
	const [electricityCost, setElectricityCost] = useState(initial.electricityCost);
	const [equipmentCost,   setEquipmentCost]   = useState(initial.equipmentCost);
	const [otherCost,       setOtherCost]       = useState(initial.otherCost);
	const [items,           setItems]           = useState<ItemRow[]>(initial.items.map(itemToRow));
	const [suggestKey,      setSuggestKey]      = useState<string | null>(null);
	const [suggestValue,    setSuggestValue]    = useState(0);

	const [saveStatus, setSaveStatus]   = useState<"idle" | "saved" | "error">("idle");
	const [errorMsg,   setErrorMsg]     = useState("");
	const [isPending,  startTransition] = useTransition();

	// Name gate — show setup screen until the user picks an event name
	const [draftName, setDraftName] = useState("");
	if (!planName.trim()) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="w-full max-w-sm space-y-6">
					<div>
						<h1 className="font-serif text-2xl font-semibold text-foreground">Marketplace Plan</h1>
						<p className="mt-1 text-sm text-muted-foreground">What&apos;s this event called?</p>
					</div>
					<input
						type="text"
						value={draftName}
						onChange={(e) => setDraftName(e.target.value)}
						onKeyDown={(e) => { if (e.key === "Enter" && draftName.trim()) setPlanName(draftName.trim()); }}
						placeholder="e.g. Christmas Market"
						autoFocus
						className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<Button
						label="Start planning"
						variant={draftName.trim() ? "primary" : "disabled"}
						disabled={!draftName.trim()}
						onClick={() => { if (draftName.trim()) setPlanName(draftName.trim()); }}
						className="w-full text-sm"
					/>
				</div>
			</div>
		);
	}

	const fixedCosts = kioskCost + electricityCost + equipmentCost + otherCost;

	const scenariosDef = [
		{ name: "Worst",  kind: "worst" as const, pairPct: worstPairPct  / 100 },
		{ name: "Normal", kind: "base"  as const, pairPct: normalPairPct / 100 },
		{ name: "Best",   kind: "best"  as const, pairPct: bestPairPct   / 100 },
	];

	function updateItem(key: string, patch: Partial<ItemRow>) {
		setItems((prev) => prev.map((r) => r._key === key ? { ...r, ...patch } : r));
	}

	function removeItem(key: string) {
		setItems((prev) => prev.filter((r) => r._key !== key));
	}

	function addItem() {
		setItems((prev) => [...prev, blankRow()]);
	}

	function run(s: (typeof scenariosDef)[number]) {
		const perItem = items.map((item) => {
			const cupsPerDay = s.kind === "worst" ? item.worstCupsPerDay
				: s.kind === "best" ? item.bestCupsPerDay
				: item.normalCupsPerDay;
			const cups     = cupsPerDay * days;
			const avgPrice = s.pairPct * (item.pairTotal / 2) + (1 - s.pairPct) * item.singlePrice;
			const revenue  = cups * avgPrice;
			const cogs     = cups * item.cogsPerUnit;
			return { name: item.name || "—", cupsPerDay, cups, revenue, cogs };
		});

		const totalCups = perItem.reduce((acc, r) => acc + r.cups, 0);
		const revenue   = perItem.reduce((acc, r) => acc + r.revenue, 0);
		const cogs      = perItem.reduce((acc, r) => acc + r.cogs, 0);
		const gross     = revenue - cogs;
		const margin    = revenue > 0 ? (gross / revenue) * 100 : 0;
		const net       = gross - fixedCosts;

		return { ...s, totalCups, perItem, revenue, cogs, gross, margin, net };
	}

	const scenarios = scenariosDef.map(run);

	// Break-even — using normal-scenario volumes and prices
	const normalPairFrac  = normalPairPct / 100;
	const normalTotalCups = items.reduce((acc, i) => acc + i.normalCupsPerDay * days, 0);
	const totalContrib    = items.reduce((acc, item) => {
		const avgPrice = normalPairFrac * (item.pairTotal / 2) + (1 - normalPairFrac) * item.singlePrice;
		return acc + item.normalCupsPerDay * days * (avgPrice - item.cogsPerUnit);
	}, 0);
	const contribPerCup = normalTotalCups > 0 ? totalContrib / normalTotalCups : 0;
	const beTotal  = contribPerCup > 0 ? Math.ceil(fixedCosts / contribPerCup) : null;
	const bePerDay = beTotal ? Math.ceil(beTotal / days) : null;

	type Tone = "default" | "positive" | "negative" | "warning";
	function tone(net: number): Tone {
		if (net > 20) return "positive";
		if (net >= 0) return "warning";
		return "negative";
	}

	function openSuggest(key: string, currentNormal: number) {
		setSuggestKey(key);
		setSuggestValue(currentNormal > 0 ? currentNormal : 20);
	}

	function applySuggestion() {
		if (!suggestKey) return;
		updateItem(suggestKey, {
			normalCupsPerDay: Math.round(suggestValue),
			worstCupsPerDay:  Math.round(suggestValue * 0.5),
			bestCupsPerDay:   Math.round(suggestValue * 1.5),
		});
		setSuggestKey(null);
	}

	function handleSave() {
		startTransition(async () => {
			const result = await saveMarketplacePlan({
				name: planName,
				days, worstPairPct, normalPairPct, bestPairPct,
				kioskCost, electricityCost, equipmentCost, otherCost,
				items: items.map((r, i) => ({ ...r, sortOrder: i })),
			});
			if (result.error) {
				setSaveStatus("error");
				setErrorMsg(result.error);
			} else {
				setSaveStatus("saved");
				setTimeout(() => setSaveStatus("idle"), 2500);
			}
		});
	}

	return (
		<section className="space-y-8">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-baseline gap-2">
						<h1 className="font-serif text-2xl font-semibold text-foreground">
							Marketplace Plan
						</h1>
						<span className="text-muted-foreground">·</span>
						<input
							type="text"
							value={planName}
							onChange={(e) => setPlanName(e.target.value)}
							placeholder="Event name"
							className="font-serif text-2xl font-semibold text-primary bg-transparent border-b border-dashed border-primary/40 focus:border-primary focus:outline-none min-w-0 w-52"
						/>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						{days}-day event · Adjust inputs to update the plan live.
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-3 pt-1">
					{saveStatus === "saved" && <span className="text-sm text-emerald-600">Saved</span>}
					{saveStatus === "error"  && <span className="text-sm text-red-600">{errorMsg}</span>}
					<Button
						label={isPending ? "Saving…" : "Save"}
						variant={isPending ? "disabled" : "primary"}
						disabled={isPending}
						onClick={handleSave}
						className="text-sm"
					/>
				</div>
			</div>

			{/* ── Event settings ───────────────────────────────────────────────── */}
			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Event settings
				</p>
				<div className="grid gap-6 sm:grid-cols-2">
					<div>
						<p className="mb-1.5 text-sm text-muted-foreground">Number of days</p>
						<NumInput value={days} onChange={(v) => setDays(Math.max(1, Math.round(v)))} step={1} min={1} className="w-24" />
					</div>
					<div>
						<p className="mb-1.5 text-sm text-muted-foreground">
							Pair-deal rate — % of cups sold as a bundle (2 for the price of...)
						</p>
						<div className="flex items-center gap-4">
							{(
								[
									["Worst",  worstPairPct,  setWorstPairPct],
									["Normal", normalPairPct, setNormalPairPct],
									["Best",   bestPairPct,   setBestPairPct],
								] as [string, number, (v: number) => void][]
							).map(([label, val, setter]) => (
								<div key={label} className="flex flex-col items-center gap-1">
									<span className="text-xs text-muted-foreground">{label}</span>
									<div className="flex items-center gap-1">
										<NumInput value={val} onChange={setter} step={5} min={0} className="w-16" />
										<span className="text-sm text-muted-foreground">%</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* ── Items ────────────────────────────────────────────────────────── */}
			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Items to sell
				</p>

				<div className="overflow-x-auto pl-0.5">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border/50 text-left">
								<th className="pb-2 font-medium text-muted-foreground">Name</th>
								<th className="pb-2 text-right font-medium text-muted-foreground">Single (€)</th>
								<th className="pb-2 text-right font-medium text-muted-foreground">For 2 (€)</th>
								<th className="pb-2 text-right font-medium text-muted-foreground">Cost/unit (€)</th>
								<th className="pb-2 text-right font-medium text-muted-foreground">Worst/day</th>
								<th className="pb-2 text-right font-medium text-muted-foreground">Normal/day</th>
								<th className="pb-2 text-right font-medium text-muted-foreground">Best/day</th>
								<th className="pb-2" />
							</tr>
						</thead>
						<tbody>
							{items.map((item) => (
								<>
									<tr key={item._key} className="border-b border-border/50">
										<td className="py-2 pr-3">
											<input
												type="text"
												value={item.name}
												onChange={(e) => updateItem(item._key, { name: e.target.value })}
												placeholder="Item name"
												className="w-28 rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
											/>
										</td>
										<td className="py-2 pr-2 text-right">
											<NumInput value={item.singlePrice} onChange={(v) => updateItem(item._key, { singlePrice: v })} step={0.5} />
										</td>
										<td className="py-2 pr-2 text-right">
											<NumInput value={item.pairTotal} onChange={(v) => updateItem(item._key, { pairTotal: v })} step={0.5} />
										</td>
										<td className="py-2 pr-2 text-right">
											<NumInput value={item.cogsPerUnit} onChange={(v) => updateItem(item._key, { cogsPerUnit: v })} step={0.05} />
										</td>
										<td className="py-2 pr-2 text-right">
											<NumInput value={item.worstCupsPerDay} onChange={(v) => updateItem(item._key, { worstCupsPerDay: Math.round(v) })} step={1} className="w-16" />
										</td>
										<td className="py-2 pr-2 text-right">
											<NumInput value={item.normalCupsPerDay} onChange={(v) => updateItem(item._key, { normalCupsPerDay: Math.round(v) })} step={1} className="w-16" />
										</td>
										<td className="py-2 pr-2 text-right">
											<NumInput value={item.bestCupsPerDay} onChange={(v) => updateItem(item._key, { bestCupsPerDay: Math.round(v) })} step={1} className="w-16" />
										</td>
										<td className="py-2 pl-1">
											<div className="flex items-center gap-1">
												<button
													type="button"
													onClick={() => suggestKey === item._key ? setSuggestKey(null) : openSuggest(item._key, item.normalCupsPerDay)}
													className={`rounded p-1 transition-colors ${suggestKey === item._key ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
													aria-label="Suggest volumes"
												>
													<SparklesIcon className="h-4 w-4" />
												</button>
												<button
													type="button"
													onClick={() => removeItem(item._key)}
													className="rounded p-1 text-muted-foreground hover:text-red-600"
													aria-label="Remove item"
												>
													<TrashIcon className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>

									{suggestKey === item._key && (
										<tr key={`${item._key}-suggest`} className="border-b border-border/50 bg-primary/5">
											<td colSpan={8} className="px-4 py-3">
												<div className="flex flex-wrap items-center gap-3">
													<span className="text-sm text-muted-foreground">
														How many <strong className="text-foreground">{item.name || "this item"}</strong> do you realistically expect to sell per day?
													</span>
													<input
														type="number"
														value={suggestValue}
														min={1}
														step={1}
														autoFocus
														onChange={(e) => setSuggestValue(Number(e.target.value) || 0)}
														onKeyDown={(e) => {
															if (e.key === "Enter") applySuggestion();
															if (e.key === "Escape") setSuggestKey(null);
														}}
														className="w-20 rounded border border-border bg-background px-2 py-1 text-right text-sm tabular-nums text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
													/>
													{suggestValue > 0 && (
														<span className="text-xs text-muted-foreground">
															→ Worst: <strong>{Math.round(suggestValue * 0.5)}</strong> · Normal: <strong>{Math.round(suggestValue)}</strong> · Best: <strong>{Math.round(suggestValue * 1.5)}</strong>
														</span>
													)}
													<div className="flex gap-2">
														<button
															type="button"
															onClick={applySuggestion}
															className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
														>
															Apply
														</button>
														<button
															type="button"
															onClick={() => setSuggestKey(null)}
															className="rounded px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
														>
															Cancel
														</button>
													</div>
												</div>
											</td>
										</tr>
									)}
								</>
							))}
						</tbody>
					</table>
				</div>

				<button
					type="button"
					onClick={addItem}
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
				>
					<PlusIcon className="h-4 w-4" />
					Add item
				</button>

				<p className="text-xs text-muted-foreground">
					&ldquo;For 2&rdquo; is the bundle total price. Cups/day is how many you expect to sell each day for that scenario.
				</p>
			</div>

			{/* ── Fixed costs ──────────────────────────────────────────────────── */}
			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Fixed costs (€)
				</p>
				<div className="grid gap-4 sm:grid-cols-4">
					{(
						[
							["Kiosk",       kioskCost,       setKioskCost,       5],
							["Electricity", electricityCost, setElectricityCost, 1],
							["Equipment",   equipmentCost,   setEquipmentCost,   1],
							["Other",       otherCost,       setOtherCost,       1],
						] as [string, number, (v: number) => void, number][]
					).map(([label, val, setter, step]) => (
						<div key={label}>
							<p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
							<NumInput value={val} onChange={setter} step={step} className="w-full" />
						</div>
					))}
				</div>
				<p className="text-sm font-semibold text-foreground">
					Total: {formatCurrency(fixedCosts)}
				</p>
			</div>

			{/* ── Results ──────────────────────────────────────────────────────── */}
			<div className="grid gap-4 sm:grid-cols-3">
				{scenarios.map((s) => (
					<KpiCard
						key={s.kind}
						label={s.name}
						value={formatSigned(s.net)}
						hint={`${s.totalCups} cups · ${formatCurrency(s.revenue)} revenue`}
						tone={tone(s.net)}
					/>
				))}
			</div>

			{/* Scenario comparison table */}
			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<table className="w-full min-w-[560px] text-sm">
					<thead>
						<tr className="border-b border-border bg-secondary/50 text-left">
							<th className="px-5 py-3 font-medium text-muted-foreground">Item</th>
							{scenarios.map((s) => (
								<th key={s.kind} className="px-5 py-3 text-right font-semibold text-foreground">{s.name}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{/* Volume */}
						<tr className="border-b border-border/40 bg-secondary/20">
							<td colSpan={4} className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Volume</td>
						</tr>
						<tr className="border-b border-border/50 font-medium">
							<td className="px-5 py-2.5 text-foreground">Total cups per day</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-foreground">
									{s.perItem.reduce((acc, r) => acc + r.cupsPerDay, 0)}
								</td>
							))}
						</tr>
						<tr className="border-b border-border/50 font-medium">
							<td className="px-5 py-2.5 text-foreground">Total cups (2 days)</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-foreground">{s.totalCups}</td>
							))}
						</tr>
						{items.map((item) => (
							<tr key={item._key} className="border-b border-border/50">
								<td className="px-5 py-2 pl-9 text-muted-foreground">{item.name || "—"}</td>
								{scenarios.map((s) => {
									const r = s.perItem.find((p) => p.name === (item.name || "—"));
									return (
										<td key={s.kind} className="px-5 py-2 text-right tabular-nums text-muted-foreground">
											{r ? r.cupsPerDay : 0}/day
										</td>
									);
								})}
							</tr>
						))}

						{/* Revenue */}
						<tr className="border-b border-border/40 bg-secondary/20">
							<td colSpan={4} className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Revenue</td>
						</tr>
						{items.map((item) => (
							<tr key={item._key} className="border-b border-border/50">
								<td className="px-5 py-2 pl-9 text-muted-foreground">{item.name || "—"}</td>
								{scenarios.map((s) => {
									const r = s.perItem.find((p) => p.name === (item.name || "—"));
									return (
										<td key={s.kind} className="px-5 py-2 text-right tabular-nums text-muted-foreground">
											{formatCurrency(r?.revenue ?? 0)}
										</td>
									);
								})}
							</tr>
						))}
						<tr className="border-b border-border/50 font-semibold">
							<td className="px-5 py-2.5 text-foreground">Total revenue</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-foreground">{formatCurrency(s.revenue)}</td>
							))}
						</tr>

						{/* Costs */}
						<tr className="border-b border-border/40 bg-secondary/20">
							<td colSpan={4} className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Costs</td>
						</tr>
						<tr className="border-b border-border/50">
							<td className="px-5 py-2.5 text-muted-foreground">Ingredient cost (COGS)</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{formatCurrency(s.cogs)}</td>
							))}
						</tr>
						<tr className="border-b border-border/50 font-semibold">
							<td className="px-5 py-2.5 text-foreground">Gross profit</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-foreground">{formatCurrency(s.gross)}</td>
							))}
						</tr>
						<tr className="border-b border-border/50">
							<td className="px-5 py-2.5 text-muted-foreground">Gross margin</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{formatPct(s.margin)}</td>
							))}
						</tr>
						<tr className="border-b border-border/50">
							<td className="px-5 py-2.5 text-muted-foreground">Fixed costs</td>
							{scenarios.map((s) => (
								<td key={s.kind} className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">{formatCurrency(fixedCosts)}</td>
							))}
						</tr>

						<tr className="border-t-2 border-border">
							<td className="px-5 py-3 font-bold text-foreground">Net profit / loss</td>
							{scenarios.map((s) => (
								<td
									key={s.kind}
									className={`px-5 py-3 text-right tabular-nums font-bold ${s.net > 0 ? "text-emerald-700" : "text-red-700"}`}
								>
									{formatSigned(s.net)}
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>

			{/* Break-even */}
			{beTotal !== null ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
					<p className="text-sm font-semibold text-amber-900">Break-even point</p>
					<p className="mt-1 text-sm text-amber-800">
						At the normal-scenario mix and prices you need roughly{" "}
						<strong>{beTotal} cups in total</strong> — about <strong>{bePerDay}/day</strong> — to cover the{" "}
						{formatCurrency(fixedCosts)} in fixed costs.
					</p>
				</div>
			) : (
				<div className="rounded-xl border border-red-200 bg-red-50 p-5">
					<p className="text-sm font-semibold text-red-900">Cannot break even</p>
					<p className="mt-1 text-sm text-red-800">
						Ingredient costs exceed selling prices or mix percentages are zero. Adjust your items to continue.
					</p>
				</div>
			)}

		</section>
	);
}
