import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CRUDTable } from "../components/CRUDTable";
import type { CRUDConfig } from "../types";

const config: CRUDConfig = {
  model: "product",
  label: "Products",
  fields: [
    { name: "title", type: "text", label: "Title", required: true },
    { name: "published", type: "boolean", label: "Published" },
  ],
};

const rows = [
  { id: "1", title: "Widget A", published: true },
  { id: "2", title: "Widget B", published: false },
];

describe("CRUDTable", () => {
  it("renders column headers from config fields", () => {
    render(<CRUDTable config={config} data={rows} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(<CRUDTable config={config} data={rows} />);
    expect(screen.getByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
  });

  it("renders boolean fields as Yes/No badges", () => {
    render(<CRUDTable config={config} data={rows} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    render(<CRUDTable config={config} data={[]} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it("shows skeleton rows when loading", () => {
    const { container } = render(<CRUDTable config={config} data={[]} isLoading />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
    expect(screen.queryByText("Widget A")).not.toBeInTheDocument();
  });

  it("renders Edit and Delete action buttons when handlers provided", () => {
    render(<CRUDTable config={config} data={rows} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Actions")).toBeInTheDocument();
    // Two rows → two Edit buttons
    expect(screen.getAllByText("Edit")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
  });

  it("calls onEdit with row data when Edit clicked", () => {
    const onEdit = vi.fn();
    render(<CRUDTable config={config} data={rows} onEdit={onEdit} />);
    fireEvent.click(screen.getAllByText("Edit")[0]);
    expect(onEdit).toHaveBeenCalledWith(rows[0]);
  });

  it("calls onDelete with row data when Delete clicked", () => {
    const onDelete = vi.fn();
    render(<CRUDTable config={config} data={rows} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
  });

  it("calls onSort with field and direction when sortable header clicked", () => {
    const onSort = vi.fn();
    render(<CRUDTable config={config} data={rows} onSort={onSort} />);
    fireEvent.click(screen.getByText("Title"));
    expect(onSort).toHaveBeenCalledWith("title", "asc");
  });

  it("toggles sort direction on second click of same header", () => {
    const onSort = vi.fn();
    render(
      <CRUDTable config={config} data={rows} onSort={onSort} sortField="title" sortDir="asc" />,
    );
    fireEvent.click(screen.getByText("Title"));
    expect(onSort).toHaveBeenCalledWith("title", "desc");
  });
});
