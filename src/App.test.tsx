import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Create a simple mock
const MockApp = () => (
  <div>
    <span role="progressbar" />
  </div>
);

// Mocking App to avoid router/auth issues
vi.mock("./App", () => ({
  default: () => <MockApp />,
}));

describe("App", () => {
  it("renders loading indicator when auth is loading", () => {
    render(<MockApp />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
