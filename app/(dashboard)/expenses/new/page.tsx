import Link from "next/link";
import ExpenseForm from "../ExpenseForm";

export default function NewExpensePage() {
	const today = new Date().toISOString().slice(0, 10);

	return (
		<section className="space-y-5">
			<div>
				<p className="text-sm text-muted-foreground">
					<Link href="/expenses" className="hover:text-foreground">Expenses</Link>
					{" / New"}
				</p>
				<h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">Record expense</h1>
			</div>
			<ExpenseForm today={today} />
		</section>
	);
}
