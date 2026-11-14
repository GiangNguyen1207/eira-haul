"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/Button";
import { saveProduct, type ProductFormValues } from "./actions";

const inputCls =
	"w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

const UNITS = ["piece", "pack", "box", "set"] as const;

type Props = {
	id?: string;
	defaultValues?: Partial<ProductFormValues>;
	categories: string[];
};

const empty: ProductFormValues = {
	name: "",
	categoryName: "",
	sku: "",
	unit: "piece",
	costPrice: 0,
	sellPrice: 0,
	currentStock: 0,
	reorderThreshold: 0,
	active: true,
};

export default function ProductForm({ id, defaultValues, categories }: Props) {
	const router = useRouter();
	const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<ProductFormValues>({
		defaultValues: { ...empty, ...defaultValues },
	});

	const costPrice = watch("costPrice");
	const sellPrice = watch("sellPrice");
	const margin = sellPrice > 0 ? ((sellPrice - costPrice) / sellPrice) * 100 : 0;

	const onSubmit = async (data: ProductFormValues) => {
		const result = await saveProduct(id ?? null, data);
		if (result.error) {
			toast.error(result.error);
			return;
		}
		toast.success(id ? "Product updated." : "Product created.");
		router.push("/products");
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<h2 className="font-medium text-foreground">Basic info</h2>

				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Name *">
						<input {...register("name", { required: true })} placeholder="e.g. Summer Dress" className={inputCls} />
					</Field>
					<Field label="Category">
						<input
							{...register("categoryName")}
							list="categories-list"
							placeholder="e.g. Clothing"
							className={inputCls}
						/>
						<datalist id="categories-list">
							{categories.map((c) => <option key={c} value={c} />)}
						</datalist>
					</Field>
					<Field label="SKU">
						<input {...register("sku")} placeholder="e.g. DR-001" className={inputCls} />
					</Field>
					<Field label="Unit">
						<select {...register("unit")} className={inputCls}>
							{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
						</select>
					</Field>
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<h2 className="font-medium text-foreground">Pricing</h2>
				<div className="grid gap-4 sm:grid-cols-3">
					<Field label="Cost price (€)" hint="What you pay the supplier">
						<input type="number" step="0.001" min="0" {...register("costPrice", { valueAsNumber: true })} className={inputCls} />
					</Field>
					<Field label="Sell price (€)" hint="What the customer pays">
						<input type="number" step="0.01" min="0" {...register("sellPrice", { valueAsNumber: true })} className={inputCls} />
					</Field>
					<Field label="Gross margin">
						<div className={`${inputCls} bg-secondary text-muted-foreground`}>
							{margin.toFixed(1)}%
						</div>
					</Field>
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<h2 className="font-medium text-foreground">Stock</h2>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field label="Current stock" hint="Units you have right now">
						<input type="number" min="0" step="1" {...register("currentStock", { valueAsNumber: true })} className={inputCls} />
					</Field>
					<Field label="Reorder threshold" hint="Alert when stock falls below this">
						<input type="number" min="0" step="1" {...register("reorderThreshold", { valueAsNumber: true })} className={inputCls} />
					</Field>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
					<input type="checkbox" {...register("active")} className="h-4 w-4 rounded border-border" />
					Active (visible in sales)
				</label>
				<div className="flex gap-3">
					<Button label="Cancel" variant="secondary" type="button" onClick={() => router.push("/products")} />
					<Button
						label={isSubmitting ? "Saving…" : id ? "Save changes" : "Create product"}
						variant={isSubmitting ? "disabled" : "primary"}
						type="submit"
						disabled={isSubmitting}
					/>
				</div>
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
