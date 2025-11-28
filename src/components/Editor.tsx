import { forwardRef } from 'react';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange, onContextMenu }, ref) => {
    return (
        <div className="editor-container">
            <textarea
                ref={ref}
                className="editor-textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onContextMenu={onContextMenu}
                placeholder="Type your markdown here..."
            />
        </div>
    );
});

export default Editor;
