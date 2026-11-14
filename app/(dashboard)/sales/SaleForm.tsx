"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import { formatPrice, formatCurrency } from "@/lib/utils";
import { recordSale, type SaleItemInput, type SaleInput } from "./actions";

const inputCls =
	"w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

const PLATFORMS = ["Shopify", "Marketplace", "Coffee shop"];

export type ProductOption = {
	id: string;
	name: string;
	sellPrice: number;
	currentStock: number;
	category: string;
};

type FormValues = {
	occurredAt: string;
	platform: string;
	items: SaleItemInput[];
};

function LineTotal({ index, control }: { index: number; control: ReturnType<typeof useForm<FormValues>>["control"] }) {
	const item = useWatch({ control, name: `items.${index}` });
	const total = (item.qty ?? 0) * (item.unitPrice ?? 0) * (1 - (item.discountPct ?? 0) / 100);
	return <span className="text-sm tabular-nums text-foreground">{formatPrice(total)}</span>;
}

function SaleSummary({ control }: { control: ReturnType<typeof useForm<FormValues>>["control"] }) {
	const items = useWatch({ control, name: "items" }) ?? [];
	const discount = items.reduce(
		(s, i) => s + (i.qty ?? 0) * (i.unitPrice ?? 0) * ((i.discountPct ?? 0) / 100),
		0,
	);
	const total = items.reduce(
		(s, i) => s + (i.qty ?? 0) * (i.unitPrice ?? 0) * (1 - (i.discountPct ?? 0) / 100),
		0,
	);
	return (
		<div className="flex items-center gap-6">
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Discount</span>
				<span className="text-sm tabular-nums text-foreground">{formatPrice(discount)}</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">Total</span>
				<span className="text-lg font-semibold tabular-nums text-foreground">{formatPrice(total)}</span>
			</div>
		</div>
	);
}

export default function SaleForm({ products, now }: { products: ProductOption[]; now: string }) {
	const router = useRouter();
	const { register, control, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormValues>({
		defaultValues: { occurredAt: now, platform: "Shopify", items: [] },
	});
	const { fields, append, remove } = useFieldArray({ control, name: "items" });

	const handleProductChange = (index: number, productId: string) => {
		const p = products.find((p) => p.id === productId);
		if (p) setValue(`items.${index}.unitPrice`, p.sellPrice);
	};

	const addItem = () => append({ productId: "", qty: 1, unitPrice: 0, discountPct: 0 });

	const onSubmit = async (data: FormValues) => {
		const result = await recordSale(data);
		if (result.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Sale recorded.");
		router.push("/sales");
	};

	// Group products by category for the select dropdown
	const grouped = products.reduce<Record<string, ProductOption[]>>((acc, p) => {
		(acc[p.category] ??= []).push(p);
		return acc;
	}, {});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			{/* Header fields */}
			<div className="rounded-xl border border-border bg-card p-5">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-foreground">Date & time</label>
						<input type="datetime-local" {...register("occurredAt")} className={`mt-1 ${inputCls}`} />
					</div>
					<div>
						<label className="block text-sm font-medium text-foreground">Platform</label>
						<select {...register("platform")} className={`mt-1 ${inputCls}`}>
							{PLATFORMS.map((m) => <option key={m}>{m}</option>)}
						</select>
					</div>
				</div>
			</div>

			{/* Line items */}
			<div className="rounded-xl border border-border bg-card">
				<div className="flex items-center justify-between border-b border-border px-5 py-3">
					<h2 className="font-medium text-foreground">Items</h2>
					<button
						type="button"
						onClick={addItem}
						className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
					>
						<PlusIcon className="h-4 w-4" /> Add item
					</button>
				</div>

				{fields.length === 0 ? (
					<p className="px-5 py-8 text-center text-sm text-muted-foreground">
						No items yet —{" "}
						<button type="button" onClick={addItem} className="text-primary hover:underline">
							add one
						</button>
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border/60 text-left text-muted-foreground">
									<th className="px-4 py-2 font-medium">Product</th>
									<th className="px-4 py-2 text-right font-medium">Qty</th>
									<th className="px-4 py-2 text-right font-medium">Unit price (€)</th>
									<th className="px-4 py-2 text-right font-medium">Discount (%)</th>
									<th className="px-4 py-2 text-right font-medium">Total</th>
									<th className="px-4 py-2" />
								</tr>
							</thead>
							<tbody>
								{fields.map((field, i) => (
									<tr key={field.id} className="border-b border-border/40 last:border-0">
										<td className="px-4 py-2 min-w-[220px]">
											<select
												{...register(`items.${i}.productId`, { required: true })}
												onChange={(e) => {
													register(`items.${i}.productId`).onChange(e);
													handleProductChange(i, e.target.value);
												}}
												className={inputCls}
											>
												<option value="">Select product…</option>
												{Object.entries(grouped).map(([cat, prods]) => (
													<optgroup key={cat} label={cat}>
														{prods.map((p) => (
															<option key={p.id} value={p.id}>
																{p.name} (stock: {p.currentStock})
															</option>
														))}
													</optgroup>
												))}
											</select>
										</td>
										<td className="px-4 py-2 w-20">
											<input
												type="number"
												min="1"
												step="1"
												{...register(`items.${i}.qty`, { valueAsNumber: true, min: 1 })}
												className={`${inputCls} text-right`}
											/>
										</td>
										<td className="px-4 py-2 w-32">
											<input
												type="number"
												min="0"
												step="0.01"
												{...register(`items.${i}.unitPrice`, { valueAsNumber: true })}
												className={`${inputCls} text-right`}
											/>
										</td>
										<td className="px-4 py-2 w-28">
											<input
												type="number"
												min="0"
												max="100"
												step="1"
												{...register(`items.${i}.discountPct`, { valueAsNumber: true })}
												className={`${inputCls} text-right`}
											/>
										</td>
										<td className="px-4 py-2 text-right w-24">
											<LineTotal index={i} control={control} />
										</td>
										<td className="px-4 py-2">
											<button
												type="button"
												onClick={() => remove(i)}
												className="text-muted-foreground hover:text-destructive"
											>
												<TrashIcon className="h-4 w-4" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{fields.length > 0 && (
					<div className="flex justify-end border-t border-border px-5 py-3">
						<SaleSummary control={control} />
					</div>
				)}
			</div>

			<div className="flex justify-end gap-3">
				<Button label="Cancel" variant="secondary" type="button" onClick={() => router.push("/sales")} />
				<Button
					label={isSubmitting ? "Saving…" : "Record sale"}
					variant={isSubmitting ? "disabled" : "primary"}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	);
}
