'use client';

import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock = ({ code }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className='relative w-full group'>
      <pre className='bg-surface-active text-text font-mono text-sm p-4 rounded-lg overflow-x-auto w-full'>
        <code>{code}</code>
      </pre>
      <button
        type='button'
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        className='
          absolute right-3 top-3
          flex items-center gap-1.5 rounded-md px-2 py-1
          text-xs text-text-muted
          bg-surface border border-surface-border
          opacity-0 group-hover:opacity-100 focus-visible:opacity-100
          transition-all duration-[var(--duration-fast)]
          hover:bg-surface-hover hover:text-text
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring
        '
      >
        {copied ? (
          <>
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
              <polyline points='20 6 9 17 4 12' />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
              <rect width='14' height='14' x='8' y='8' rx='2' ry='2' />
              <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
};
