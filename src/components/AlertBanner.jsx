import { formatCurrency } from "../libs/format";
import { AlertTriangle, X } from "lucide-react";

export function AlertBanner({ alert, onDismiss }) {
  return (
    <div
      role="alert"
      data-testid="alert-banner"
      className="fixed bg-yellow-300 inset-x-0 top-0 z-50 border-b border-primary/40  backdrop-blur animate-[var(--animate-slide-down)]"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="rounded-lg bg-primary/20 p-2 text-primary animate-[var(--animate-pulse-glow)]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm">
          <span className="font-semibold text-primary">{alert.symbol}</span>{" "}
          <span className="text-muted-foreground">
            crossed {alert.direction} {formatCurrency(alert.threshold)} — now
          </span>{" "}
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {formatCurrency(alert.price)}
          </span>
        </div>
        <button
          aria-label="Dismiss alert"
          onClick={onDismiss}
          className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
