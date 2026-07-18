import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../libs/crypto-api", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, fetchPrices: vi.fn() };
});

import { Dashboard } from "../../components/Dashboard";
import * as cryptoApi from "../../libs/crypto-api";

const fetchPricesMock = vi.mocked(cryptoApi.fetchPrices);

function makePrices(btc, eth = 3000, sol = 100) {
  return [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", price: btc, change24h: 1 },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", price: eth, change24h: 1 },
    { id: "solana", symbol: "SOL", name: "Solana", price: sol, change24h: 1 },
  ];
}

describe("Dashboard integration", () => {
  beforeEach(() => {
    fetchPricesMock.mockReset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("re-renders when a new price payload arrives on the next poll", async () => {
    fetchPricesMock
      .mockResolvedValueOnce(makePrices(60000))
      .mockResolvedValueOnce(makePrices(61000));

    render(<Dashboard pollMs={2000} />);

    await waitFor(() =>
      expect(screen.getByTestId("price-value-BTC")).toHaveTextContent("$60,000.00"),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    await waitFor(() =>
      expect(screen.getByTestId("price-value-BTC")).toHaveTextContent("$61,000.00"),
    );
    expect(fetchPricesMock).toHaveBeenCalledTimes(2);
  });

  it("mounts <AlertBanner /> when a live price crosses a user threshold", async () => {
    fetchPricesMock
      .mockResolvedValueOnce(makePrices(60000))
      .mockResolvedValueOnce(makePrices(61000));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(<Dashboard pollMs={2000} />);

    await waitFor(() =>
      expect(screen.getByTestId("price-value-BTC")).toHaveTextContent("$60,000.00"),
    );

    await user.type(screen.getByLabelText("Threshold"), "60500");
    await user.click(screen.getByRole("button", { name: /set alert/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    await waitFor(() => expect(screen.getByTestId("alert-banner")).toBeInTheDocument());
    expect(screen.getByTestId("alert-banner")).toHaveTextContent(/BTC/);
  });
});
