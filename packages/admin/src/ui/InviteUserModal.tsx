"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminApi } from "./AdminProvider";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@repo/ui";
import { TRPCClientError } from "@trpc/client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

function getErrorMessage(err: unknown): string {
  if (err instanceof TRPCClientError) {
    try {
      const issues = JSON.parse(err.message);
      if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
    } catch {
      // not JSON
    }
    return err.message;
  }
  return (err as Error)?.message ?? "Something went wrong";
}

export interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ open, onClose, onSuccess }: InviteUserModalProps) {
  const api = useAdminApi();
  const [serverError, setServerError] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const rolesQuery = (api.admin as any).role.list.useQuery({ page: 1, pageSize: 100 }, { enabled: open });
  const roles: Array<{ id: string; name: string }> = rolesQuery.data?.items ?? [];

  const mutation = (api.admin as any).user.invite.useMutation();

  function handleClose() {
    reset();
    setServerError("");
    setRoleId("");
    setInviteUrl(null);
    setCopied(false);
    onClose();
  }

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const result = await mutation.mutateAsync({ email: data.email, roleId: roleId || undefined });
      setInviteUrl(result.inviteUrl);
      toast.success(`Invite created for ${data.email}`);
      onSuccess?.();
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            {inviteUrl
              ? "Invite created. Copy the link below and send it to the user."
              : "Create an invitation link to add a new user to the app."}
          </DialogDescription>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Invite link</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteUrl}
                  className="h-10 text-xs font-mono bg-muted"
                  onFocus={(e) => e.target.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This link expires in 7 days. Share it with the user — they will set their own password on sign-up.
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" noValidate>
            {serverError && (
              <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                <p className="text-sm text-destructive">{serverError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-sm font-medium">Email</Label>
              <Input
                id="invite-email"
                type="email"
                {...register("email")}
                placeholder="user@example.com"
                className="h-10"
                autoComplete="off"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role" className="text-sm font-medium">
                Role <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={isSubmitting}>
                <SelectTrigger id="invite-role" className="h-10">
                  <SelectValue placeholder="No role assigned" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create invite"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
