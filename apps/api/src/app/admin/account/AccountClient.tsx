"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { api } from "~/lib/trpc/client";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, toast } from "@repo/ui";

interface AccountClientProps {
  initialEmail: string;
  initialName: string;
}

type ProfileFormValues = {
  name: string;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function AccountClient({ initialEmail, initialName }: AccountClientProps) {
  const { update: updateSession } = useSession();
  const profileQuery = api.account.getProfile.useQuery();
  const updateProfile = api.account.updateProfile.useMutation();
  const updatePassword = api.account.updatePassword.useMutation();
  const profileForm = useForm<ProfileFormValues>({
    defaultValues: { name: initialName },
  });
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      profileForm.reset({ name: profileQuery.data.name ?? "" });
    }
  }, [profileForm, profileQuery.data]);

  async function handleProfileSubmit(values: ProfileFormValues) {
    try {
      const updated = await updateProfile.mutateAsync(values);
      await updateSession({ name: updated.name });
      profileForm.reset({ name: updated.name ?? "" });
      toast.success("Profile updated");
    } catch (err) {
      toast.error((err as Error)?.message ?? "Failed to update profile");
    }
  }

  async function handlePasswordSubmit(values: PasswordFormValues) {
    try {
      await updatePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      toast.success("Password updated");
    } catch (err) {
      toast.error((err as Error)?.message ?? "Failed to update password");
    }
  }

  const isProfileSaving = updateProfile.isPending;
  const isPasswordSaving = updatePassword.isPending;
  const email = profileQuery.data?.email ?? initialEmail;
  const profileErrors = profileForm.formState.errors;
  const passwordErrors = passwordForm.formState.errors;
  const newPassword = passwordForm.watch("newPassword");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your profile name and password.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your email is used for login and cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <Input id="account-email" value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                {...profileForm.register("name", {
                  required: "Name is required",
                  minLength: { value: 1, message: "Name is required" },
                  maxLength: { value: 100, message: "Name is too long" },
                })}
                placeholder="Your name"
                disabled={isProfileSaving}
                aria-invalid={!!profileErrors.name}
              />
              {profileErrors.name?.message && (
                <p className="text-xs text-destructive">{profileErrors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isProfileSaving}>
              {isProfileSaving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Enter your current password before setting a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                {...passwordForm.register("currentPassword", {
                  required: "Current password is required",
                })}
                autoComplete="current-password"
                disabled={isPasswordSaving}
                aria-invalid={!!passwordErrors.currentPassword}
              />
              {passwordErrors.currentPassword?.message && (
                <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                {...passwordForm.register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 8, message: "New password must be at least 8 characters" },
                  validate: (value) =>
                    value !== passwordForm.getValues("currentPassword") ||
                    "New password must be different from current password",
                })}
                autoComplete="new-password"
                disabled={isPasswordSaving}
                aria-invalid={!!passwordErrors.newPassword}
              />
              {passwordErrors.newPassword?.message && (
                <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                {...passwordForm.register("confirmPassword", {
                  required: "Confirm your new password",
                  validate: (value) => value === newPassword || "New passwords do not match",
                })}
                autoComplete="new-password"
                disabled={isPasswordSaving}
                aria-invalid={!!passwordErrors.confirmPassword}
              />
              {passwordErrors.confirmPassword?.message && (
                <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isPasswordSaving}>
              {isPasswordSaving ? "Saving..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
