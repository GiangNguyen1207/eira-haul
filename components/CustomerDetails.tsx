import {
	CONFIRMATION_DETAILS,
	CONFIRMATION_DETAILS_DESCRIPTION,
	PLACE_ORDER,
	PLACING_ORDER,
	NAME,
	PHONE_NUMBER,
	EMAIL_ADDRESS,
} from "../constant";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CustomerDetailsInput } from "@/lib/types";
import Button from "./Button";

interface CustomerDetailsProps {
	register: UseFormRegister<CustomerDetailsInput>;
	errors: FieldErrors<CustomerDetailsInput>;
	submitForm: () => void;
	loading?: boolean;
	error?: string | null;
}

export default function CustomerDetails({
	register,
	errors,
	submitForm,
	loading,
	error,
}: CustomerDetailsProps) {
	const labelBaseClassName = "block text-xs font-medium text-foreground";
	const inputBaseClassName =
		"mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";
	console.log(errors);

	return (
		<div className="rounded-xl border border-border bg-card p-6">
			<p className="font-display text-xl text-foreground">
				{CONFIRMATION_DETAILS}
			</p>
			<p className="mt-1 text-xs text-muted-foreground">
				{CONFIRMATION_DETAILS_DESCRIPTION}
			</p>
			<form className="mt-5 space-y-4" onSubmit={submitForm}>
				<div>
					<label htmlFor="name" className={labelBaseClassName}>
						{NAME}
					</label>
					<input
						{...register("name", { required: true, maxLength: 20 })}
						className={inputBaseClassName}
					/>
					{errors.name && (
						<p className="mt-1 text-xs text-red-500">
							{errors.name.type === "required" && "Name is required."}
							{errors.name.type === "maxLength" &&
								"Name cannot exceed 20 characters."}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="phone" className={labelBaseClassName}>
						{PHONE_NUMBER}
					</label>
					<input
						type="tel"
						{...register("phone", {
							required: true,
							pattern: /^[+\d][\d\s\-().]{6,19}$/,
						})}
						className={inputBaseClassName}
					/>
					{errors.phone && (
						<p className="mt-1 text-xs text-red-500">
							{errors.phone.type === "required" && "Phone number is required."}
							{errors.phone.type === "pattern" && "Enter a valid phone number."}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="email" className={labelBaseClassName}>
						{EMAIL_ADDRESS}
					</label>
					<input
						type="email"
						{...register("email", {
							required: true,
							pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
						})}
						className={inputBaseClassName}
					/>
					{errors.email && (
						<p className="mt-1 text-xs text-red-500">
							{errors.email.type === "required" && "Email is required."}
							{errors.email.type === "pattern" &&
								"Enter a valid email address."}
						</p>
					)}
				</div>

				{error && <p className="text-xs text-red-500">{error}</p>}
				<Button
					label={loading ? PLACING_ORDER : PLACE_ORDER}
					type="submit"
					variant="primary"
					disabled={loading}
					className="mt-2 w-full text-sm font-semibold text-primary-foreground disabled:opacity-50"
				/>
			</form>
		</div>
	);
}
