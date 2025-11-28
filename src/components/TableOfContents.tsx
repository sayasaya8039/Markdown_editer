import React from 'react';

interface TableOfContentsProps {
    markdown: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ markdown }) => {
    const headings = markdown.match(/^(#{1,3})\s+(.+)$/gm) || [];

    if (headings.length === 0) return null;

    return (
        <div className="toc-container">
            <h3>Table of Contents</h3>
            <ul>
                {headings.map((heading, index) => {
                    const level = heading.match(/^#+/)?.[0].length || 1;
                    const text = heading.replace(/^#+\s+/, '');
                    const id = text.toLowerCase().replace(/\s+/g, '-');

                    return (
                        <li key={index} style={{ marginLeft: `${(level - 1) * 1}rem` }}>
                            <a href={`#${id}`}>{text}</a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TableOfContents;
