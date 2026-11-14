"use client";

import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/Button";
import { formatPrice } from "@/lib/utils";
import { recordExpense } from "./actions";

const inputCls =
	"w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

type FormValues = {
	name: string;
	supplier: string;
	occurredAt: string;
	amount: number;
	hasVat: boolean;
	vatAmount: number;
	sentToAccountant: boolean;
};

function TotalDisplay({ control }: { control: ReturnType<typeof useForm<FormValues>>["control"] }) {
	const amount = useWatch({ control, name: "amount" }) ?? 0;
	const hasVat = useWatch({ control, name: "hasVat" });
	const vatAmount = useWatch({ control, name: "vatAmount" }) ?? 0;
	const total = Number(amount) + (hasVat ? Number(vatAmount) : 0);
	return (
		<div className={`mt-1 ${inputCls} bg-secondary/40 text-right tabular-nums text-foreground`}>
			{formatPrice(Number.isFinite(total) ? total : 0)}
		</div>
	);
}

export default function ExpenseForm({ today }: { today: string }) {
	const router = useRouter();
	const {
		register,
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<FormValues>({
		defaultValues: {
			name: "",
			supplier: "",
			occurredAt: today,
			amount: undefined,
			hasVat: false,
			vatAmount: undefined,
			sentToAccountant: false,
		},
	});

	const hasVat = useWatch({ control, name: "hasVat" });

	const onSubmit = async (data: FormValues) => {
		const amount = Number(data.amount) || 0;
		const vatAmount = data.hasVat ? Number(data.vatAmount) || 0 : 0;
		const result = await recordExpense({
			name: data.name,
			supplier: data.supplier,
			occurredAt: data.occurredAt,
			amount,
			hasVat: data.hasVat,
			vatAmount,
			amountAfterVat: amount + vatAmount,
			sentToAccountant: data.sentToAccountant,
		});
		if (result.error) {
			toast.error(result.error);
			return;
		}
		toast.success("Expense recorded.");
		router.push("/expenses");
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="rounded-xl border border-border bg-card p-5 space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-foreground">Name</label>
						<input
							type="text"
							{...register("name", { required: true })}
							placeholder="e.g. Monthly rent"
							className={`mt-1 ${inputCls}`}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-foreground">Supplier</label>
						<input
							type="text"
							{...register("supplier")}
							placeholder="e.g. Landlord Co."
							className={`mt-1 ${inputCls}`}
						/>
					</div>
				</div>

				<div className="sm:w-1/2">
					<label className="block text-sm font-medium text-foreground">Date</label>
					<input
						type="date"
						{...register("occurredAt", { required: true })}
						className={`mt-1 ${inputCls}`}
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<div>
						<label className="block text-sm font-medium text-foreground">Amount (€)</label>
						<input
							type="number"
							min="0"
							step="0.01"
							{...register("amount", { valueAsNumber: true, required: true, min: 0 })}
							className={`mt-1 ${inputCls} text-right`}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-foreground">VAT (€)</label>
						<input
							type="number"
							min="0"
							step="0.01"
							disabled={!hasVat}
							{...register("vatAmount", { valueAsNumber: true })}
							className={`mt-1 ${inputCls} text-right disabled:opacity-40 disabled:cursor-not-allowed`}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-foreground">Total incl. VAT</label>
						<TotalDisplay control={control} />
					</div>
				</div>

				<div className="flex flex-wrap gap-6 pt-1">
					<label className="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							{...register("hasVat")}
							className="h-4 w-4 rounded border-border accent-primary"
						/>
						<span className="text-sm font-medium text-foreground">Includes VAT</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							{...register("sentToAccountant")}
							className="h-4 w-4 rounded border-border accent-primary"
						/>
						<span className="text-sm font-medium text-foreground">Sent to accountant</span>
					</label>
				</div>
			</div>

			<div className="flex justify-end gap-3">
				<Button
					label="Cancel"
					variant="secondary"
					type="button"
					onClick={() => router.push("/expenses")}
				/>
				<Button
					label={isSubmitting ? "Saving…" : "Record expense"}
					variant={isSubmitting ? "disabled" : "primary"}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	);
}
