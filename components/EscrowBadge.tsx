import { STATUS_LABEL, STATUS_TONE } from "@/lib/escrow";
import type { EscrowStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EscrowBadge({
  status,
  className,
}: {
  status: EscrowStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        STATUS_TONE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
