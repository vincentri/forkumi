"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import YouTube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState } from "react";
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Quote, Code, Code2, Minus,
  Undo2, Redo2, Youtube, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { ImageUpload } from "./image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

import { ResizableNodeView, type NodeViewProps, mergeAttributes } from "@tiptap/core";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

function getYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function applyAlignmentStyle(el: HTMLElement, textAlign: string | null) {
  switch (textAlign) {
    case "center":
      el.style.display = "flex";
      el.style.justifyContent = "center";
      break;
    case "right":
      el.style.display = "flex";
      el.style.justifyContent = "flex-end";
      break;
    default:
      el.style.display = "";
      el.style.justifyContent = "";
      break;
  }
}

function parsePixelValue(value: string | null): number | null {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

const ResizableYouTube = YouTube.extend({
  renderHTML({ node, HTMLAttributes }) {
    const textAlign = node.attrs.textAlign as string | null;
    const wrapperStyle = textAlign === "center"
      ? "display:flex;justify-content:center"
      : textAlign === "right"
      ? "display:flex;justify-content:flex-end"
      : "";
    return [
      "div",
      mergeAttributes(HTMLAttributes, { style: wrapperStyle }),
      [
        "div",
        { "data-youtube-video": "", style: `position:relative;width:${node.attrs.width || 640}px;aspect-ratio:16/9` },
        [
          "iframe",
          {
            src: (() => {
              const src = node.attrs.src as string;
              if (!src) return "";
              if (src.includes("/embed/")) return src;
              if (src.includes("youtu.be")) {
                const id = src.split("/").pop();
                return id ? `https://www.youtube.com/embed/${id}` : "";
              }
              try {
                const urlObj = new URL(src);
                const videoId = urlObj.searchParams.get("v");
                return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
              } catch {
                return "";
              }
            })(),
            allowfullscreen: "true",
            frameborder: "0",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            style: "position:absolute;inset:0;width:100%;height:100%;border:0",
          },
        ],
      ],
    ];
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div");
      container.setAttribute("data-youtube-video", "");
      container.style.position = "relative";

      const iframe = document.createElement("iframe");
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.position = "absolute";
      iframe.style.inset = "0";

      const src = node.attrs.src as string;
      if (src) {
        const embedUrl = (() => {
          try {
            if (src.includes("/embed/")) return src;
            if (src.includes("youtu.be")) {
              const id = src.split("/").pop();
              return id ? `https://www.youtube.com/embed/${id}` : null;
            }
            const urlObj = new URL(src);
            const videoId = urlObj.searchParams.get("v");
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
          } catch {
            return null;
          }
        })();
        if (embedUrl) iframe.setAttribute("src", embedUrl);
      }

      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.zIndex = "10";
      overlay.style.display = "none";
      overlay.style.cursor = "inherit";

      const width = (node.attrs.width as number) || 640;
      container.style.width = `${width}px`;
      container.style.aspectRatio = "16 / 9";

      container.appendChild(iframe);
      container.appendChild(overlay);

      let isResizing = false;

      const nodeView = new ResizableNodeView({
        element: container,
        editor,
        node,
        getPos,
        onResize: (w) => {
          if (!isResizing) {
            isResizing = true;
            overlay.style.display = "block";
          }
          container.style.width = `${w}px`;
        },
        onCommit: (w, h) => {
          isResizing = false;
          overlay.style.display = "none";
          const pos = getPos();
          if (pos === undefined) return;
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("youtube", { width: w, height: h })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          applyAlignmentStyle(nodeView.dom as HTMLElement, updatedNode.attrs.textAlign as string | null);
          return false;
        },
        options: {
          directions: ["bottom-right", "bottom-left"],
          min: { width: 320, height: 180 },
          preserveAspectRatio: true,
        },
      });

      applyAlignmentStyle(nodeView.dom as HTMLElement, node.attrs.textAlign as string | null);

      return nodeView;
    };
  },
});

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => parsePixelValue(element.getAttribute("width") ?? element.style.width),
        renderHTML: (attributes) => attributes.width ? { width: attributes.width } : {},
      },
      height: {
        default: null,
        parseHTML: (element) => parsePixelValue(element.getAttribute("height") ?? element.style.height),
        renderHTML: (attributes) => attributes.height ? { height: attributes.height } : {},
      },
      textAlign: {
        default: null,
        parseHTML: (element) => {
          const parent = element.parentElement;
          if (element.getAttribute("data-align")) return element.getAttribute("data-align");
          if (element.style.textAlign) return element.style.textAlign;
          if (parent?.getAttribute("data-align")) return parent.getAttribute("data-align");
          if (parent?.style.justifyContent === "center") return "center";
          if (parent?.style.justifyContent === "flex-end") return "right";
          return null;
        },
        renderHTML: (attributes) => attributes.textAlign
          ? { "data-align": attributes.textAlign, style: `text-align:${attributes.textAlign}` }
          : {},
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const textAlign = node.attrs.textAlign as string | null;
    const wrapperStyle = textAlign === "center"
      ? "display:flex;justify-content:center"
      : textAlign === "right"
      ? "display:flex;justify-content:flex-end"
      : "";
    const imgStyle = [
      "border-radius:0.375rem",
      "max-width:100%",
      textAlign ? `text-align:${textAlign}` : "",
      textAlign === "center" ? "display:block;margin-left:auto;margin-right:auto" : "",
      textAlign === "right" ? "display:block;margin-left:auto" : "",
      node.attrs.width ? `width:${node.attrs.width}px` : "",
    ].filter(Boolean).join(";");
    return [
      "div",
      { style: wrapperStyle, "data-align": textAlign || undefined },
      ["img", mergeAttributes(HTMLAttributes, { src: node.attrs.src, alt: node.attrs.alt || "", title: node.attrs.title || "", style: imgStyle, "data-align": textAlign || undefined })],
    ];
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const img = document.createElement("img");
      img.setAttribute("src", node.attrs.src as string);
      if (node.attrs.alt) img.setAttribute("alt", node.attrs.alt as string);
      if (node.attrs.title) img.setAttribute("title", node.attrs.title as string);
      img.style.borderRadius = "0.375rem";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      const imgWidth = node.attrs.width as number | undefined;
      if (imgWidth) img.style.width = `${imgWidth}px`;

      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.zIndex = "10";
      overlay.style.display = "none";
      overlay.style.cursor = "inherit";

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.appendChild(img);
      wrapper.appendChild(overlay);

      let isResizing = false;

      const nodeView = new ResizableNodeView({
        element: wrapper,
        editor,
        node,
        getPos,
        onResize: (w) => {
          if (!isResizing) {
            isResizing = true;
            overlay.style.display = "block";
          }
          img.style.width = `${w}px`;
        },
        onCommit: (w, h) => {
          isResizing = false;
          overlay.style.display = "none";
          const pos = getPos();
          if (pos === undefined) return;
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", { width: w, height: h })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          applyAlignmentStyle(nodeView.dom as HTMLElement, updatedNode.attrs.textAlign as string | null);
          return false;
        },
        options: {
          directions: ["bottom-right", "bottom-left"],
          min: { width: 100, height: 100 },
          preserveAspectRatio: true,
        },
      });

      applyAlignmentStyle(nodeView.dom as HTMLElement, node.attrs.textAlign as string | null);

      return nodeView;
    };
  },
});

export function RichTextEditor({ value, onChange, placeholder, readOnly, className }: RichTextEditorProps) {
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph", "image", "youtube"],
      }),
      ResizableYouTube.configure({
        width: 640,
        height: 360,
        allowFullscreen: true,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        resize: {
          enabled: true,
          directions: ["bottom-right", "bottom-left"],
          minWidth: 100,
          minHeight: 100,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ],
    content: value ?? "",
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== (value ?? "")) {
      editor.commands.setContent(value ?? "");
    }
  }, [value, editor]);

  return (
    <div className={cn("border border-input rounded-md flex flex-col max-h-[50vh] overflow-y-auto", className)}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-input bg-muted sticky top-0 z-10 shrink-0">
          <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo"><Undo2 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo"><Redo2 className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold"><Bold className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic"><Italic className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")} title="Inline code"><Code className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign("left").run()} active={editor?.isActive({ textAlign: "left" })} title="Align left"><AlignLeft className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign("center").run()} active={editor?.isActive({ textAlign: "center" })} title="Align center"><AlignCenter className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign("right").run()} active={editor?.isActive({ textAlign: "right" })} title="Align right"><AlignRight className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign("justify").run()} active={editor?.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list"><List className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Ordered list"><ListOrdered className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Blockquote"><Quote className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive("codeBlock")} title="Code block"><Code2 className="h-3.5 w-3.5" /></ToolbarButton>
          <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><Minus className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => setYoutubeOpen(true)} title="Embed YouTube video"><Youtube className="h-3.5 w-3.5" /></ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => setImageOpen(true)} title="Insert image"><ImageIcon className="h-3.5 w-3.5" /></ToolbarButton>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "px-3 py-2 min-h-[120px] focus-within:outline-none text-sm flex-1",
          "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[120px]",
          "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:my-1",
          "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:my-1",
          "[&_.ProseMirror_li]:my-0.5",
          "[&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-2",
          "[&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:my-2",
          "[&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:my-1.5",
          "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_blockquote]:my-2",
          "[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:text-xs [&_.ProseMirror_code]:font-mono",
          "[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:my-2 [&_.ProseMirror_pre]:text-xs [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:overflow-x-auto",
          "[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0",
          "[&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-3",
          "[&_[data-youtube-video]]:relative [&_[data-youtube-video]]:aspect-video",
          "[&_[data-youtube-video]_iframe]:absolute [&_[data-youtube-video]_iframe]:inset-0 [&_[data-youtube-video]_iframe]:h-full [&_[data-youtube-video]_iframe]:w-full [&_[data-youtube-video]_iframe]:border-0",
          "[&_.ProseMirror_img]:rounded-md",
          "[&_[data-resize-handle]]:absolute [&_[data-resize-handle]]:bg-primary [&_[data-resize-handle]]:opacity-50 [&_[data-resize-handle]]:rounded-full [&_[data-resize-handle]]:w-3 [&_[data-resize-handle]]:h-3 [&_[data-resize-handle]]:hover:opacity-100",
          "[&_[data-resize-handle='bottom-right']]:-bottom-1.5 [&_[data-resize-handle='bottom-right']]:-right-1.5 [&_[data-resize-handle='bottom-right']]:cursor-se-resize",
          "[&_[data-resize-handle='bottom-left']]:-bottom-1.5 [&_[data-resize-handle='bottom-left']]:-right-auto [&_[data-resize-handle='bottom-left']]:-left-1.5 [&_[data-resize-handle='bottom-left']]:cursor-sw-resize",
          "[&_.ProseMirror_p]:my-1",
          placeholder && "[&_.ProseMirror.is-editor-empty:first-child::before]:content-[var(--placeholder)]",
          placeholder && "[&_.ProseMirror.is-editor-empty:first-child::before]:text-muted-foreground",
          placeholder && "[&_.ProseMirror.is-editor-empty:first-child::before]:pointer-events-none",
          placeholder && "[&_.ProseMirror.is-editor-empty:first-child::before]:float-left",
          placeholder && "[&_.ProseMirror.is-editor-empty:first-child::before]:h-0",
          readOnly && "bg-muted/20",
        )}
        style={placeholder ? { "--placeholder": `"${placeholder}"` } as React.CSSProperties : undefined}
      />

      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setYoutubeError(null);
              const id = getYouTubeVideoId(youtubeUrl);
              if (!id) {
                setYoutubeError("Enter a valid YouTube URL.");
                return;
              }
              editor
                ?.chain()
                .focus()
                .setYoutubeVideo({ src: youtubeUrl.trim() })
                .run();
              setYoutubeUrl("");
              setYoutubeOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>Embed YouTube video</DialogTitle>
              <DialogDescription>Paste a YouTube link to embed it in the editor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  setYoutubeError(null);
                }}
                autoFocus
              />
              {youtubeError ? <p className="text-xs text-destructive">{youtubeError}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setYoutubeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!editor || !youtubeUrl.trim()}>Embed</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={imageOpen} onOpenChange={(open) => {
        setImageOpen(open);
        if (!open) setImageUrl(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
            <DialogDescription>Upload an image or paste a URL to embed it in the editor.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onRemove={() => setImageUrl(null)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setImageOpen(false); setImageUrl(null); }}>Cancel</Button>
            <Button
              type="button"
              disabled={!editor || !imageUrl}
              onClick={() => {
                if (imageUrl) {
                  editor?.chain().focus().setImage({ src: imageUrl }).run();
                  setImageUrl(null);
                  setImageOpen(false);
                }
              }}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-0.5" />;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-30 pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}
