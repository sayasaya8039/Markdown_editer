import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface EditablePreviewProps {
    markdown: string;
    onChange: (markdown: string) => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onFocus: () => void;
}

export interface EditablePreviewRef {
    executeCommand: (prefix: string, suffix?: string, type?: 'block' | 'inline') => void;
}

const EditablePreview = forwardRef<EditablePreviewRef, EditablePreviewProps>(({ markdown, onChange, onContextMenu, onFocus }, ref) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Markdown,
            Image,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: markdown,
        onUpdate: ({ editor }) => {
            const newMarkdown = (editor.storage as any).markdown.getMarkdown();
            onChange(newMarkdown);
        },
        onFocus: () => {
            onFocus();
        },
        editorProps: {
            attributes: {
                class: 'prose focus:outline-none h-full',
            },
        },
    });

    useImperativeHandle(ref, () => ({
        executeCommand: (prefix: string, suffix: string = '', _type: 'block' | 'inline' = 'inline') => {
            if (!editor) return;

            editor.chain().focus();

            switch (prefix) {
                case '# ':
                    editor.chain().toggleHeading({ level: 1 }).run();
                    break;
                case '## ':
                    editor.chain().toggleHeading({ level: 2 }).run();
                    break;
                case '### ':
                    editor.chain().toggleHeading({ level: 3 }).run();
                    break;
                case '**':
                    editor.chain().toggleBold().run();
                    break;
                case '*':
                    editor.chain().toggleItalic().run();
                    break;
                case '~~':
                    editor.chain().toggleStrike().run();
                    break;
                case '- ':
                    editor.chain().toggleBulletList().run();
                    break;
                case '1. ':
                    editor.chain().toggleOrderedList().run();
                    break;
                case '\n---\n':
                    editor.chain().setHorizontalRule().run();
                    break;
                case '> ':
                    editor.chain().toggleBlockquote().run();
                    break;
                case '```\n':
                    editor.chain().toggleCodeBlock().run();
                    break;
                case '[':
                    // Simple link handling for now, ideally prompts user
                    const url = window.prompt('Enter URL');
                    if (url) {
                        editor.chain().setLink({ href: url }).run();
                    }
                    break;
                case 'insert-image':
                    if (suffix) {
                        editor.chain().setImage({ src: suffix }).run();
                    }
                    break;
                case '![alt text](':
                    const imageUrl = window.prompt('Enter Image URL');
                    if (imageUrl) {
                        editor.chain().setImage({ src: imageUrl }).run();
                    }
                    break;
                default:
                    // Fallback for unknown commands or just inserting text
                    editor.chain().insertContent(prefix + suffix).run();
                    break;
            }
        }
    }));

    // Sync content when markdown prop changes
    useEffect(() => {
        if (editor && markdown !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(markdown);
        }
    }, [markdown, editor]);

    return (
        <div className="preview-container editable-preview" onContextMenu={onContextMenu}>
            <EditorContent editor={editor} className="h-full" />
        </div>
    );
});

export default EditablePreview;
