import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";
import App from "../App.jsx";

vi.mock("../services/api.js", () => ({
  statsApi: { dashboard: () => Promise.resolve({ total_products: 0, total_customers: 0, total_orders: 0, low_stock_products: [] }) },
  productsApi: { list: () => Promise.resolve([]) },
  customersApi: { list: () => Promise.resolve([]) },
  ordersApi: { list: () => Promise.resolve([]) },
  getErrorMessage: () => "error",
}));

test("renders dashboard navigation", async () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByText("InventoryOps")).toBeInTheDocument();
  expect(await screen.findByText("Operations Dashboard")).toBeInTheDocument();
});
