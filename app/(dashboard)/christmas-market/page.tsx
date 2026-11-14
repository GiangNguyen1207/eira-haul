import { getMarketplacePlan } from "./actions";
import MarketplacePlan from "./MarketplacePlan";

export default async function MarketplacePlanPage() {
	const initial = await getMarketplacePlan();
	return <MarketplacePlan initial={initial} />;
}
