"use client";

import { useAdminApi } from "../AdminProvider";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, toast } from "@repo/ui";
import { getErrorMessage } from "../lib/getErrorMessage";

interface Props {
  canUpdate: boolean;
}

/**
 * Panel injected into the General tab of the Front Page Settings page.
 * Resets server-side in-memory caches (login rate-limit + upload-dir resolve)
 * so config / publish changes take effect immediately.
 */
export function ClearCachePanel({ canUpdate }: Props) {
  const api = useAdminApi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clearCache = (api.admin as any).frontPageSettings.clearCache.useMutation();

  async function handleClear() {
    try {
      await clearCache.mutateAsync();
      toast.success("Server cache cleared");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Clear cache</CardTitle>
        <CardDescription>
          Resets server in-memory caches: login rate-limit counters and the upload-directory resolve cache.
          Use this if you locked an IP from too many login attempts, or after changing upload paths.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          disabled={!canUpdate || clearCache.isPending}
          onClick={handleClear}
        >
          {clearCache.isPending ? "Clearing…" : "Clear cache"}
        </Button>
      </CardContent>
    </Card>
  );
}
