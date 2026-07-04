"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminApi } from "@repo/admin/ui";
import {
  Button, Badge, Input, Textarea, toast, ImageUpload, FileUpload,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@repo/ui";
import { RestaurantSearchSelect } from "./RestaurantSearchSelect";

type StatusFilter = "all" | "pending" | "approved";

interface RestaurantRef {
  id: string;
  name: string;
  slug?: string;
}
interface CommentNode {
  id: string;
  restaurantId: string;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
  ratingMakanan: number | null;
  ratingLayanan: number | null;
  ratingSuasana: number | null;
  ratingTotal: number | null;
  media: { url: string }[];
  restaurant: RestaurantRef;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function RestaurantCommentsPage() {
  const api = useAdminApi();
  const commentApi = api.admin.restaurantComment;

  const [restaurantId, setRestaurantId] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  // Reset to first page whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [restaurantId, status]);

  const queryInput = useMemo(
    () => ({
      ...(restaurantId ? { restaurantId } : {}),
      ...(status !== "all" ? { status } : {}),
      page,
    }),
    [restaurantId, status, page],
  );

  const list = commentApi.listThreaded.useQuery(queryInput, {
    refetchOnMount: "always",
    gcTime: 0,
  });

  const approveMutation = commentApi.approve.useMutation({
    onSuccess: () => {
      toast.success("Comment approved");
      void list.refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => toast.error("Failed to approve", { description: e?.message }),
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteMutation = commentApi.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      setPendingDeleteId(null);
      void list.refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => toast.error("Failed to delete", { description: e?.message }),
  });

  // Create-review modal
  const emptyForm = {
    restaurantId: "",
    authorName: "",
    content: "",
    ratingMakanan: 5,
    ratingLayanan: 5,
    ratingSuasana: 5,
    picture: "",
    video: "",
    status: "approved" as "pending" | "approved",
  };
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const createMutation = commentApi.create.useMutation({
    onSuccess: () => {
      toast.success("Review created");
      setCreateOpen(false);
      setForm(emptyForm);
      void list.refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => toast.error("Failed to create", { description: e?.message }),
  });

  const submitCreate = () => {
    if (!form.restaurantId || !form.authorName.trim() || !form.content.trim()) {
      toast.error("Restaurant, author, and comment are required");
      return;
    }
    createMutation.mutate({
      restaurantId: form.restaurantId,
      authorName: form.authorName.trim(),
      content: form.content.trim(),
      ratingMakanan: form.ratingMakanan,
      ratingLayanan: form.ratingLayanan,
      ratingSuasana: form.ratingSuasana,
      status: form.status,
      media: [form.picture.trim(), form.video.trim()]
        .filter(Boolean)
        .map((url, position) => ({ url, position })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  };

  const listData = list.data as
    | { items: CommentNode[]; totalPages: number }
    | undefined;
  const comments: CommentNode[] = listData?.items ?? [];
  const totalPages: number = listData?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Restaurant Comments</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>New review</Button>
          <RestaurantSearchSelect value={restaurantId} onChange={setRestaurantId} />
          <div className="flex overflow-hidden rounded-md border border-border">
            {(["all", "pending", "approved"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                  status === s ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No comments{status !== "all" ? ` with status “${status}”` : ""}.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              node={c}
              onApprove={(id) => approveMutation.mutate({ id })}
              onDeleteRequest={(id) => setPendingDeleteId(id)}
              acting={approveMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New review</DialogTitle>
            <DialogDescription>Create a restaurant review with ratings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Restaurant</label>
              <RestaurantSearchSelect
                value={form.restaurantId}
                onChange={(v) => setField("restaurantId", v)}
                placeholder="Select restaurant"
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Author</label>
              <Input
                value={form.authorName}
                onChange={(e) => setField("authorName", e.target.value)}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Comment</label>
              <Textarea
                value={form.content}
                onChange={(e) => setField("content", e.target.value)}
                rows={3}
                placeholder="Review…"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["ratingMakanan", "ratingLayanan", "ratingSuasana"] as const).map((k) => (
                <div key={k} className="space-y-1">
                  <label className="block text-sm font-medium capitalize">{k.replace("rating", "")}</label>
                  <select
                    value={form[k]}
                    onChange={(e) => setField(k, Number(e.target.value))}
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Picture</label>
              <ImageUpload
                value={form.picture || null}
                onChange={(url) => setField("picture", url)}
                onRemove={() => setField("picture", "")}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Video</label>
              <FileUpload
                value={form.video || null}
                accept="video/mp4,video/webm,video/quicktime"
                maxSizeMB={50}
                onChange={(url) => setField("video", url)}
                onRemove={() => setField("video", "")}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as "pending" | "approved")}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button disabled={createMutation.isPending} onClick={submitCreate}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => { if (pendingDeleteId) deleteMutation.mutate({ id: pendingDeleteId }); }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RatingBar({ node }: { node: CommentNode }) {
  if (node.ratingTotal == null) return null;
  const parts: Array<[string, number | null]> = [
    ["Makanan", node.ratingMakanan],
    ["Layanan", node.ratingLayanan],
    ["Suasana", node.ratingSuasana],
    ["Total", node.ratingTotal],
  ];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {parts.map(([label, v]) => (
        <span key={label} className={label === "Total" ? "font-medium text-foreground" : undefined}>
          {label} <span className="text-amber-500">★</span> {v ?? "–"}
        </span>
      ))}
    </div>
  );
}

function CommentCard({
  node,
  onApprove,
  onDeleteRequest,
  acting,
}: {
  node: CommentNode;
  onApprove: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  acting: boolean;
}) {
  const pending = node.status === "pending";
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{node.authorName}</span>
          <span className="text-xs text-muted-foreground">· {timeAgo(node.createdAt)}</span>
          {node.restaurant && (
            <span className="text-xs text-muted-foreground">· {node.restaurant.name}</span>
          )}
          <Badge variant={pending ? "secondary" : "default"} className="ml-auto capitalize">
            {node.status}
          </Badge>
        </div>
        <RatingBar node={node} />
        <p className="whitespace-pre-wrap text-sm text-foreground">{node.content}</p>
        {node.media.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {node.media.map(({ url }) =>
              isVideoUrl(url) ? (
                <video
                  key={url}
                  src={`${url}#t=0.5`}
                  controls
                  preload="metadata"
                  className="h-80 w-auto max-w-full rounded-md bg-black"
                />
              ) : (
                <button
                  key={url}
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="cursor-zoom-in p-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-80 w-80 rounded-md object-cover" />
                </button>
              ),
            )}
          </div>
        )}
        {lightbox && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] max-w-[92vw] cursor-default rounded object-contain"
            />
          </div>
        )}
        <div className="flex gap-2">
          {pending && (
            <Button size="sm" variant="outline" onClick={() => onApprove(node.id)} disabled={acting}>
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteRequest(node.id)}
            disabled={acting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}