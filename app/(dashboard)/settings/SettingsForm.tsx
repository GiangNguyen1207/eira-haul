"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import { savePlan, seedFromActuals } from "./actions";
import type { PlanFormValues } from "@/lib/plan";

const inputCls =
	"w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

export default function SettingsForm({
	defaultValues,
	hasPlan,
}: {
	defaultValues: PlanFormValues;
	hasPlan: boolean;
}) {
	const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<PlanFormValues>({ defaultValues });
	const [isSeeding, setIsSeeding] = useState(false);

	const handleSeed = async () => {
		setIsSeeding(true);
		try {
			const result = await seedFromActuals();
			if ("error" in result) {
				toast.error(result.error);
				return;
			}
			reset(result);
			toast.success("Pre-filled from actuals — review and save when ready.");
		} finally {
			setIsSeeding(false);
		}
	};

	const groups = useFieldArray({ control, name: "productGroups" });
	const injections = useFieldArray({ control, name: "capitalInjections" });

	const onSubmit = async (data: PlanFormValues) => {
		const result = await savePlan(data);
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Plan saved.");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
			{!hasPlan && (
				<div className="flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
					<div>
						<p className="text-sm font-medium text-foreground">No plan configured yet</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							Seed your assumptions from actual sales and inventory data to get started.
						</p>
					</div>
					<button
						type="button"
						onClick={handleSeed}
						disabled={isSeeding}
						className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
					>
						{isSeeding ? "Seeding…" : "Seed from actuals"}
					</button>
				</div>
			)}

			{/* Plan period */}
			<section className="rounded-xl border border-border bg-card p-5">
				<h2 className="mb-4 font-medium text-foreground">Plan period</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Start month">
						<input type="month" {...register("startMonth")} className={inputCls} />
					</Field>
					<Field label="End month">
						<input type="month" {...register("endMonth")} className={inputCls} />
					</Field>
				</div>
			</section>

			{/* Opening balances */}
			<section className="rounded-xl border border-border bg-card p-5">
				<h2 className="mb-4 font-medium text-foreground">Opening balances</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Starting cash (€)">
						<input type="number" step="0.01" {...register("startingCash", { valueAsNumber: true })} className={inputCls} />
					</Field>
					<Field label="Opening inventory value (€)">
						<input type="number" step="0.01" {...register("openingInventory", { valueAsNumber: true })} className={inputCls} />
					</Field>
				</div>
			</section>

			{/* Operating costs */}
			<section className="rounded-xl border border-border bg-card p-5">
				<h2 className="mb-4 font-medium text-foreground">Operating costs</h2>
				<div className="grid gap-4 sm:grid-cols-3">
					<Field label="Fixed costs / month (€)" hint="Rent, salaries, utilities">
						<input type="number" step="0.01" {...register("fixedOpexMonthly", { valueAsNumber: true })} className={inputCls} />
					</Field>
					<Field label="Variable costs (% of revenue)" hint="Scales with sales">
						<input type="number" step="0.1" {...register("variableOpexPct", { valueAsNumber: true })} className={inputCls} />
					</Field>
					<Field label="Inventory coverage (months)" hint="How many months of stock you hold">
						<input type="number" step="0.5" {...register("inventoryCoverageMonths", { valueAsNumber: true })} className={inputCls} />
					</Field>
				</div>
			</section>

			{/* Product groups */}
			<section className="rounded-xl border border-border bg-card">
				<div className="flex items-center justify-between border-b border-border px-5 py-3">
					<h2 className="font-medium text-foreground">Product groups</h2>
					<button
						type="button"
						onClick={() => groups.append({ name: "", baseMonthlyRevenue: 0, monthlyGrowthPct: 0, grossMarginPct: 0 })}
						className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
					>
						<PlusIcon className="h-4 w-4" /> Add group
					</button>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border/60 text-left text-muted-foreground">
							<th className="px-4 py-2 font-medium">Name</th>
							<th className="px-4 py-2 text-right font-medium">Base revenue / mo (€)</th>
							<th className="px-4 py-2 text-right font-medium">Growth / mo (%)</th>
							<th className="px-4 py-2 text-right font-medium">Gross margin (%)</th>
							<th className="px-4 py-2" />
						</tr>
					</thead>
					<tbody>
						{groups.fields.map((field, i) => (
							<tr key={field.id} className="border-b border-border/40 last:border-0">
								<td className="px-4 py-2">
									<input {...register(`productGroups.${i}.name`)} placeholder="e.g. Clothing" className={inputCls} />
								</td>
								<td className="px-4 py-2">
									<input type="number" step="0.01" {...register(`productGroups.${i}.baseMonthlyRevenue`, { valueAsNumber: true })} className={`${inputCls} text-right`} />
								</td>
								<td className="px-4 py-2">
									<input type="number" step="0.1" {...register(`productGroups.${i}.monthlyGrowthPct`, { valueAsNumber: true })} className={`${inputCls} text-right`} />
								</td>
								<td className="px-4 py-2">
									<input type="number" step="0.1" {...register(`productGroups.${i}.grossMarginPct`, { valueAsNumber: true })} className={`${inputCls} text-right`} />
								</td>
								<td className="px-4 py-2">
									<button type="button" onClick={() => groups.remove(i)} className="text-muted-foreground hover:text-destructive">
										<TrashIcon className="h-4 w-4" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>

			{/* Capital injections */}
			<section className="rounded-xl border border-border bg-card">
				<div className="flex items-center justify-between border-b border-border px-5 py-3">
					<h2 className="font-medium text-foreground">Capital injections</h2>
					<button
						type="button"
						onClick={() => injections.append({ month: "", amount: 0, source: "" })}
						className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
					>
						<PlusIcon className="h-4 w-4" /> Add injection
					</button>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border/60 text-left text-muted-foreground">
							<th className="px-4 py-2 font-medium">Month</th>
							<th className="px-4 py-2 text-right font-medium">Amount (€)</th>
							<th className="px-4 py-2 font-medium">Source</th>
							<th className="px-4 py-2" />
						</tr>
					</thead>
					<tbody>
						{injections.fields.length === 0 && (
							<tr>
								<td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
									No capital injections planned.
								</td>
							</tr>
						)}
						{injections.fields.map((field, i) => (
							<tr key={field.id} className="border-b border-border/40 last:border-0">
								<td className="px-4 py-2">
									<input type="month" {...register(`capitalInjections.${i}.month`)} className={inputCls} />
								</td>
								<td className="px-4 py-2">
									<input type="number" step="0.01" {...register(`capitalInjections.${i}.amount`, { valueAsNumber: true })} className={`${inputCls} text-right`} />
								</td>
								<td className="px-4 py-2">
									<input {...register(`capitalInjections.${i}.source`)} placeholder="e.g. Owner equity" className={inputCls} />
								</td>
								<td className="px-4 py-2">
									<button type="button" onClick={() => injections.remove(i)} className="text-muted-foreground hover:text-destructive">
										<TrashIcon className="h-4 w-4" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>

			<div className="flex items-center justify-end gap-3">
				<Button
					label={isSeeding ? "Seeding…" : "Seed from actuals"}
					variant={isSeeding ? "disabled" : "secondary"}
					onClick={handleSeed}
					disabled={isSeeding}
				/>
				<Button
					label={isSubmitting ? "Saving…" : "Save plan"}
					variant={isSubmitting ? "disabled" : "primary"}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<div>
			<label className="block text-sm font-medium text-foreground">{label}</label>
			{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
			<div className="mt-1">{children}</div>
		</div>
	);
}
