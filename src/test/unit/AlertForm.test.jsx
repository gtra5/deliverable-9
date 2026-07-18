import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertForm } from "../../components/AlertForm";

describe("<AlertForm />", () => {
  it("updates local state on input and submits parsed values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AlertForm onSubmit={onSubmit} />);

    const coin = screen.getByLabelText("Coin");
    const direction = screen.getByLabelText("Direction");
    const threshold = screen.getByLabelText("Threshold");

    await user.selectOptions(coin, "ethereum");
    await user.selectOptions(direction, "below");
    await user.type(threshold, "3500");

    expect(coin.value).toBe("ethereum");
    expect(direction.value).toBe("below");
    expect(threshold.value).toBe("3500");

    await user.click(screen.getByRole("button", { name: /set alert/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      coin: "ethereum",
      direction: "below",
      threshold: 3500,
    });
    expect(screen.getByLabelText("Threshold").value).toBe("");
  });

  it("ignores invalid non-numeric thresholds", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AlertForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /set alert/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
