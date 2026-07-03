"use client";

import { useState } from "react";
import { useAdminApi } from "../AdminProvider";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, toast } from "@repo/ui";
import { getErrorMessage } from "../lib/getErrorMessage";
import { InviteLinkDisplay } from "./InviteLinkDisplay";

interface Props {
  email: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal for generating a fresh invite link for a user who already has a pending invite.
 * Renders InviteLinkDisplay for the post-generation state.
 */
export function InviteLinkModal({ email, open, onClose }: Props) {
  const api = useAdminApi();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mutation = (api.admin as any).user.resendInvite.useMutation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendInviteEmailMutation = (api.admin as any).user.sendInviteEmail.useMutation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailSettingsQuery = (api.admin as any).emailSettings.get.useQuery(undefined, { enabled: open });
  const emailDeliveryEnabled = emailSettingsQuery?.data?.enabled === true;

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    try {
      const result = await mutation.mutateAsync({ email });
      setInviteUrl(result.inviteUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendInviteEmail() {
    if (!inviteUrl) return;
    setSendingEmail(true);
    try {
      await sendInviteEmailMutation.mutateAsync({ email, inviteUrl });
    } finally {
      setSendingEmail(false);
    }
  }

  function handleClose() {
    setInviteUrl(null);
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
            <InviteLinkDisplay
              url={inviteUrl}
              email={email}
              emailDeliveryEnabled={emailDeliveryEnabled}
              sendingEmail={sendingEmail}
              onSendEmail={handleSendInviteEmail}
              onDone={handleClose}
            />
          ) : (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="button" onClick={handleGenerate} disabled={generating}>
                {generating ? "Generating..." : "Generate link"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
