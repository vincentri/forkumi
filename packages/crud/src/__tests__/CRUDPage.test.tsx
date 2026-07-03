// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CRUDPage } from "../components/CRUDPage";
import type { CRUDConfig } from "../types";

const config: CRUDConfig = {
  model: "product",
  label: "Products",
  fields: [
    { name: "title", type: "text", label: "Title", required: true },
  ],
};

const listData = {
  items: [{ id: "1", title: "Widget A" }],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

describe("CRUDPage", () => {
  it("renders error banner when isError is true", () => {
    render(<CRUDPage config={config} isError />);
    expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
  });

  it("does not render error banner when isError is false", () => {
    render(<CRUDPage config={config} listData={listData} />);
    expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
  });

  it("does not render error banner when isError is undefined", () => {
    render(<CRUDPage config={config} />);
    expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
  });

  it("renders New button when onCreate is provided", () => {
    render(<CRUDPage config={config} onCreate={vi.fn()} />);
    expect(screen.getByText("+ New Product")).toBeInTheDocument();
  });

  it("does not render New button when onCreate is not provided", () => {
    render(<CRUDPage config={config} />);
    expect(screen.queryByText("+ New Product")).not.toBeInTheDocument();
  });

  it("renders table with items when listData is provided", () => {
    render(<CRUDPage config={config} listData={listData} />);
    expect(screen.getByText("Widget A")).toBeInTheDocument();
  });

  it("does not render a global search input", () => {
    render(<CRUDPage config={config} listData={listData} />);
    expect(screen.queryByPlaceholderText(/search products/i)).not.toBeInTheDocument();
  });

  it("renders extraHeaderActions when provided", () => {
    render(<CRUDPage config={config} extraHeaderActions={<button>Invite User</button>} />);
    expect(screen.getByText("Invite User")).toBeInTheDocument();
  });

  it("does not render extraHeaderActions when absent", () => {
    render(<CRUDPage config={config} />);
    expect(screen.queryByText("Invite User")).not.toBeInTheDocument();
  });

  it("renders pagination when listData has multiple pages", () => {
    const multiPageData = { ...listData, total: 50, totalPages: 3 };
    render(<CRUDPage config={config} listData={multiPageData} />);
    expect(screen.getByText(/showing 1–20 of 50/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
  });

  it("renders Prev button on page 2+", () => {
    const page2Data = { ...listData, page: 2, total: 50, totalPages: 3 };
    render(<CRUDPage config={config} listData={page2Data} />);
    expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
  });

  it("does not render pagination when total is 0", () => {
    const emptyData = { ...listData, items: [], total: 0, totalPages: 0 };
    render(<CRUDPage config={config} listData={emptyData} />);
    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
  });
});
