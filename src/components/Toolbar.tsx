import React from 'react';
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

interface ToolbarProps {
    onInsert: (prefix: string, suffix?: string, type?: 'block' | 'inline') => void;
    onImageUpload: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: (asNew: boolean) => void;
    onLoad: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onInsert, onImageUpload, onUndo, onRedo, onSave, onLoad }) => {
    return (
        <div className="toolbar">
            <Dropdown
                icon={<Save size={18} />}
                title="File"
                items={[
                    { label: '読み込み', onClick: onLoad },
                    { label: '名前を付けて保存', onClick: () => onSave(true) },
                    { label: '上書き保存', onClick: () => onSave(false) },
                ]}
            />

            <div className="separator" />

            <button onClick={onUndo} title="Undo" className="toolbar-btn">
                <Undo size={18} />
            </button>
            <button onClick={onRedo} title="Redo" className="toolbar-btn">
                <Redo size={18} />
            </button>

            <div className="separator" />

            <Dropdown
                label="見出し"
                title="Headings"
                items={[
                    { label: 'Heading 1', onClick: () => onInsert('# ', '', 'block') },
                    { label: 'Heading 2', onClick: () => onInsert('## ', '', 'block') },
                    { label: 'Heading 3', onClick: () => onInsert('### ', '', 'block') },
                ]}
            />

            <div className="separator" />

            <button onClick={() => onInsert('**', '**', 'inline')} title="Bold" className="toolbar-btn">
                <Bold size={18} />
            </button>

            <Dropdown
                icon={<Strikethrough size={18} />}
                title="Text Formatting"
                items={[
                    { label: 'Italic', icon: <Italic size={14} />, onClick: () => onInsert('*', '*', 'inline') },
                    { label: 'Strikethrough', icon: <Strikethrough size={14} />, onClick: () => onInsert('~~', '~~', 'inline') },
                ]}
            />

            <Dropdown
                icon={<List size={18} />}
                title="Lists"
                items={[
                    { label: 'Bullet List', icon: <List size={14} />, onClick: () => onInsert('- ', '', 'block') },
                    { label: 'Ordered List', icon: <ListOrdered size={14} />, onClick: () => onInsert('1. ', '', 'block') },
                ]}
            />

            <Dropdown
                icon={<AlignLeft size={18} />}
                title="Insert"
                items={[
                    { label: 'Horizontal Rule', icon: <Minus size={14} />, onClick: () => onInsert('\n---\n', '', 'block') },
                ]}
            />

            <div className="separator" />

            <button onClick={() => onInsert('[', '](url)', 'inline')} title="Link" className="toolbar-btn">
                <Link size={18} />
            </button>

            <button onClick={() => onInsert('> ', '', 'block')} title="Quote" className="toolbar-btn">
                <Quote size={18} />
            </button>

            <button onClick={() => onInsert('```\n', '\n```', 'block')} title="Code Block" className="toolbar-btn">
                <Code size={18} />
            </button>

            <div className="separator" />

            <button onClick={onImageUpload} title="Image" className="toolbar-btn">
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

export default Toolbar;
