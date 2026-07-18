import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "./Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Real-Time Crypto Alert Dashboard" },
      {
        name: "description",
        content:
          "Live BTC, ETH, and SOL prices with custom price threshold alerts and native browser notifications.",
      },
      { property: "og:title", content: "Real-Time Crypto Alert Dashboard" },
      {
        property: "og:description",
        content: "Live crypto prices with instant threshold alerts.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Dashboard />;
}
