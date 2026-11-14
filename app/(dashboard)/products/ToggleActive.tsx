"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleProductActive } from "./actions";

export default function ToggleActive({ id, active }: { id: string; active: boolean }) {
	const [loading, setLoading] = useState(false);

	const handle = async () => {
		setLoading(true);
		const result = await toggleProductActive(id, !active);
		setLoading(false);
		if (result.error) toast.error(result.error);
	};

	return (
		<button
			onClick={handle}
			disabled={loading}
			className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
		>
			{active ? "Deactivate" : "Activate"}
		</button>
	);
}
