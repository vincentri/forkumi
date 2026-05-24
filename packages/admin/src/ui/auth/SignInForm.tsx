"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { AuthMobileLogo } from "./AuthMobileLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label } from "@repo/ui";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export interface SignInFormProps {
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  appName?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
}

export function SignInForm({ logoLightUrl, logoDarkUrl, appName, heroTitle, heroSubtitle }: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const invitedParam = searchParams.get("invited");
  const [banner] = useState<"invited" | null>(invitedParam === "1" ? "invited" : null);

  useEffect(() => {
    if (invitedParam === "1") {
      const url = new URL(window.location.href);
      url.searchParams.delete("invited");
      window.history.replaceState({}, "", url.toString());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [serverError, setServerError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const isBusy = isSubmitting || isRedirecting;

  async function onSubmit(data: SignInFormData) {
    setServerError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setServerError("Invalid email or password.");
      return;
    }
    setIsRedirecting(true);
    router.push(callbackUrl);
  }

  return (
    <div className="min-h-screen flex">
      <AuthBrandPanel
        tagline={heroTitle || "Everything you need\nto run your app."}
        subtext={heroSubtitle || "Users, roles, permissions, and audit logs — all in one place."}
        logoUrl={logoDarkUrl ?? logoLightUrl}
        appName={appName}
      />

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[360px]">
          <AuthMobileLogo logoUrl={logoLightUrl ?? logoDarkUrl} appName={appName} />

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>
          </div>

          {banner === "invited" && (
            <div className="mb-6 rounded-lg bg-muted px-3 py-2.5">
              <p className="text-sm text-foreground">Account created. Sign in to get started.</p>
            </div>
          )}

          {serverError && (
            <div role="alert" className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="you@example.com" className="h-10" autoComplete="email" disabled={isBusy} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input id="password" type="password" {...register("password")} className="h-10" autoComplete="current-password" disabled={isBusy} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isBusy} className="w-full h-10 font-medium mt-2">
              {isBusy ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
