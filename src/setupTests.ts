// Setup file for Vitest
import "@testing-library/jest-dom";
import "vitest-dom/extend-expect";
import { vi } from "vitest";

// Set up global mocks
beforeEach(() => {
  // Reset all mocks before each test
  vi.resetAllMocks();
});
