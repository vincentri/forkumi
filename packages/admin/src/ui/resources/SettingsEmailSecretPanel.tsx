"use client";

import { useState } from "react";
import { useAdminApi } from "../AdminProvider";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, toast } from "@repo/ui";
import { getErrorMessage } from "../lib/getErrorMessage";

interface Props {
  canUpdate: boolean;
  enabled?: unknown;
}

/**
 * The "Email" tab body inside the Settings keyValue page.
 * Lets the user save a Resend API key.
 */
export function SettingsEmailSecretPanel({ canUpdate, enabled }: Props) {
  const api = useAdminApi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, refetch } = (api.admin as any).emailSettings.get.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateResendApiKey = (api.admin as any).emailSettings.updateResendApiKey.useMutation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendTest = (api.admin as any).emailSettings.sendTest.useMutation();
  const [resendApiKey, setResendApiKey] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  const apiKeyConfigured = Boolean(data?.resendApiKeyConfigured);

  if (enabled !== true) return null;

  async function handleSaveResendKey() {
    try {
      await updateResendApiKey.mutateAsync({ apiKey: resendApiKey });
      setResendApiKey("");
      await refetch();
      toast.success("Resend API key saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSendTest() {
    try {
      const result = await sendTest.mutateAsync({ to: testRecipient });
      toast.success(`Test email sent (${result.id})`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resend secret</CardTitle>
        <CardDescription>
          The API key is write-only. It is encrypted before saving and is never shown again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Resend API key status</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data?.resendApiKeyConfigured ? "A Resend API key is configured." : "No Resend API key has been saved yet."}
            </p>
          </div>
          <Badge variant={data?.resendApiKeyConfigured ? "default" : "secondary"}>
            {data?.resendApiKeyConfigured ? "Configured" : "Missing"}
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-resend-api-key">Replace API key</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="settings-resend-api-key"
              type="password"
              value={resendApiKey}
              placeholder="re_..."
              autoComplete="new-password"
              disabled={!canUpdate || updateResendApiKey.isPending}
              onChange={(event) => setResendApiKey(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={!canUpdate || updateResendApiKey.isPending || !resendApiKey}
              onClick={handleSaveResendKey}
              className="shrink-0"
            >
              {updateResendApiKey.isPending ? "Saving..." : "Save encrypted key"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-test-email">Send test email</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="settings-test-email"
              type="email"
              value={testRecipient}
              placeholder="you@example.com"
              disabled={!canUpdate || sendTest.isPending}
              onChange={(event) => setTestRecipient(event.target.value)}
            />
            <Button
              type="button"
              disabled={!canUpdate || sendTest.isPending || !testRecipient || !data?.enabled || !apiKeyConfigured}
              onClick={handleSendTest}
              className="shrink-0"
            >
              {sendTest.isPending ? "Sending..." : "Send test"}
            </Button>
          </div>
          {(!data?.enabled || !apiKeyConfigured) && (
            <p className="text-xs text-muted-foreground">
              Enable email delivery, save the Settings form, and configure the Resend API key before sending a test.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
