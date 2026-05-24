"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminApi } from "./AdminProvider";
import { CRUDPage, KeyValuePage } from "@repo/crud";
import type { CRUDConfig, CRUDFieldSelect, QueryState, SelectOption } from "@repo/crud";
import { TRPCClientError } from "@trpc/client";
import { AlertTriangle, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, toast } from "@repo/ui";
import { InviteUserModal } from "./InviteUserModal";
import { CreateUserModal } from "./CreateUserModal";

function getErrorMessage(err: unknown): string {
  if (err instanceof TRPCClientError) {
    try {
      const issues = JSON.parse(err.message);
      if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
    } catch {
      // not JSON — fall through
    }
    return err.message;
  }
  return (err as Error)?.message ?? "Something went wrong";
}

type CRUDRouter = {
  list: { useQuery: (input: QueryState) => { data: any; isLoading: boolean; isError: boolean; refetch: () => void } };
  options?: { useQuery: (input?: undefined, opts?: { enabled?: boolean }) => { data?: Record<string, SelectOption[]>; isLoading: boolean; isError: boolean } };
  create?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (data: Record<string, unknown>) => Promise<unknown> } };
  update?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (input: { id: string; data: Record<string, unknown> }) => Promise<unknown> } };
  delete?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (input: { id: string }) => Promise<unknown> } };
  bulkDelete?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (input: { ids: string[] }) => Promise<unknown> } };
};

function InviteLinkModal({ email, open, onClose }: { email: string; open: boolean; onClose: () => void }) {
  const api = useAdminApi();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const mutation = (api.admin as any).user.resendInvite.useMutation();

  async function handleGenerate() {
    setError("");
    try {
      const result = await mutation.mutateAsync({ email });
      setInviteUrl(result.inviteUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setInviteUrl(null);
    setCopied(false);
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite link</DialogTitle>
          <DialogDescription>
            {inviteUrl
              ? "Copy this link and send it to the user."
              : `Generate a fresh invite link for ${email}. The previous link will be invalidated.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {error && (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {inviteUrl ? (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={inviteUrl}
                    className="h-10 text-xs font-mono bg-muted"
                    onFocus={(e) => e.target.select()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires in 7 days.
              </p>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>Done</Button>
              </div>
            </>
          ) : (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="button" onClick={handleGenerate} disabled={mutation.isPending}>
                {mutation.isPending ? "Generating..." : "Generate link"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KeyValueResourceInner({ config, m }: { config: CRUDConfig; m: any }) {
  const router = useRouter();
  const { data, isLoading } = m.get.useQuery();
  const updateMutation = m.update.useMutation({
    onSuccess: () => {},
  });

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{config.label}</h1>
      <KeyValuePage
        config={config}
        data={data ?? {}}
        saving={updateMutation.isPending}
        onSave={async (values) => {
          try {
            await updateMutation.mutateAsync({ data: values });
            toast.success("Saved");
            router.refresh();
          } catch (err) {
            toast.error(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}

function CRUDResourceInner({ config, m, permissions, isProtectedRole, currentUserEmail }: { config: CRUDConfig; m: CRUDRouter; permissions: string[]; isProtectedRole: boolean; currentUserEmail?: string }) {
  const api = useAdminApi();
  const [query, setQuery] = useState<QueryState>({ page: 1, search: undefined, sortField: undefined, sortDir: "asc" });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [inviteLinkRow, setInviteLinkRow] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading, isError, refetch } = m.list.useQuery(query);

  const createMutation = m.create?.useMutation({ onSuccess: () => refetch() });
  const updateMutation = m.update?.useMutation({ onSuccess: () => refetch() });
  const deleteMutation = m.delete?.useMutation({ onSuccess: () => refetch() });
  const bulkDeleteMutation = m.bulkDelete?.useMutation({ onSuccess: () => refetch() });
  const revokeInviteMutation = config.model === "user" ? (api.admin as any).user.revokeInvite.useMutation({ onSuccess: () => refetch() }) : null;
  const shouldLoadOptions = config.fields.some(
    (field) => field.type === "select" && Boolean(field.optionsFrom || field.hasDynamicOptions),
  );
  const optionsQuery = m.options?.useQuery(undefined, { enabled: shouldLoadOptions });

  const runtimeConfig = useMemo<CRUDConfig>(() => {
    const dynamicOptions = optionsQuery?.data;
    if (!dynamicOptions) return config;

    return {
      ...config,
      fields: config.fields.map((field) => {
        if (field.type !== "select") return field;
        const options = dynamicOptions[field.name];
        return options ? ({ ...field, options } as CRUDFieldSelect) : field;
      }),
    };
  }, [config, optionsQuery?.data]);

  const isReadOnly = config.readOnly === true;
  const isDeletable = config.deletable !== false;

  const hasPermission = (action: string) =>
    isProtectedRole ||
    permissions.includes(`${config.model}:${action}`) ||
    permissions.includes(`*:${action}`);

  const canCreate = hasPermission("create");
  const canUpdate = hasPermission("update");
  const canDelete = hasPermission("delete");

  const emptyState =
    config.model === "role" ? (
      <div className="flex flex-col items-center gap-3">
        <p className="text-base font-semibold text-foreground">No roles yet</p>
        <p className="text-sm text-muted-foreground">Create your first role to enable permissions.</p>
      </div>
    ) : undefined;

  const extraHeaderActions = config.model === "user" ? (
    <>
      <Button onClick={() => setCreateUserOpen(true)}>
        New User
      </Button>
      <Button
        variant="outline"
        onClick={() => setInviteOpen(true)}
      >
        Invite User
      </Button>
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

  const duplicateHandler = !isReadOnly && canCreate && createMutation && config.model !== "user"
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
          toast.success(`${config.label.replace(/s$/, "")} duplicated`);
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
      isLoading={isLoading || (optionsQuery?.isLoading ?? false)}
      isError={isError || (optionsQuery?.isError ?? false)}
      onRefetch={refetch}
      onQueryChange={setQuery}
      emptyState={emptyState}
      extraHeaderActions={extraHeaderActions}
      onRowAction={rowAction}
      rowActionLabel="Invite link"
      rowActionVisible={rowActionVisible}
      onDuplicate={duplicateHandler}
      onCreate={!isReadOnly && canCreate && createMutation && config.model !== "user"
        ? async (data) => {
            try {
              const result = await createMutation.mutateAsync(data);
              toast.success(`${config.label.replace(/s$/, "")} created`);
              return result as { id?: string };
            } catch (err) {
              toast.error(getErrorMessage(err));
              throw err;
            }
          }
        : undefined}
      onUpdate={!isReadOnly && canUpdate && updateMutation
        ? async (id, data) => {
            try {
              await updateMutation.mutateAsync({ id, data });
              toast.success(`${config.label.replace(/s$/, "")} updated`);
            } catch (err) {
              toast.error(getErrorMessage(err));
              throw err;
            }
          }
        : undefined}
      onDelete={!isReadOnly && isDeletable && canDelete && deleteMutation
        ? async (id, row) => {
            try {
              if (row?.isPendingInvite && revokeInviteMutation) {
                await revokeInviteMutation.mutateAsync({ email: row.email as string });
                toast.success("Invite revoked");
              } else {
                await deleteMutation.mutateAsync({ id });
                toast.success(`${config.label.replace(/s$/, "")} deleted`);
              }
            } catch (err) {
              toast.error(getErrorMessage(err));
              throw err;
            }
          }
        : undefined}
      onBulkDelete={!isReadOnly && isDeletable && canDelete && bulkDeleteMutation
        ? async (ids) => {
            try {
              await bulkDeleteMutation.mutateAsync({ ids });
              toast.success(`${ids.length} ${ids.length === 1 ? config.label.replace(/s$/, "") : config.label} deleted`);
            } catch (err) {
              toast.error(getErrorMessage(err));
              throw err;
            }
          }
        : undefined}
      currentUserEmail={config.model === "user" ? currentUserEmail : undefined}
    />
  );
}

export interface CRUDResourceClientProps {
  config: CRUDConfig;
  permissions: string[];
  isProtectedRole: boolean;
  currentUserEmail?: string;
}

export function CRUDResourceClient({ config, permissions, isProtectedRole, currentUserEmail }: CRUDResourceClientProps) {
  const api = useAdminApi();
  const m = (api.admin as Record<string, unknown>)[config.model] as CRUDRouter | undefined;

  if (!m) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex max-w-[520px] flex-col items-center gap-4 rounded-lg border border-destructive/30 p-10 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Model not registered</h2>
          <p className="text-sm text-muted-foreground">
            The &ldquo;{config.model}&rdquo; admin router is not set up. Did you run{" "}
            <code className="font-mono">pnpm crud:scaffold {config.model}</code> and{" "}
            <code className="font-mono">pnpm db:push</code>?
          </p>
        </div>
      </div>
    );
  }

  if (config.mode === "keyValue") {
    return <KeyValueResourceInner config={config} m={m} />;
  }

  return <CRUDResourceInner config={config} m={m} permissions={permissions} isProtectedRole={isProtectedRole} currentUserEmail={currentUserEmail} />;
}
