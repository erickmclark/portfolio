"use client";

import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-muted leading-relaxed mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 text-muted mb-4">
            {children}
          </ul>
        ),
        li: ({ children }) => <li>{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="bg-surface px-1.5 py-0.5 rounded text-sm font-mono text-accent">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
