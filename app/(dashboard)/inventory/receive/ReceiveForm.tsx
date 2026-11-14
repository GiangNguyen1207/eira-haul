"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import { formatPrice } from "@/lib/utils";
import { receiveStock, type ReceiveItemInput } from "../actions";

const inputCls =
	"w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

export type ProductOption = {
	id: string;
	name: string;
	currentStock: number;
	category: string;
};

type FormValues = {
	occurredAt: string;
	note: string;
	items: ReceiveItemInput[];
};

function ReceiveTotal({ control }: { control: ReturnType<typeof useForm<FormValues>>["control"] }) {
	const items = useWatch({ control, name: "items" });
	const total = (items ?? []).reduce((s, i) => s + (i.qty ?? 0) * (i.unitCost ?? 0), 0);
	return <span className="text-lg font-semibold text-foreground">{formatPrice(total)}</span>;
}

export default function ReceiveForm({ products, now }: { products: ProductOption[]; now: string }) {
	const router = useRouter();
	const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
		defaultValues: { occurredAt: now, note: "", items: [] },
	});
	const { fields, append, remove } = useFieldArray({ control, name: "items" });

	const addItem = () => append({ productId: "", qty: 1, unitCost: 0 });

	const onSubmit = async (data: FormValues) => {
		const result = await receiveStock(data);
		if (result.error) { toast.error(result.error); return; }
		toast.success("Stock received.");
		router.push("/inventory");
	};

	const grouped = products.reduce<Record<string, ProductOption[]>>((acc, p) => {
		(acc[p.category] ??= []).push(p);
		return acc;
	}, {});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="rounded-xl border border-border bg-card p-5">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-foreground">Date received</label>
						<input type="datetime-local" {...register("occurredAt")} className={`mt-1 ${inputCls}`} />
					</div>
					<div>
						<label className="block text-sm font-medium text-foreground">Note (optional)</label>
						<input {...register("note")} placeholder="e.g. Supplier order #42" className={`mt-1 ${inputCls}`} />
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card">
				<div className="flex items-center justify-between border-b border-border px-5 py-3">
					<h2 className="font-medium text-foreground">Items received</h2>
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
						<button type="button" onClick={addItem} className="text-primary hover:underline">add one</button>
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border/60 text-left text-muted-foreground">
									<th className="px-4 py-2 font-medium">Product</th>
									<th className="px-4 py-2 text-right font-medium">Qty</th>
									<th className="px-4 py-2 text-right font-medium">Unit cost (€)</th>
									<th className="px-4 py-2" />
								</tr>
							</thead>
							<tbody>
								{fields.map((field, i) => (
									<tr key={field.id} className="border-b border-border/40 last:border-0">
										<td className="px-4 py-2 min-w-[220px]">
											<select {...register(`items.${i}.productId`, { required: true })} className={inputCls}>
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
												type="number" min="1" step="1"
												{...register(`items.${i}.qty`, { valueAsNumber: true, min: 1 })}
												className={`${inputCls} text-right`}
											/>
										</td>
										<td className="px-4 py-2 w-32">
											<input
												type="number" min="0" step="0.01"
												{...register(`items.${i}.unitCost`, { valueAsNumber: true })}
												className={`${inputCls} text-right`}
											/>
										</td>
										<td className="px-4 py-2">
											<button type="button" onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive">
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
					<div className="flex justify-end gap-2 border-t border-border px-5 py-3">
						<span className="text-sm text-muted-foreground">Total cost</span>
						<ReceiveTotal control={control} />
					</div>
				)}
			</div>

			<div className="flex justify-end gap-3">
				<Button label="Cancel" variant="secondary" type="button" onClick={() => router.push("/inventory")} />
				<Button
					label={isSubmitting ? "Saving…" : "Confirm receipt"}
					variant={isSubmitting ? "disabled" : "primary"}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	);
}
