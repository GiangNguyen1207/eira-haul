"use client";

import {
	ADMIN_LOGIN,
	EMAIL,
	PASSWORD,
	LOGIN,
	ERROR_INVALID_CREDENTIALS,
} from "@/constant";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import type { AdminLogin } from "@/lib/types";

export default function AdminLoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const inputBaseClassName =
		"mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";
	const { register, handleSubmit } = useForm<AdminLogin>();

	const onSubmit = async (data: AdminLogin) => {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});
		setLoading(false);
		if (error) {
			toast.error(ERROR_INVALID_CREDENTIALS);
			return;
		}
		console.log("Login successful");
		router.push("/admin/orders");
	};

	return (
		<div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center">
			<p className="font-serif font-semibold text-3xl text-foreground sm:text-4xl">
				{ADMIN_LOGIN}
			</p>
			<form
				className="mt-6 w-1/2 rounded-xl border border-border bg-card p-6"
				onSubmit={handleSubmit(onSubmit)}
				noValidate
			>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-foreground"
				>
					{EMAIL}
				</label>
				<input
					type="email"
					{...register("email", {
						required: true,
						pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
					})}
					className={inputBaseClassName}
				/>
				<label
					htmlFor="password"
					className="mt-4 block text-sm font-medium text-foreground"
				>
					{PASSWORD}
				</label>
				<input
					type="password"
					{...register("password", { required: true })}
					className={inputBaseClassName}
				/>
				<Button
					label={LOGIN}
					variant="primary"
					type="submit"
					disabled={loading}
					className="mt-6 w-full"
				/>
			</form>
		</div>
	);
}
