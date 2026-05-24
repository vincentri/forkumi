"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminApi } from "../AdminProvider";
import { Button, Input, Label } from "@repo/ui";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { AuthMobileLogo } from "./AuthMobileLogo";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });
type FormData = z.infer<typeof schema>;

export interface AcceptInviteFormProps {
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  appName?: string | null;
}

export function AcceptInviteForm({ logoLightUrl, logoDarkUrl, appName }: AcceptInviteFormProps) {
  const api = useAdminApi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const inviteQuery = api.public.getInvitation.useQuery(
    { token },
    { retry: false, enabled: !!token },
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = api.public.acceptInvitation.useMutation({
    onSuccess: () => router.push("/auth/signin?invited=1"),
  });

  async function onSubmit(data: FormData) {
    await mutation.mutateAsync({ token, name: data.name, password: data.password });
  }

  return (
    <div className="min-h-screen flex">
      <AuthBrandPanel
        tagline={"You've been\ninvited."}
        subtext="Set up your account to join the team."
        logoUrl={logoDarkUrl ?? logoLightUrl}
        appName={appName}
      />

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[360px]">
          <AuthMobileLogo logoUrl={logoLightUrl ?? logoDarkUrl} appName={appName} />

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to {appName || "Admin"}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your account is ready to set up. Choose a name and password to get started.
            </p>
          </div>

          {!token || inviteQuery.isError ? (
            <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <p className="text-sm text-destructive">
                {inviteQuery.error?.message ?? "This invite link is invalid or has expired."}
              </p>
              <Link href="/auth/signin" className="text-sm text-destructive underline-offset-4 hover:underline mt-1 block">
                Back to sign in
              </Link>
            </div>
          ) : inviteQuery.isLoading ? (
            <div className="space-y-3">
              <div className="h-10 rounded-md bg-muted animate-pulse" />
              <div className="h-10 rounded-md bg-muted animate-pulse" />
              <div className="h-10 rounded-md bg-muted animate-pulse" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {mutation.error && (
                <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                  <p className="text-sm text-destructive">{mutation.error.message}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email</Label>
                <Input type="email" value={inviteQuery.data?.email ?? ""} disabled className="h-10 bg-muted text-muted-foreground" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input id="name" type="text" {...register("name")} placeholder="Your name" className="h-10" autoComplete="name" disabled={isSubmitting} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input id="password" type="password" {...register("password")} className="h-10" autoComplete="new-password" disabled={isSubmitting} />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} className="h-10" autoComplete="new-password" disabled={isSubmitting} />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-10 font-medium mt-2">
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-foreground underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
