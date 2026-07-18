import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceDisplay } from "../../components/PriceDisplay";

describe("<PriceDisplay />", () => {
  it("formats a raw float into US currency", () => {
    render(<PriceDisplay symbol="BTC" name="Bitcoin" price={64250.7} change24h={1.23} />);
    expect(screen.getByTestId("price-value-BTC")).toHaveTextContent("$64,250.70");
  });

  it("renders the symbol and name", () => {
    render(<PriceDisplay symbol="ETH" name="Ethereum" price={3500} change24h={-2.5} />);
    expect(screen.getByText("ETH")).toBeInTheDocument();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
    expect(screen.getByText("-2.50%")).toBeInTheDocument();
  });
});
