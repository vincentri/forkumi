"use client";

import { useState } from "react";
import { Button, Input, Label, toast } from "@repo/ui";
import { getErrorMessage } from "../lib/getErrorMessage";

interface InviteLinkDisplayProps {
  url: string;
  email: string;
  emailDeliveryEnabled: boolean;
  sendingEmail: boolean;
  onSendEmail: () => void | Promise<void>;
  onDone: () => void;
  description?: string;
}

/**
 * The "here's your invite link, copy it / email it" UI shared by:
 * - InviteLinkModal (resend a link to an existing pending invite)
 * - InviteUserModal (post-create, after a new invite is generated)
 */
export function InviteLinkDisplay({
  url,
  email,
  emailDeliveryEnabled,
  sendingEmail,
  onSendEmail,
  onDone,
  description,
}: InviteLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSendEmail() {
    try {
      await onSendEmail();
      toast.success(`Invitation email sent to ${email}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="space-y-1.5">
        {description && <Label className="text-sm font-medium">{description}</Label>}
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={url}
            className="h-10 text-xs font-mono bg-muted"
            onFocus={(e) => e.target.select()}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        This link expires in 7 days. Share it with the user — they will set their own password on sign-up.
      </p>
      <div className="flex justify-end gap-2">
        {emailDeliveryEnabled && (
          <Button
            type="button"
            onClick={handleSendEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? "Sending..." : "Send email invitation"}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
