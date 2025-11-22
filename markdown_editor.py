import tkinter as tk
from tkinter import ttk, filedialog, messagebox, simpledialog
import markdown
from tkinterweb import HtmlFrame
import os
import re
import requests
from pathlib import Path
from urllib.parse import urlparse


class MarkdownEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Markdown Editor")
        self.root.geometry("1200x700")

        self.current_file = None
        self.is_modified = False

        # メニューバーの作成
        self.create_menu()

        # メインフレームの作成
        self.create_widgets()

        # キーバインディング
        self.setup_bindings()

    def create_menu(self):
        """メニューバーを作成"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        # Fileメニュー
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="New", command=self.new_file, accelerator="Ctrl+N")
        file_menu.add_command(label="Open", command=self.open_file, accelerator="Ctrl+O")
        file_menu.add_command(label="Save", command=self.save_file, accelerator="Ctrl+S")
        file_menu.add_command(label="Save As", command=self.save_file_as, accelerator="Ctrl+Shift+S")
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.exit_app)

        # Editメニュー
        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Edit", menu=edit_menu)
        edit_menu.add_command(label="Undo", command=self.undo, accelerator="Ctrl+Z")
        edit_menu.add_command(label="Redo", command=self.redo, accelerator="Ctrl+Y")
        edit_menu.add_separator()
        edit_menu.add_command(label="Cut", command=self.cut, accelerator="Ctrl+X")
        edit_menu.add_command(label="Copy", command=self.copy, accelerator="Ctrl+C")
        edit_menu.add_command(label="Paste", command=self.paste, accelerator="Ctrl+V")

        # Toolsメニュー
        tools_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Tools", menu=tools_menu)
        tools_menu.add_command(label="Download Images", command=self.download_images)

    def create_widgets(self):
        """メインウィジェットを作成"""
        # パネッドウィンドウで左右分割
        paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        paned.pack(fill=tk.BOTH, expand=True)

        # 左側: テキストエディタ
        left_frame = ttk.Frame(paned)
        paned.add(left_frame, weight=1)

        # テキストエディタのラベル
        editor_label = ttk.Label(left_frame, text="Markdown Editor", font=("Arial", 10, "bold"))
        editor_label.pack(pady=5)

        # スクロールバー付きテキストエディタ
        editor_frame = ttk.Frame(left_frame)
        editor_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.text_editor = tk.Text(
            editor_frame,
            wrap=tk.WORD,
            undo=True,
            font=("Consolas", 11),
            bg="#2b2b2b",
            fg="#f8f8f2",
            insertbackground="#f8f8f2",
            selectbackground="#44475a",
            selectforeground="#f8f8f2"
        )

        scrollbar_y = ttk.Scrollbar(editor_frame, command=self.text_editor.yview)
        scrollbar_x = ttk.Scrollbar(editor_frame, orient=tk.HORIZONTAL, command=self.text_editor.xview)

        self.text_editor.configure(yscrollcommand=scrollbar_y.set, xscrollcommand=scrollbar_x.set)

        self.text_editor.grid(row=0, column=0, sticky="nsew")
        scrollbar_y.grid(row=0, column=1, sticky="ns")
        scrollbar_x.grid(row=1, column=0, sticky="ew")

        editor_frame.grid_rowconfigure(0, weight=1)
        editor_frame.grid_columnconfigure(0, weight=1)

        # 右側: プレビュー
        right_frame = ttk.Frame(paned)
        paned.add(right_frame, weight=1)

        # プレビューのラベル
        preview_label = ttk.Label(right_frame, text="Preview", font=("Arial", 10, "bold"))
        preview_label.pack(pady=5)

        # HTMLプレビュー
        preview_frame = ttk.Frame(right_frame)
        preview_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.preview = HtmlFrame(preview_frame, messages_enabled=False)
        self.preview.pack(fill=tk.BOTH, expand=True)

        # 初期プレビュー
        self.update_preview()

    def setup_bindings(self):
        """キーバインディングを設定"""
        self.text_editor.bind("<KeyRelease>", self.on_text_change)
        self.text_editor.bind("<Button-1>", self.on_text_change)

        # ショートカットキー
        self.root.bind("<Control-n>", lambda e: self.new_file())
        self.root.bind("<Control-o>", lambda e: self.open_file())
        self.root.bind("<Control-s>", lambda e: self.save_file())
        self.root.bind("<Control-Shift-S>", lambda e: self.save_file_as())

    def on_text_change(self, event=None):
        """テキスト変更時の処理"""
        self.is_modified = True
        self.update_title()
        # リアルタイムプレビュー更新（遅延実行）
        if hasattr(self, '_update_job'):
            self.root.after_cancel(self._update_job)
        self._update_job = self.root.after(300, self.update_preview)

    def update_preview(self):
        """プレビューを更新"""
        markdown_text = self.text_editor.get("1.0", tk.END)

        # MarkdownをHTMLに変換
        html = markdown.markdown(
            markdown_text,
            extensions=['extra', 'codehilite', 'tables', 'fenced_code', 'toc']
        )

        # CSSスタイルを追加
        styled_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                }}
                h1, h2, h3, h4, h5, h6 {{
                    margin-top: 24px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    line-height: 1.25;
                }}
                h1 {{ font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }}
                h2 {{ font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }}
                h3 {{ font-size: 1.25em; }}
                code {{
                    background-color: #f6f8fa;
                    padding: 0.2em 0.4em;
                    margin: 0;
                    font-size: 85%;
                    border-radius: 3px;
                    font-family: 'Consolas', 'Monaco', monospace;
                }}
                pre {{
                    background-color: #f6f8fa;
                    padding: 16px;
                    overflow: auto;
                    font-size: 85%;
                    line-height: 1.45;
                    border-radius: 3px;
                }}
                pre code {{
                    background-color: transparent;
                    padding: 0;
                }}
                blockquote {{
                    padding: 0 1em;
                    color: #6a737d;
                    border-left: 0.25em solid #dfe2e5;
                    margin: 0 0 16px 0;
                }}
                table {{
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 16px;
                }}
                table th, table td {{
                    padding: 6px 13px;
                    border: 1px solid #dfe2e5;
                }}
                table tr:nth-child(even) {{
                    background-color: #f6f8fa;
                }}
                img {{
                    max-width: 100%;
                    height: auto;
                }}
                a {{
                    color: #0366d6;
                    text-decoration: none;
                }}
                a:hover {{
                    text-decoration: underline;
                }}
                ul, ol {{
                    padding-left: 2em;
                }}
                li {{
                    margin-bottom: 0.25em;
                }}
            </style>
        </head>
        <body>
            {html}
        </body>
        </html>
        """

        self.preview.load_html(styled_html)

    def update_title(self):
        """ウィンドウタイトルを更新"""
        filename = os.path.basename(self.current_file) if self.current_file else "Untitled"
        modified = "*" if self.is_modified else ""
        self.root.title(f"{modified}{filename} - Markdown Editor")

    def new_file(self):
        """新規ファイル"""
        if self.is_modified:
            response = messagebox.askyesnocancel("Save", "保存しますか？")
            if response is None:  # Cancel
                return
            elif response:  # Yes
                self.save_file()

        self.text_editor.delete("1.0", tk.END)
        self.current_file = None
        self.is_modified = False
        self.update_title()
        self.update_preview()

    def open_file(self):
        """ファイルを開く"""
        if self.is_modified:
            response = messagebox.askyesnocancel("Save", "保存しますか？")
            if response is None:  # Cancel
                return
            elif response:  # Yes
                self.save_file()

        filepath = filedialog.askopenfilename(
            defaultextension=".md",
            filetypes=[
                ("Markdown files", "*.md"),
                ("Text files", "*.txt"),
                ("All files", "*.*")
            ]
        )

        if filepath:
            try:
                with open(filepath, "r", encoding="utf-8") as file:
                    content = file.read()
                    self.text_editor.delete("1.0", tk.END)
                    self.text_editor.insert("1.0", content)
                    self.current_file = filepath
                    self.is_modified = False
                    self.update_title()
                    self.update_preview()
            except Exception as e:
                messagebox.showerror("Error", f"ファイルを開けませんでした: {str(e)}")

    def save_file(self):
        """ファイルを保存"""
        if self.current_file:
            try:
                content = self.text_editor.get("1.0", tk.END)
                with open(self.current_file, "w", encoding="utf-8") as file:
                    file.write(content)
                self.is_modified = False
                self.update_title()
                messagebox.showinfo("Success", "ファイルを保存しました")
            except Exception as e:
                messagebox.showerror("Error", f"ファイルを保存できませんでした: {str(e)}")
        else:
            self.save_file_as()

    def save_file_as(self):
        """名前を付けて保存"""
        filepath = filedialog.asksaveasfilename(
            defaultextension=".md",
            filetypes=[
                ("Markdown files", "*.md"),
                ("Text files", "*.txt"),
                ("All files", "*.*")
            ]
        )

        if filepath:
            self.current_file = filepath
            self.save_file()

    def download_images(self):
        """Markdown内の画像URLをダウンロード"""
        content = self.text_editor.get("1.0", tk.END)

        # 画像URLを抽出 ![alt](url)
        image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
        matches = re.findall(image_pattern, content)

        if not matches:
            messagebox.showinfo("Info", "画像URLが見つかりませんでした")
            return

        # 保存先ディレクトリを選択
        save_dir = filedialog.askdirectory(title="画像の保存先を選択")
        if not save_dir:
            return

        downloaded = 0
        failed = []

        for alt_text, url in matches:
            # URLが既にローカルパスの場合はスキップ
            if not url.startswith(('http://', 'https://')):
                continue

            try:
                # 画像をダウンロード
                response = requests.get(url, timeout=10)
                response.raise_for_status()

                # ファイル名を生成
                parsed_url = urlparse(url)
                filename = os.path.basename(parsed_url.path)
                if not filename:
                    filename = f"image_{downloaded + 1}.jpg"

                # 保存
                filepath = os.path.join(save_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(response.content)

                # Markdown内のURLをローカルパスに置き換え
                content = content.replace(url, filepath)
                downloaded += 1

            except Exception as e:
                failed.append(f"{url}: {str(e)}")

        # テキストエディタの内容を更新
        if downloaded > 0:
            self.text_editor.delete("1.0", tk.END)
            self.text_editor.insert("1.0", content)
            self.is_modified = True
            self.update_preview()

        # 結果を表示
        result_msg = f"{downloaded}個の画像をダウンロードしました"
        if failed:
            result_msg += f"\n\n失敗: {len(failed)}個\n" + "\n".join(failed[:5])
            if len(failed) > 5:
                result_msg += f"\n... 他{len(failed) - 5}個"

        messagebox.showinfo("Download Complete", result_msg)

    def undo(self):
        """元に戻す"""
        try:
            self.text_editor.edit_undo()
        except:
            pass

    def redo(self):
        """やり直し"""
        try:
            self.text_editor.edit_redo()
        except:
            pass

    def cut(self):
        """切り取り"""
        self.text_editor.event_generate("<<Cut>>")

    def copy(self):
        """コピー"""
        self.text_editor.event_generate("<<Copy>>")

    def paste(self):
        """貼り付け"""
        self.text_editor.event_generate("<<Paste>>")

    def exit_app(self):
        """アプリケーションを終了"""
        if self.is_modified:
            response = messagebox.askyesnocancel("Save", "保存しますか？")
            if response is None:  # Cancel
                return
            elif response:  # Yes
                self.save_file()

        self.root.quit()


def main():
    root = tk.Tk()
    app = MarkdownEditor(root)
    root.mainloop()


if __name__ == "__main__":
    main()
