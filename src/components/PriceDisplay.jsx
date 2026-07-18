import { formatCurrency, formatPercent } from "../libs/format";
import { TrendingDown, TrendingUp } from "lucide-react";

const SCREEN_MOCKUP_COLORS = ["#F2CF6A", "#D2B4F0", "#BEDCF0"];

export function PriceDisplay({ symbol, name, price, change24h, index = 0 }) {
  const up = change24h >= 0;
  const accentColor =
    SCREEN_MOCKUP_COLORS[index % SCREEN_MOCKUP_COLORS.length];

  return (
    <div
      data-testid={`price-card-${symbol}`}
      className="group relative overflow-hidden rounded-xl border border-border p-5 shadow-[var(--shadow-card)] transition hover:border-primary/50"
      style={{ backgroundColor: accentColor, borderTopWidth: 3 }}
    >
      {/* Diagonal Fade Grid Geometry */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-black/60">
            {symbol}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-black">{name}</h3>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            up
              ? "bg-[oklch(0.78_0.16_155/0.25)] text-[color:var(--success)]"
              : "bg-[oklch(0.68_0.22_25/0.25)] text-[color:var(--danger)]"
          }`}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {formatPercent(change24h)}
        </div>
      </div>
      <p
        data-testid={`price-value-${symbol}`}
        className="relative z-10 mt-6 font-mono text-3xl font-bold tabular-nums text-black"
      >
        {formatCurrency(price)}
      </p>
    </div>
  );
}

// --- Parent: this is what actually produces 3 different-colored boxes ---
// Option A — data-driven (recommended if items come from an array/API)
export function PriceDisplayRow({ items }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, i) => (
        <PriceDisplay key={item.symbol} index={i} {...item} />
      ))}
    </div>
  );
}

// Option B — hardcoded columns, if you're writing each card by hand
export function PriceDisplayRowStatic() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <PriceDisplay index={0} symbol="BTC" name="Bitcoin" price={64230} change24h={2.1} />
      <PriceDisplay index={1} symbol="ETH" name="Ethereum" price={3450} change24h={-1.4} />
      <PriceDisplay index={2} symbol="SOL" name="Solana" price={172} change24h={5.3} />
    </div>
  );
}