"use client";

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
  toast,
} from "@repo/ui";
import { getErrorMessage } from "./lib/getErrorMessage";

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email address"),
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

export interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const api = useAdminApi();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = (api.admin as any).user.create.useMutation();

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(data: FormData) {
    try {
      await mutation.mutateAsync({ name: data.name, email: data.email, password: data.password });
      toast.success("User created");
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>Create a new user account with a password.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cu-name" className="text-sm font-medium">Name</Label>
            <Input
              id="cu-name"
              type="text"
              {...register("name")}
              placeholder="Full name"
              className="h-10"
              autoComplete="name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cu-email" className="text-sm font-medium">Email</Label>
            <Input
              id="cu-email"
              type="email"
              {...register("email")}
              placeholder="user@example.com"
              className="h-10"
              autoComplete="email"
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cu-password" className="text-sm font-medium">Password</Label>
            <Input
              id="cu-password"
              type="password"
              {...register("password")}
              className="h-10"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cu-confirm" className="text-sm font-medium">Confirm password</Label>
            <Input
              id="cu-confirm"
              type="password"
              {...register("confirmPassword")}
              className="h-10"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create user"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
