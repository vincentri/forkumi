// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyValuePage } from "../components/KeyValuePage";
import type { CRUDConfig } from "../types";

const config: CRUDConfig = {
  model: "settings",
  label: "Settings",
  fields: [
    { name: "siteName", type: "text", label: "Site Name" },
    { name: "siteDescription", type: "textarea", label: "Site Description" },
  ],
};

const data = {
  siteName: "My Site",
  siteDescription: "A great site",
};

describe("KeyValuePage", () => {
  it("renders field labels", () => {
    render(<KeyValuePage config={config} data={data} onSave={vi.fn()} />);
    expect(screen.getByText("Site Name")).toBeInTheDocument();
    expect(screen.getByText("Site Description")).toBeInTheDocument();
  });

  it("populates inputs with data values", () => {
    render(<KeyValuePage config={config} data={data} onSave={vi.fn()} />);
    expect(screen.getByPlaceholderText("Site Name")).toHaveValue("My Site");
    expect(screen.getByPlaceholderText("Site Description")).toHaveValue("A great site");
  });

  it("renders Save button", () => {
    render(<KeyValuePage config={config} data={data} onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("calls onSave with form data when submitted", async () => {
    const onSave = vi.fn();
    render(<KeyValuePage config={config} data={data} onSave={onSave} />);
    await userEvent.clear(screen.getByPlaceholderText("Site Name"));
    await userEvent.type(screen.getByPlaceholderText("Site Name"), "New Site");
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it("shows saving state when saving prop is true", () => {
    render(<KeyValuePage config={config} data={data} onSave={vi.fn()} saving />);
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("renders tabbed form when fields have tab property", () => {
    const tabConfig: CRUDConfig = {
      model: "settings",
      label: "Settings",
      fields: [
        { name: "siteName", type: "text", label: "Site Name", tab: "General" },
        { name: "metaTitle", type: "text", label: "Meta Title", tab: "SEO" },
      ],
    };
    render(<KeyValuePage config={tabConfig} data={data} onSave={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /seo/i })).toBeInTheDocument();
  });

  it("renders boolean fields as switches", () => {
    const boolConfig: CRUDConfig = {
      model: "settings",
      label: "Settings",
      fields: [
        { name: "maintenance", type: "boolean", label: "Maintenance Mode" },
      ],
    };
    render(<KeyValuePage config={boolConfig} data={{ maintenance: "true" }} onSave={vi.fn()} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByText("Maintenance Mode")).toBeInTheDocument();
  });
});
