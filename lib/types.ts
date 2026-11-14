// ─── Auth ──────────────────────────────────────────────────────────────────
export type LoginInput = {
	email: string;
	password: string;
};

// ─── Business health ─────────────────────────────────────────────────────────
export type HealthStatus = "healthy" | "normal" | "unhealthy" | "unknown";

export type HealthSignal = {
	key: "margin" | "cashflow" | "inventory" | "sales";
	label: string;
	status: HealthStatus;
	detail: string;
};

// ─── Catalog ─────────────────────────────────────────────────────────────────
export type Category = {
	id: string;
	name: string;
};

export type ProductUnit = "piece" | "pack" | "box" | "set";

export type Product = {
	id: string;
	name: string;
	category_id: string | null;
	sku: string | null;
	unit: ProductUnit;
	cost_price: number;
	sell_price: number;
	current_stock: number;
	reorder_threshold: number;
	active: boolean;
	created_at: string;
};

// ─── Inventory ───────────────────────────────────────────────────────────────
export type StockMoveType = "purchase" | "sale" | "adjustment" | "wastage";

export type StockMove = {
	id: string;
	product_id: string;
	type: StockMoveType;
	qty: number;
	unit_cost: number | null;
	note: string | null;
	occurred_at: string;
};

// ─── Sales ───────────────────────────────────────────────────────────────────
export type Sale = {
	id: string;
	occurred_at: string;
	total: number;
	discount_total: number;
	promotion_id: string | null;
	platform: string | null;
};

export type SaleItem = {
	id: string;
	sale_id: string;
	product_id: string | null;
	qty: number;
	unit_price: number;
	line_discount: number;
};

// ─── Promotions ──────────────────────────────────────────────────────────────
export type PromotionType = "pct" | "fixed" | "bundle" | "bogo";
export type PromotionScope = "product" | "category" | "store";

export type Promotion = {
	id: string;
	name: string;
	type: PromotionType;
	scope: PromotionScope;
	target_id: string | null;
	value: number;
	cost: number;
	starts_at: string | null;
	ends_at: string | null;
	active: boolean;
};

// ─── Expenses ────────────────────────────────────────────────────────────────
export type ExpenseCategory =
	| "rent"
	| "salary"
	| "utilities"
	| "supplier"
	| "other";

export type Expense = {
	id: string;
	category: ExpenseCategory;
	amount: number;
	recurring: boolean;
	period: string | null;
	note: string | null;
	occurred_at: string;
};

// ─── Settings (owner-defined thresholds) ─────────────────────────────────────
export type Settings = {
	target_net_margin: number;
	runway_target_months: number;
	dead_stock_days: number;
	cash_on_hand: number;
	sales_trend_window: number;
};
