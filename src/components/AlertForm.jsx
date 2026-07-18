import { useState } from "react";
import { COIN_IDS, coinMeta } from "../libs/crypto-api";
import { Bell } from "lucide-react";

export function AlertForm({ onSubmit }) {
  const [coin, setCoin] = useState("bitcoin");
  const [direction, setDirection] = useState("above");
  const [threshold, setThreshold] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(threshold);
    if (!Number.isFinite(value) || value <= 0) return;
    onSubmit({ coin, direction, threshold: value });
    setThreshold("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Create price alert"
      className="rounded-xl border border-border bg-[#F6F5F1] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-full bg-[#FD4D02]/15 p-2 text-[#FD4D02]">
          <Bell className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold">Create alert</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-1">
          Coin
          <select
            aria-label="Coin"
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="h-10 rounded-md border border-border bg-input px-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {COIN_IDS.map((id) => (
              <option key={id} value={id}>
                {coinMeta(id).symbol}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-1">
          Direction
          <select
            aria-label="Direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="h-10 rounded-md border border-border bg-input px-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
          Threshold (USD)
          <input
            aria-label="Threshold"
            type="number"
            step="any"
            min="0"
            placeholder="e.g. 65000"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="h-10 rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-orange-400 px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
      >
        Set Alert
      </button>
    </form>
  );
}
