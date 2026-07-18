import { useEffect, useRef, useState } from "react";
import { fetchPrices, coinMeta } from "../libs/crypto-api";
import { PriceDisplay } from "../components/PriceDisplay";
import { AlertForm } from "../components/AlertForm";
import { AlertsList } from "../components/AlertsList";
import { AlertBanner } from "../components/AlertBanner";
import { useAlerts, crosses } from "../hooks/useAlerts";
import { Activity } from "lucide-react";

const POLL_MS = 15000;

export function Dashboard({ pollMs = POLL_MS }) {
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);
  const [banner, setBanner] = useState(null);
  const { alerts, add, remove, markTriggered } = useAlerts();
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const next = await fetchPrices();
        if (cancelled) return;
        setError(null);
        setPrices(next);
        checkAlerts(next);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    function checkAlerts(next) {
      const byId = new Map(next.map((p) => [p.id, p.price]));
      for (const a of alertsRef.current) {
        if (a.triggered) continue;
        const price = byId.get(a.coin);
        if (price === undefined) continue;
        if (crosses(a.direction, a.threshold, price)) {
          markTriggered(a.id);
          const symbol = coinMeta(a.coin).symbol;
          setBanner({
            id: a.id,
            symbol,
            direction: a.direction,
            threshold: a.threshold,
            price,
          });
          notify(symbol, a.direction, a.threshold, price);
        }
      }
    }
    tick();
    const t = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [pollMs, markTriggered]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  return (
    <>
      {banner && <AlertBanner alert={banner} onDismiss={() => setBanner(null)} />}
      <div className="mx-auto max-w-6xl px-4 py-10 ">
        <header className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Real-Time Crypto Alerts</h1>
            <p className="text-sm text-muted-foreground">
              Live prices from CoinGecko · polling every {Math.round(pollMs / 1000)}s
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-danger/50 bg-danger/10 px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <section
          data-testid="prices-grid"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {prices.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl border border-border bg-card"
                />
              ))
            : prices.map((p, i) => (
                <PriceDisplay
                  key={p.id}
                  index={i}
                  symbol={p.symbol}
                  name={p.name}
                  price={p.price}
                  change24h={p.change24h}
                />
              ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <AlertForm onSubmit={(a) => add(a)} />
          <AlertsList alerts={alerts} onRemove={remove} />
        </section>
      </div>
    </>
  );
}

function notify(symbol, direction, threshold, price) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(`${symbol} alert triggered`, {
      body: `${symbol} is now $${price.toFixed(2)} (${direction} $${threshold.toFixed(2)})`,
    });
  } catch {
    /* ignore */
  }
}
