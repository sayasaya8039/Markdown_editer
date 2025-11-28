import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewProps {
    markdown: string;
}

const Preview: React.FC<PreviewProps> = ({ markdown }) => {
    return (
        <div className="preview-container">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    h1: ({ node, ...props }) => <h1 id={String(props.children).toLowerCase().replace(/\s+/g, '-')} {...props} />,
                    h2: ({ node, ...props }) => <h2 id={String(props.children).toLowerCase().replace(/\s+/g, '-')} {...props} />,
                    h3: ({ node, ...props }) => <h3 id={String(props.children).toLowerCase().replace(/\s+/g, '-')} {...props} />,
                }}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default Preview;
