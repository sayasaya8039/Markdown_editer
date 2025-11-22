# Markdown Editor

Windows用のシンプルで軽量なMarkdownエディタです。Python + Tkinterで作成されています。

## 特徴

- **左右分割レイアウト**: 左側でMarkdownを編集、右側でリアルタイムプレビュー
- **リアルタイムプレビュー**: 入力と同時にHTMLプレビューが更新されます
- **ダークテーマエディタ**: 目に優しいダークテーマのテキストエディタ
- **ファイル操作**: Markdownファイルの新規作成、開く、保存、名前を付けて保存
- **画像ダウンロード機能**: Markdown内の画像URLを自動的にダウンロードしてローカルパスに置き換え
- **編集機能**: Undo/Redo、Cut/Copy/Paste対応
- **Markdown拡張サポート**: テーブル、コードブロック、目次などをサポート

## インストール

### 必要要件

- Python 3.8以上

### セットアップ

1. リポジトリをクローン

```bash
git clone <repository-url>
cd Markdown_editer
```

2. 必要なパッケージをインストール

```bash
pip install -r requirements.txt
```

## 使い方

### アプリケーションの起動

```bash
python markdown_editor.py
```

### 基本操作

#### ファイル操作

- **新規作成**: `File` → `New` または `Ctrl+N`
- **ファイルを開く**: `File` → `Open` または `Ctrl+O`
- **保存**: `File` → `Save` または `Ctrl+S`
- **名前を付けて保存**: `File` → `Save As` または `Ctrl+Shift+S`

#### 編集操作

- **元に戻す**: `Edit` → `Undo` または `Ctrl+Z`
- **やり直し**: `Edit` → `Redo` または `Ctrl+Y`
- **切り取り**: `Edit` → `Cut` または `Ctrl+X`
- **コピー**: `Edit` → `Copy` または `Ctrl+C`
- **貼り付け**: `Edit` → `Paste` または `Ctrl+V`

#### 画像ダウンロード機能

Markdown内に画像URLが含まれている場合、それらをローカルにダウンロードできます:

1. `Tools` → `Download Images` をクリック
2. 画像の保存先ディレクトリを選択
3. 画像が自動的にダウンロードされ、Markdown内のURLがローカルパスに置き換わります

例:
```markdown
![sample](https://example.com/image.jpg)
```
↓ ダウンロード後
```markdown
![sample](C:/Users/YourName/Images/image.jpg)
```

## サポートされているMarkdown記法

- **見出し**: `# H1`, `## H2`, `### H3`, etc.
- **強調**: `*italic*`, `**bold**`, `***bold italic***`
- **リスト**: 順序付き・順序なしリスト
- **リンク**: `[text](url)`
- **画像**: `![alt](url)`
- **コードブロック**: ` ```language ` で囲む
- **インラインコード**: `` `code` ``
- **引用**: `> quote`
- **テーブル**: GitHub風のテーブル記法
- **水平線**: `---` または `***`

## プレビュースタイル

プレビューはGitHub風のスタイルで表示されます:
- 見出しには下線が付きます
- コードブロックは背景色付きで表示
- テーブルは縞模様で見やすく表示
- リンクは青色で表示

## トラブルシューティング

### tkinterwebが正しく動作しない場合

tkinterwebのインストールに問題がある場合は、以下を試してください:

```bash
pip install --upgrade tkinterweb
```

### 画像が表示されない場合

- 画像のパスが正しいか確認してください
- ローカル画像の場合は絶対パスまたは相対パスを使用してください
- URLの画像の場合はインターネット接続を確認してください

## ライセンス

MIT License

## 貢献

バグ報告や機能要望は、GitHubのIssuesでお願いします。
