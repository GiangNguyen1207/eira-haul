export type CartItem = {
	id: number;
	name: string;
	price: number;
	quantity: number;
};

export type CustomerDetailsInput = {
	name: string;
	phone: string;
	email: string;
};
export interface OrderInput {
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	items: CartItem[];
	total: number;
	reference: string;
}

export type ConfirmInfo = {
	name: string;
	reference: string;
	total: number;
};

export type AdminLogin = {
	email: string;
	password: string;
};
