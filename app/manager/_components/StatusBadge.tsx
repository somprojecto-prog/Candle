import { STATUS_META, type OrderStatus } from "../_lib/order-contract";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        meta?.badge ?? "bg-neutral-500/15 text-neutral-300 ring-neutral-400/30"
      }`}
    >
      {meta?.label ?? status}
    </span>
  );
}
