import { formatCurrency } from "../libs/format";
import { coinMeta } from "../libs/crypto-api";
import { X } from "lucide-react";

export function AlertsList({ alerts, onRemove }) {
  return (
    <div className="rounded-xl  border border-border bg-[#1E1D1B] p-5 shadow-[var(--shadow-card)]" data-testid="alerts-list">
      <h2 className="mb-4 text-base text-white font-semibold">Active alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-[#A39A8E]">
          No alerts yet. Create one above.
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-[#2B2925] px-3 py-2 text-sm text-[#E0E0D8]"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">
                  {coinMeta(a.coin).symbol}
                </span>
                <span className="text-[#A39A8E]">
                  {a.direction === "above" ? "≥" : "≤"}
                </span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(a.threshold)}
                </span>
                {a.triggered && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                    triggered
                  </span>
                )}
              </div>
              <button
                aria-label={`Remove alert ${a.id}`}
                onClick={() => onRemove(a.id)}
                className="rounded-md p-1 text-[#A39A8E] transition hover:bg-white/10 hover:text-[#E0E0D8]"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
