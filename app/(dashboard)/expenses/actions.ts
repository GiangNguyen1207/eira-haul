"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type ExpenseInput = {
	name: string;
	supplier: string;
	occurredAt: string;
	amount: number;
	hasVat: boolean;
	vatAmount: number;
	amountAfterVat: number;
	sentToAccountant: boolean;
};

export async function recordExpense(data: ExpenseInput): Promise<{ error?: string }> {
	const db = createSupabaseAdmin();

	const { error } = await db.from("expenses").insert({
		name: data.name,
		supplier: data.supplier || null,
		occurred_at: data.occurredAt,
		amount: data.amount,
		has_vat: data.hasVat,
		vat_amount: data.vatAmount,
		amount_after_vat: data.amountAfterVat,
		sent_to_accountant: data.sentToAccountant,
	});

	if (error) return { error: error.message };

	revalidatePath("/expenses");
	return {};
}
