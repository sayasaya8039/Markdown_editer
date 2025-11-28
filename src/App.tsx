import { useState, useRef } from 'react';
import Editor from './components/Editor';
import EditablePreview, { type EditablePreviewRef } from './components/EditablePreview';
import Toolbar from './components/Toolbar';
import TableOfContents from './components/TableOfContents';
import ContextMenu from './components/ContextMenu';

function App() {
  const [markdown, setMarkdown] = useState<string>('# Hello Markdown\n\nStart typing to see the preview...');
  const [history, setHistory] = useState<string[]>(['# Hello Markdown\n\nStart typing to see the preview...']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });
  const [activeContext, setActiveContext] = useState<'editor' | 'preview'>('editor');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<EditablePreviewRef>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMarkdown = (newMarkdown: string) => {
    if (newMarkdown === markdown) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newMarkdown);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setMarkdown(newMarkdown);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMarkdown(history[newIndex]);
    }
  };

  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);

  const saveFile = async (asNew: boolean = false) => {
    try {
      let handle = fileHandle;

      if (asNew || !handle) {
        // @ts-ignore - showSaveFilePicker is not yet in standard TS lib
        handle = await window.showSaveFilePicker({
          types: [
            {
              description: 'Markdown Files',
              accept: {
                'text/markdown': ['.md'],
              },
            },
          ],
        });
        setFileHandle(handle);
      }

      if (handle) {
        // @ts-ignore
        const writable = await handle.createWritable();
        await writable.write(markdown);
        await writable.close();
      }
    } catch (err) {
      console.error('Failed to save file:', err);
      // Ignore abort errors (user cancelled)
    }
  };

  const loadInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text !== undefined) {
          updateMarkdown(text);
          // We can't get a FileSystemHandle from a standard input, so we reset it.
          // Future saves will trigger "Save As".
          setFileHandle(null);
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  const loadFile = async () => {
    try {
      // Check if showOpenFilePicker is supported
      if ('showOpenFilePicker' in window) {
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'Markdown Files',
              accept: {
                'text/markdown': ['.md'],
              },
            },
          ],
        });

        if (handle) {
          // @ts-ignore
          const file = await handle.getFile();
          const text = await file.text();
          updateMarkdown(text);
          setFileHandle(handle);
        }
      } else {
        // Fallback for browsers that don't support File System Access API
        loadInputRef.current?.click();
      }
    } catch (err) {
      console.error('Failed to load file:', err);
      // Fallback if user cancels picker or other error, though usually cancel throws AbortError.
      // If it's an AbortError, we probably shouldn't trigger fallback.
      // But if it's a support error, we should.
      // For now, let's rely on the 'in window' check for support.
      // If the API exists but fails, it might be better to just log it.
      // However, if the user cancels the picker, we don't want to open the fallback.
    }
  };

  const handleInsert = (prefix: string, suffix: string = '', type: 'block' | 'inline' = 'inline') => {
    if (activeContext === 'editor' && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      if (type === 'block') {
        // Find start of the line
        const lastNewLine = text.lastIndexOf('\n', start - 1);
        const insertPos = lastNewLine === -1 ? 0 : lastNewLine + 1;

        const before = text.substring(0, insertPos);
        const after = text.substring(insertPos);

        const newText = before + prefix + after;
        updateMarkdown(newText);

        // Restore focus and adjust cursor position
        setTimeout(() => {
          textarea.focus();
          // Shift selection by prefix length
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
      } else {
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        updateMarkdown(newText);

        // Restore focus and cursor position
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + prefix.length + selection.length + suffix.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    } else if (activeContext === 'preview' && previewRef.current) {
      previewRef.current.executeCommand(prefix, suffix, type);
    } else {
      // No active context or ref found
    }
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use createObjectURL to avoid huge base64 strings
      // Note: This creates a temporary blob URL that works for the session
      const imageUrl = URL.createObjectURL(file);

      // Insert image markdown
      const imageMarkdown = `![${file.name}](${imageUrl})`;

      if (activeContext === 'editor') {
        handleInsert(imageMarkdown, '', 'inline');
      } else if (activeContext === 'preview' && previewRef.current) {
        previewRef.current.executeCommand('insert-image', imageUrl, 'inline');
      }
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleContextMenu = (e: React.MouseEvent, source: 'editor' | 'preview') => {
    e.preventDefault();
    setActiveContext(source);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div className="app-container" onClick={closeContextMenu}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={loadInputRef}
        style={{ display: 'none' }}
        accept=".md"
        onChange={handleLoadFileChange}
      />
      <header className="app-header">
        <h1>Markdown Editor</h1>
        <Toolbar
          onInsert={(prefix, suffix, type) => {
            handleInsert(prefix, suffix, type);
          }}
          onImageUpload={triggerImageUpload}
          onUndo={undo}
          onRedo={redo}
          onSave={saveFile}
          onLoad={loadFile}
        />
      </header>
      <div className="content-wrapper">
        <main className="main-content">
          <div onClick={() => setActiveContext('editor')} onContextMenu={(e) => handleContextMenu(e, 'editor')} className="editor-wrapper h-full">
            <Editor
              ref={textareaRef}
              value={markdown}
              onChange={updateMarkdown}
              onContextMenu={(e) => {
                e.stopPropagation(); // Prevent double triggering if wrapper also has listener
                handleContextMenu(e, 'editor');
              }}
            />
          </div>
          <div onClick={() => setActiveContext('preview')} className="preview-wrapper h-full">
            <EditablePreview
              ref={previewRef}
              markdown={markdown}
              onChange={updateMarkdown}
              onContextMenu={(e) => {
                e.stopPropagation();
                handleContextMenu(e, 'preview');
              }}
              onFocus={() => setActiveContext('preview')}
            />
          </div>
        </main>
        <aside className="sidebar">
          <TableOfContents markdown={markdown} />
        </aside>
      </div>
      {contextMenu.visible && (
        <ContextMenu
          visible={contextMenu.visible}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onInsert={(prefix: string, suffix?: string, type?: 'block' | 'inline') => {
            handleInsert(prefix, suffix, type);
          }}
          onImageUpload={triggerImageUpload}
          onUndo={undo}
          onRedo={redo}
          onSave={saveFile}
          onLoad={loadFile}
        />
      )}
    </div>
  );
}

export default App;
