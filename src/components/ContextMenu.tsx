import React, { useEffect, useRef } from 'react';
import {
    Bold,
    Italic,
    Strikethrough,
    Quote,
    Code,
    Link,
    Image,
    List,
    ListOrdered,
    Minus,
    Trash2,
    PenLine,
    AlignLeft,
    Undo,
    Redo,
    Save
} from 'lucide-react';
import Dropdown from './Dropdown';

interface ContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    onClose: () => void;
    onInsert: (prefix: string, suffix?: string, type?: 'block' | 'inline') => void;
    onImageUpload: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: (asNew: boolean) => void;
    onLoad: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    visible,
    x,
    y,
    onClose,
    onInsert,
    onImageUpload,
    onUndo,
    onRedo,
    onSave,
    onLoad
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    const handleItemClick = (action: () => void) => {
        action();
        onClose();
    };

    const handleInsertClick = (prefix: string, suffix: string = '', type: 'block' | 'inline' = 'inline') => {
        onInsert(prefix, suffix, type);
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ top: y, left: x }}
        >
            <div className="toolbar-row" style={{ padding: '4px 8px', display: 'flex', gap: '4px', borderBottom: '1px solid #eee' }}>
                <Dropdown
                    icon={<Save size={16} />}
                    title="File"
                    items={[
                        { label: '読み込み', onClick: () => handleItemClick(onLoad) },
                        { label: '名前を付けて保存', onClick: () => handleItemClick(() => onSave(true)) },
                        { label: '上書き保存', onClick: () => handleItemClick(() => onSave(false)) },
                    ]}
                />
                <button onClick={() => handleItemClick(onUndo)} title="Undo" className="toolbar-btn">
                    <Undo size={16} />
                </button>
                <button onClick={() => handleItemClick(onRedo)} title="Redo" className="toolbar-btn">
                    <Redo size={16} />
                </button>
            </div>

            <Dropdown
                label="見出し"
                title="Headings"
                items={[
                    { label: 'Heading 1', onClick: () => handleInsertClick('# ', '', 'block') },
                    { label: 'Heading 2', onClick: () => handleInsertClick('## ', '', 'block') },
                    { label: 'Heading 3', onClick: () => handleInsertClick('### ', '', 'block') },
                ]}
            />

            <div className="separator" />

            <button onClick={() => handleInsertClick('**', '**', 'inline')} title="Bold" className="toolbar-btn">
                <Bold size={18} />
            </button>

            <Dropdown
                icon={<Strikethrough size={18} />}
                title="Text Formatting"
                items={[
                    { label: 'Italic', icon: <Italic size={14} />, onClick: () => handleInsertClick('*', '*', 'inline') },
                    { label: 'Strikethrough', icon: <Strikethrough size={14} />, onClick: () => handleInsertClick('~~', '~~', 'inline') },
                ]}
            />

            <Dropdown
                icon={<List size={18} />}
                title="Lists"
                items={[
                    { label: 'Bullet List', icon: <List size={14} />, onClick: () => handleInsertClick('- ', '', 'block') },
                    { label: 'Ordered List', icon: <ListOrdered size={14} />, onClick: () => handleInsertClick('1. ', '', 'block') },
                ]}
            />

            <Dropdown
                icon={<AlignLeft size={18} />}
                title="Insert"
                items={[
                    { label: 'Horizontal Rule', icon: <Minus size={14} />, onClick: () => handleInsertClick('\n---\n', '', 'block') },
                ]}
            />

            <div className="separator" />

            <button onClick={() => handleInsertClick('[', '](url)', 'inline')} title="Link" className="toolbar-btn">
                <Link size={18} />
            </button>

            <button onClick={() => handleInsertClick('> ', '', 'block')} title="Quote" className="toolbar-btn">
                <Quote size={18} />
            </button>

            <button onClick={() => handleInsertClick('```\n', '\n```', 'block')} title="Code Block" className="toolbar-btn">
                <Code size={18} />
            </button>

            <div className="separator" />

            <button onClick={() => handleItemClick(onImageUpload)} title="Image" className="toolbar-btn">
                <Image size={18} />
            </button>

            <div className="separator" />

            <button className="toolbar-btn" title="Delete (Placeholder)">
                <Trash2 size={18} />
            </button>

            <button className="toolbar-btn" title="Edit (Placeholder)">
                <PenLine size={18} />
            </button>
        </div>
    );
};

export default ContextMenu;
