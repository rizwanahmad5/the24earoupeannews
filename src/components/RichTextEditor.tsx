import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code, Link as LinkIcon, Unlink } from "lucide-react";

interface Props {
  initialContent?: unknown;
  onChange: (json: unknown, html: string) => void;
}

export function RichTextEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-gold hover:underline transition",
        },
      }),
    ],
    content: (initialContent as object | undefined) ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-article min-h-[400px] rounded-xl border border-glass-border bg-background/40 p-5 focus:outline-none focus:border-gold",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON(), editor.getHTML());
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    // Cancelled
    if (url === null) return;

    // Empty -> remove link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const Btn = ({ active, onClick, children, label }: { active?: boolean; onClick: () => void; children: React.ReactNode; label: string }) => (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-glass-border text-silver transition hover:text-gold ${active ? "bg-gold/20 text-gold" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 rounded-xl border border-glass-border bg-glass p-2">
        <Btn label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
        <Btn label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
        <Btn label="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
        <Btn label="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
        <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
        <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
        <Btn label="Code" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Btn>
        <div className="mx-1 h-8 w-px bg-glass-border" />
        <Btn label="Insert Link" active={editor.isActive("link")} onClick={setLink}><LinkIcon className="h-4 w-4" /></Btn>
        {editor.isActive("link") && (
          <Btn label="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink className="h-4 w-4" /></Btn>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
