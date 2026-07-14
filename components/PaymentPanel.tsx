import {
	MOBILEPAY_NUMBER,
	SCAN_QR_CODE,
	MOBILEPAY_NUMBER_LABEL,
	PAYMENT_AMOUNT_LABEL,
	REFERENCE_LABEL,
} from "@/constant";

interface PaymentPanelProps {
	amount: number;
	reference: string;
}

export default function PaymentPanel({ amount, reference }: PaymentPanelProps) {
	const qrData = encodeURIComponent(MOBILEPAY_NUMBER);

	return (
		<div className="mt-6 rounded-xl border border-border bg-card p-6">
			<h2 className="mt-1">{SCAN_QR_CODE}</h2>

			<div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${qrData}`}
					alt={`MobilePay QR code for ${MOBILEPAY_NUMBER}`}
					width={160}
					height={160}
					className="h-40 w-40 rounded-lg border border-border bg-white p-2"
				/>
				<dl className="grid flex-1 gap-3 text-sm">
					<div>
						<dt className="text-xs uppercase tracking-widest text-muted-foreground">
							{MOBILEPAY_NUMBER_LABEL}
						</dt>
						<dd className="font-serif text-lg text-foreground">
							{MOBILEPAY_NUMBER}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-widest text-muted-foreground">
							{PAYMENT_AMOUNT_LABEL}
						</dt>
						<dd className="font-serif text-lg text-foreground">
							€{amount.toFixed(2)}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-widest text-muted-foreground">
							{REFERENCE_LABEL}
						</dt>
						<dd className="font-mono text-sm text-foreground">{reference}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
