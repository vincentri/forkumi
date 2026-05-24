"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { CRUDFieldMulticheck } from "../../types";

interface Props {
  field: CRUDFieldMulticheck;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
}

// Detect if the options use "model:action" permission format
function isPermissionOptions(options: { value: string; label: string }[]): boolean {
  return options.length > 0 && options.every((o) => /^[\w*]+:[a-z]+$/.test(o.value));
}

function PermissionMatrix({
  options,
  checked,
  onChange,
  fieldName,
  readOnly,
}: {
  options: { value: string; label: string }[];
  checked: string[];
  onChange: (next: string[]) => void;
  fieldName: string;
  readOnly?: boolean;
}) {
  // Track which rows have "All" active — when All is on, individual cells are disabled
  const [lockedRows, setLockedRows] = useState<Set<string>>(() => {
    // Pre-lock any row where all values are already checked on mount
    const initial = new Set<string>();
    const actionSet = new Set<string>();
    const resourceSet = new Set<string>();
    options.forEach((o) => {
      const [resource, action] = o.value.split(":");
      resourceSet.add(resource);
      actionSet.add(action);
    });
    const actionOrder = ["view", "read", "create", "update", "delete"];
    const actions = actionOrder.filter((a) => actionSet.has(a)).concat(
      [...actionSet].filter((a) => !actionOrder.includes(a)).sort()
    );
    resourceSet.forEach((resource) => {
      const rowValues = actions
        .map((a) => `${resource}:${a}`)
        .filter((v) => options.some((o) => o.value === v));
      if (rowValues.length > 0 && rowValues.every((v) => checked.includes(v))) {
        initial.add(resource);
      }
    });
    return initial;
  });

  // Parse model:action → build matrix
  const actionSet = new Set<string>();
  const resourceSet = new Set<string>();
  options.forEach((o) => {
    const [resource, action] = o.value.split(":");
    resourceSet.add(resource);
    actionSet.add(action);
  });

  // Canonical action column order
  const actionOrder = ["view", "read", "create", "update", "delete"];
  const actions = actionOrder.filter((a) => actionSet.has(a)).concat(
    [...actionSet].filter((a) => !actionOrder.includes(a)).sort()
  );

  // Resources: wildcard (*) first, then alphabetical
  const resources = [...resourceSet].sort((a, b) => {
    if (a === "*") return -1;
    if (b === "*") return 1;
    return a.localeCompare(b);
  });

  // Pretty-print resource names
  const resourceLabel = (r: string) => {
    if (r === "*") return "All (wildcard)";
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  const rowValues = (resource: string) =>
    actions
      .map((a) => `${resource}:${a}`)
      .filter((v) => options.some((o) => o.value === v));

  const toggle = (value: string, on: boolean) => {
    const next = on ? [...checked, value] : checked.filter((v) => v !== value);
    onChange(next);
  };

  const toggleRow = (resource: string, on: boolean) => {
    const vals = rowValues(resource);
    if (on) {
      // Check all + lock individual cells
      onChange([...new Set([...checked, ...vals])]);
      setLockedRows((prev) => new Set([...prev, resource]));
    } else {
      // Uncheck All → uncheck all cells and unlock row
      onChange(checked.filter((v) => !vals.includes(v)));
      setLockedRows((prev) => {
        const next = new Set(prev);
        next.delete(resource);
        return next;
      });
    }
  };

  const rowChecked = (resource: string) => {
    const vals = rowValues(resource);
    return vals.length > 0 && vals.every((v) => checked.includes(v));
  };

  const rowIndeterminate = (resource: string) => {
    const vals = rowValues(resource);
    const count = vals.filter((v) => checked.includes(v)).length;
    return count > 0 && count < vals.length;
  };

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground w-36">Resource</th>
            {actions.map((action) => (
              <th key={action} className="px-2 py-2 text-center font-medium text-muted-foreground capitalize min-w-[60px]">
                {action}
              </th>
            ))}
            <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">All</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource, i) => {
            const isLocked = lockedRows.has(resource);
            return (
              <tr
                key={resource}
                className={[
                  "border-b border-border last:border-0",
                  resource === "*" ? "bg-primary/5" : i % 2 === 0 ? "" : "bg-muted/20",
                ].join(" ")}
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  {resourceLabel(resource)}
                </td>
                {actions.map((action) => {
                  const val = `${resource}:${action}`;
                  const exists = options.some((o) => o.value === val);
                  return (
                    <td key={action} className="px-2 py-2 text-center">
                      {exists ? (
                        <input
                          type="checkbox"
                          id={`${fieldName}-${val}`}
                          className={[
                            "h-4 w-4 rounded border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            readOnly ? "cursor-not-allowed opacity-50" : isLocked ? "pointer-events-none cursor-not-allowed" : "cursor-pointer",
                          ].join(" ")}
                          checked={checked.includes(val)}
                          disabled={readOnly}
                          onChange={(e) => toggle(val, e.target.checked)}
                        />
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    className={[
                      "h-4 w-4 rounded border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      readOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    ].join(" ")}
                    checked={rowChecked(resource)}
                    disabled={readOnly}
                    ref={(el) => {
                      if (el) el.indeterminate = !readOnly && rowIndeterminate(resource);
                    }}
                    onChange={(e) => toggleRow(resource, e.target.checked)}
                    aria-label={`Toggle all ${resourceLabel(resource)} permissions`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MulticheckField({ field, control, readOnly }: Props) {
  const useMatrix = isPermissionOptions(field.options);

  return (
    <Controller
      name={field.name}
      control={control}
      defaultValue={[]}
      render={({ field: { value, onChange } }) => {
        const checked = Array.isArray(value) ? (value as string[]) : [];

        if (useMatrix) {
          return (
            <PermissionMatrix
              options={field.options}
              checked={checked}
              onChange={onChange}
              fieldName={field.name}
              readOnly={readOnly}
            />
          );
        }

        // Fallback: flat list for non-permission multicheck
        return (
          <fieldset className="space-y-2 border-none p-0 m-0">
            <legend className="sr-only">{field.label}</legend>
            {field.options.map((opt) => (
              <label key={opt.value} className={["flex items-center gap-2", readOnly ? "cursor-not-allowed" : "cursor-pointer"].join(" ")}>
                <input
                  type="checkbox"
                  id={`${field.name}-${opt.value}`}
                  className={[
                    "h-4 w-4 rounded border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    readOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                  ].join(" ")}
                  checked={checked.includes(opt.value)}
                  disabled={readOnly}
                  onChange={(e) => {
                    if (readOnly) return;
                    const next = e.target.checked
                      ? [...checked, opt.value]
                      : checked.filter((v) => v !== opt.value);
                    onChange(next);
                  }}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </fieldset>
        );
      }}
    />
  );
}
