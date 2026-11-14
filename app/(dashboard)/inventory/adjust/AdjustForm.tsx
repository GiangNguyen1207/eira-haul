"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/Button";
import { adjustStock, type AdjustInput } from "../actions";

const inputCls =
	"w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

export type ProductOption = {
	id: string;
	name: string;
	currentStock: number;
	category: string;
};

type FormValues = Omit<AdjustInput, "qty"> & { qty: number };

export default function AdjustForm({ products, now }: { products: ProductOption[]; now: string }) {
	const router = useRouter();
	const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormValues>({
		defaultValues: { productId: "", type: "adjustment", qty: 0, note: "", occurredAt: now },
	});

	const selectedId = watch("productId");
	const qty = watch("qty");
	const product = products.find((p) => p.id === selectedId);
	const newStock = product ? Math.max(0, product.currentStock + (qty ?? 0)) : null;

	const onSubmit = async (data: FormValues) => {
		const result = await adjustStock(data);
		if (result.error) { toast.error(result.error); return; }
		toast.success("Stock adjusted.");
		router.push("/inventory");
	};

	const grouped = products.reduce<Record<string, ProductOption[]>>((acc, p) => {
		(acc[p.category] ??= []).push(p);
		return acc;
	}, {});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<div>
					<label className="block text-sm font-medium text-foreground">Product *</label>
					<select {...register("productId", { required: true })} className={`mt-1 ${inputCls}`}>
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
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground">Type *</label>
					<select {...register("type")} className={`mt-1 ${inputCls}`}>
						<option value="adjustment">Adjustment — correct a stock count</option>
						<option value="wastage">Wastage — damaged or lost items</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground">Qty change *</label>
					<p className="text-xs text-muted-foreground">Positive to add, negative to remove (e.g. -2 for 2 damaged items)</p>
					<input
						type="number"
						step="1"
						{...register("qty", { valueAsNumber: true, required: true })}
						className={`mt-1 ${inputCls}`}
					/>
					{newStock !== null && (
						<p className="mt-1 text-xs text-muted-foreground">
							New stock level: <span className="font-medium text-foreground">{newStock}</span>
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground">Note (optional)</label>
					<input {...register("note")} placeholder="e.g. Damaged in transit" className={`mt-1 ${inputCls}`} />
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground">Date</label>
					<input type="datetime-local" {...register("occurredAt")} className={`mt-1 ${inputCls}`} />
				</div>
			</div>

			<div className="flex justify-end gap-3">
				<Button label="Cancel" variant="secondary" type="button" onClick={() => router.push("/inventory")} />
				<Button
					label={isSubmitting ? "Saving…" : "Save adjustment"}
					variant={isSubmitting ? "disabled" : "primary"}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	);
}
