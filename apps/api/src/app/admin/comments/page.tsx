"use client";

import { useMemo, useState } from "react";
import { useAdminApi } from "@repo/admin/ui";
import {
  Button, Badge, Textarea, toast,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@repo/ui";
import { BlogSearchSelect } from "./BlogSearchSelect";

type StatusFilter = "all" | "pending" | "approved";

interface BlogRef {
  id: string;
  title: string;
  slug?: string;
}
interface CommentNode {
  id: string;
  blogId: string;
  authorName: string;
  content: string;
  isAdmin: boolean;
  status: string;
  parentId: string | null;
  createdAt: string;
  blog: BlogRef;
  replies?: CommentNode[];
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

export default function CommentsPage() {
  const api = useAdminApi();
  const commentApi = api.admin.comment;

  const [blogId, setBlogId] = useState<string>("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const queryInput = useMemo(
    () => ({
      ...(blogId ? { blogId } : {}),
      ...(status !== "all" ? { status } : {}),
    }),
    [blogId, status],
  );

  const tree = commentApi.listThreaded.useQuery(queryInput, {
    refetchOnMount: "always",
    gcTime: 0,
  });

  const replyMutation = commentApi.reply.useMutation({
    onSuccess: () => {
      toast.success("Reply posted");
      setReplyDraft({});
      void tree.refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => toast.error("Failed to post reply", { description: e?.message }),
  });
  const approveMutation = commentApi.approve.useMutation({
    onSuccess: () => {
      toast.success("Comment approved");
      void tree.refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => toast.error("Failed to approve", { description: e?.message }),
  });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteMutation = commentApi.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      setPendingDeleteId(null);
      void tree.refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => toast.error("Failed to delete", { description: e?.message }),
  });

  // replyDraft keyed by parent comment id
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const roots: CommentNode[] = (tree.data as CommentNode[] | undefined) ?? [];

  const postReply = (parentId: string) => {
    const content = (replyDraft[parentId] ?? "").trim();
    if (!content) return;
    replyMutation.mutate({ parentId, content });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Comments</h1>
        <div className="flex flex-wrap items-center gap-2">
          <BlogSearchSelect value={blogId} onChange={setBlogId} />
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

      {tree.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : roots.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No comments{status !== "all" ? ` with status “${status}”` : ""}.
        </div>
      ) : (
        <div className="space-y-4">
          {roots.map((root) => (
            <CommentTree
              key={root.id}
              root={root}
              replyDraft={replyDraft[root.id] ?? ""}
              onReplyChange={(v) => setReplyDraft((d) => ({ ...d, [root.id]: v }))}
              onPostReply={() => postReply(root.id)}
              onApprove={(id) => approveMutation.mutate({ id })}
              onDeleteRequest={(id) => setPendingDeleteId(id)}
              posting={replyMutation.isPending}
              acting={approveMutation.isPending || deleteMutation.isPending}
            />
          ))}
        </div>
      )}

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

interface TreeProps {
  root: CommentNode;
  replyDraft: string;
  onReplyChange: (v: string) => void;
  onPostReply: () => void;
  onApprove: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  posting: boolean;
  acting: boolean;
}

function CommentTree({
  root,
  replyDraft,
  onReplyChange,
  onPostReply,
  onApprove,
  onDeleteRequest,
  posting,
  acting,
}: TreeProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <CommentRow node={root} onApprove={onApprove} onDeleteRequest={onDeleteRequest} acting={acting} />

      {(root.replies?.length ?? 0) > 0 && (
        <div className="space-y-3 border-t border-border bg-muted/30 p-4 pl-8">
          {root.replies!.map((r) => (
            <CommentRow
              key={r.id}
              node={r}
              onApprove={onApprove}
              onDeleteRequest={onDeleteRequest}
              acting={acting}
              indented
            />
          ))}
        </div>
      )}

      {/* Reply box — only under top-level. 3rd layer impossible from UI. */}
      <div className="border-t border-border p-4 pl-8">
        <Textarea
          value={replyDraft}
          onChange={(e) => onReplyChange(e.target.value)}
          placeholder="Reply as admin…"
          rows={2}
          className="resize-y"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={onPostReply} disabled={posting || !replyDraft.trim()}>
            {posting ? "Posting…" : "Post reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  node,
  onApprove,
  onDeleteRequest,
  acting,
  indented = false,
}: {
  node: CommentNode;
  onApprove: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  acting: boolean;
  indented?: boolean;
}) {
  const pending = node.status === "pending";
  return (
    <div className={`flex flex-col gap-2 ${indented ? "" : "p-4"}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-foreground">
          {node.authorName}
          {node.isAdmin && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">(admin)</span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">· {timeAgo(node.createdAt)}</span>
        {node.blog && (
          <span className="text-xs text-muted-foreground">· {node.blog.title}</span>
        )}
        <Badge variant={pending ? "secondary" : "default"} className="ml-auto capitalize">
          {node.status}
        </Badge>
      </div>
      <p className="whitespace-pre-wrap text-sm text-foreground">{node.content}</p>
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
  );
}
