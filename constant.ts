// Brand
export const LOGO = "Eira Haul";
export const APP_NAME = "Shop Pulse";
export const APP_TAGLINE = "Financial plan 2026";

// Navigation
export type NavLink = { href: string; label: string };
export type NavGroup = { label: string; children: NavLink[] };
export type NavItem = NavLink | NavGroup;

export const NAV: NavItem[] = [
	{ href: "/", label: "Dashboard" },
	{
		label: "Operations",
		children: [
			{ href: "/products", label: "Products" },
			{ href: "/sales", label: "Sales" },
			{ href: "/inventory", label: "Inventory" },
		],
	},
	{
		label: "Plan",
		children: [
			{ href: "/capital", label: "Capital" },
			{ href: "/revenue", label: "Revenue" },
			{ href: "/cogs", label: "COGS & Inventory" },
			{ href: "/expenses", label: "Expenses" },
			{ href: "/cash-flow", label: "Cash Flow" },
			{ href: "/scenarios", label: "Scenarios" },
		],
	},
	{ href: "/settings", label: "Settings" },
	{
		label: "Events",
		children: [
			{ href: "/christmas-market", label: "Marketplace" },
		],
	},
];

// Auth
export const LOGIN_TITLE = "Sign in";
export const LOGIN_SUBTITLE = "Owner access only";
export const EMAIL = "Email";
export const PASSWORD = "Password";
export const LOGIN = "Sign in";
export const LOGOUT = "Log out";
export const ERROR_INVALID_CREDENTIALS = "Invalid email or password.";

// Health verdict
export const HEALTH_LABEL: Record<string, string> = {
	healthy: "Healthy",
	normal: "Normal",
	unhealthy: "Unhealthy",
};

// KPI labels (the dashboard headline numbers)
export const KPI = {
	revenue: "Revenue",
	grossProfit: "Gross profit",
	grossMargin: "Gross margin",
	netProfit: "Net profit / loss",
	burnRate: "Cash burn rate",
	closingCash: "Closing cash",
	inventoryValue: "Inventory value",
	breakEven: "Break-even point",
	additionalCapital: "Additional capital required",
};

// Section titles (the six sheets)
export const SECTION = {
	dashboard: "Dashboard",
	capital: "Capital structure",
	revenue: "Revenue forecast",
	cogs: "COGS & inventory",
	expenses: "Operating expenses",
	cashFlow: "Cash flow",
	scenarios: "Scenario analysis",
	settings: "Settings",
};

// Scenario labels
export const SCENARIO_LABEL: Record<string, string> = {
	base: "Base case",
	best: "Best case",
	worst: "Worst case",
};
