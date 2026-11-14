import { SECTION } from "@/constant";
import { getPlanFormValues, checkHasPlan } from "@/lib/plan";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
	const [defaultValues, hasPlan] = await Promise.all([getPlanFormValues(), checkHasPlan()]);

	return (
		<section className="space-y-6">
			<div>
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					{SECTION.settings}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Edit your plan assumptions. Every statement recomputes when you save.
				</p>
			</div>
			<SettingsForm defaultValues={defaultValues} hasPlan={hasPlan} />
		</section>
	);
}
