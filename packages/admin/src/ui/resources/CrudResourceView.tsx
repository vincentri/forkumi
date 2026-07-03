"use client";

import { useState } from "react";
import { useAdminApi } from "../AdminProvider";
import { CRUDPage, type CRUDConfig, type QueryState, singularize } from "@repo/crud";
import { Button, toast } from "@repo/ui";
import { downloadCsv } from "../lib/csv-download";
import { getErrorMessage } from "../lib/getErrorMessage";
import { withToast } from "../lib/withToast";
import { CreateUserModal } from "../CreateUserModal";
import { InviteUserModal } from "../InviteUserModal";
import { InviteLinkModal } from "./InviteLinkModal";
import { useDynamicOptions } from "./useDynamicOptions";
import type { CRUDRouter } from "./types";

interface Props {
  config: CRUDConfig;
  m: CRUDRouter;
  permissions: string[];
  isProtectedRole: boolean;
  currentUserEmail?: string;
}

/**
 * Renders a list+form resource (the default CRUD mode).
 * Handles user-specific extras: Create User / Invite User header actions, Invite link row action,
 * revoke-invite-on-delete logic. Everything else delegates to CRUDPage.
 */
export function CrudResourceView({ config, m, permissions, isProtectedRole, currentUserEmail }: Props) {
  const api = useAdminApi();
  const [query, setQuery] = useState<QueryState>({ page: 1, search: undefined, sortField: undefined, sortDir: "asc" });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [inviteLinkRow, setInviteLinkRow] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading, isError, refetch } = m.list.useQuery(query, {
    refetchOnMount: "always",
    gcTime: 0,
  });

  const createMutation = m.create?.useMutation({ onSuccess: () => refetch() });
  const updateMutation = m.update?.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = m.delete?.useMutation({ onSuccess: () => refetch() });
  const bulkDeleteMutation = m.bulkDelete?.useMutation({ onSuccess: () => refetch() });
  const exportCsvMutation = m.exportCsv?.useMutation();
  const revokeInviteMutation = config.model === "user"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (api.admin as any).user.revokeInvite.useMutation({ onSuccess: () => refetch() })
    : null;

  const { runtimeConfig, optionsLoading, optionsError } = useDynamicOptions(config, m);

  const isReadOnly = config.readOnly === true;
  const isCreatable = config.creatable !== false;
  const isEditable = config.editable !== false;
  const isDeletable = config.deletable !== false;

  const hasPermission = (action: string) =>
    isProtectedRole ||
    permissions.includes(`${config.model}:${action}`) ||
    permissions.includes(`*:${action}`);

  const canCreate = hasPermission("create");
  const canUpdate = hasPermission("update");
  const canDelete = hasPermission("delete");

  const emptyState = config.model === "role" ? (
    <div className="flex flex-col items-center gap-3">
      <p className="text-base font-semibold text-foreground">No roles yet</p>
      <p className="text-sm text-muted-foreground">Create your first role to enable permissions.</p>
    </div>
  ) : undefined;

  const extraHeaderActions = config.model === "user" ? (
    <>
      <Button onClick={() => setCreateUserOpen(true)}>New User</Button>
      <Button variant="outline" onClick={() => setInviteOpen(true)}>Invite User</Button>
      <CreateUserModal
        open={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        onSuccess={refetch}
      />
      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={refetch} />
      {inviteLinkRow && (
        <InviteLinkModal
          email={inviteLinkRow.email as string}
          open={!!inviteLinkRow}
          onClose={() => setInviteLinkRow(null)}
        />
      )}
    </>
  ) : undefined;

  const rowAction = config.model === "user" && canCreate
    ? (row: Record<string, unknown>) => { setInviteLinkRow(row); }
    : undefined;

  const rowActionVisible = config.model === "user" && canCreate
    ? (row: Record<string, unknown>) => !!row.hasPendingInvite
    : undefined;

  const singularLabel = singularize(config.label);

  const onCreate = !isReadOnly && isCreatable && canCreate && createMutation && config.model !== "user"
    ? withToast(singularLabel, "created", async (data: Record<string, unknown>) => {
        const result = await createMutation.mutateAsync(data);
        return result as { id?: string };
      })
    : undefined;

  const onUpdate = !isReadOnly && isEditable && canUpdate && updateMutation
    ? withToast(singularLabel, "updated", async (id: string, data: Record<string, unknown>) => {
        await updateMutation.mutateAsync({ id, data });
      })
    : undefined;

  // delete has dynamic success ("Invite revoked" vs "X deleted") so it keeps an inline try/catch
  const onDelete = !isReadOnly && isDeletable && canDelete && deleteMutation
    ? async (id: string, row: Record<string, unknown>) => {
        try {
          if (row?.isPendingInvite && revokeInviteMutation) {
            await revokeInviteMutation.mutateAsync({ email: row.email as string });
            toast.success("Invite revoked");
          } else {
            await deleteMutation.mutateAsync({ id });
            toast.success(`${singularLabel} deleted`);
          }
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      }
    : undefined;

  // bulkDelete uses a count-based success message, so it keeps an inline try/catch
  const onBulkDelete = !isReadOnly && isDeletable && canDelete && bulkDeleteMutation
    ? async (ids: string[]) => {
        try {
          await bulkDeleteMutation.mutateAsync({ ids });
          toast.success(`${ids.length} ${ids.length === 1 ? singularLabel : config.label} deleted`);
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      }
    : undefined;

  // duplicate uses a one-off message ("duplicated")
  const onDuplicate = !isReadOnly && canCreate && createMutation && config.model !== "user"
    ? async (row: Record<string, unknown>) => {
        const skip = new Set(["id", "createdAt", "updatedAt"]);
        const data: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          if (skip.has(k)) continue;
          const field = config.fields.find((f) => f.name === k);
          if (field?.unique && typeof v === "string" && v !== "") {
            const suffix = Math.random().toString(36).slice(2, 7);
            data[k] = v.includes("@") ? v.replace("@", `_${suffix}@`) : `${v}_${suffix}`;
          } else {
            data[k] = v;
          }
        }
        try {
          await createMutation.mutateAsync(data);
          toast.success(`${singularLabel} duplicated`);
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      }
    : undefined;

  // exportCsv has a one-off message ("CSV exported")
  const onExportCsv = exportCsvMutation
    ? async (state: Pick<QueryState, "sortField" | "sortDir" | "filters">) => {
        try {
          const result = await exportCsvMutation.mutateAsync(state);
          downloadCsv(result.filename, result.csv);
          toast.success("CSV exported");
        } catch (err) {
          toast.error(getErrorMessage(err));
          throw err;
        }
      }
    : undefined;

  return (
    <CRUDPage
      config={runtimeConfig}
      listData={data}
      isLoading={isLoading || optionsLoading}
      isError={isError || optionsError}
      onRefetch={refetch}
      onQueryChange={setQuery}
      modelApi={m}
      emptyState={emptyState}
      extraHeaderActions={extraHeaderActions}
      onRowAction={rowAction}
      rowActionLabel="Invite link"
      rowActionVisible={rowActionVisible}
      onDuplicate={onDuplicate}
      onExportCsv={onExportCsv}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onBulkDelete={onBulkDelete}
      currentUserEmail={config.model === "user" ? currentUserEmail : undefined}
    />
  );
}
