"use client";

import {
	LOGIN_TITLE,
	LOGIN_SUBTITLE,
	EMAIL,
	PASSWORD,
	LOGIN,
	ERROR_INVALID_CREDENTIALS,
	LOGO,
	APP_NAME,
} from "@/constant";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import type { LoginInput } from "@/lib/types";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const inputBaseClassName =
		"mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";
	const { register, handleSubmit } = useForm<LoginInput>();

	const onSubmit = async (data: LoginInput) => {
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
		router.replace("/");
		router.refresh();
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-6">
			<div className="w-full max-w-sm">
				<div className="mb-6 text-center">
					<p className="font-serif text-2xl font-semibold text-primary">{LOGO}</p>
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
						{APP_NAME}
					</p>
				</div>
				<form
					className="rounded-xl border border-border bg-card p-6"
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<p className="text-lg font-semibold text-foreground">{LOGIN_TITLE}</p>
					<p className="text-sm text-muted-foreground">{LOGIN_SUBTITLE}</p>

					<label
						htmlFor="email"
						className="mt-5 block text-sm font-medium text-foreground"
					>
						{EMAIL}
					</label>
					<input
						id="email"
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
						id="password"
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
		</div>
	);
}
