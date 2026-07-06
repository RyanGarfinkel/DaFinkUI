'use client';

import { useEffect, useRef, useState } from 'react';

interface ComponentPreviewProps {
  children: React.ReactNode;
  className?: string;
}

export const ComponentPreview = ({ children, className }: ComponentPreviewProps) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    const el = scrollRef.current;
    if(!el) return;

    const observer = new ResizeObserver(() =>
    {
      setIsOverflowing(el.scrollWidth > el.clientWidth);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      tabIndex={isOverflowing ? 0 : -1}
      role={isOverflowing ? 'region' : undefined}
      aria-label={isOverflowing ? 'Component preview' : undefined}
      data-toc-exclude=''
      className={[
        'border border-surface-border rounded-lg bg-surface overflow-x-auto',
        isOverflowing ? 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-ring' : '',
        className ?? '',
      ].join(' ').trim()}
    >
      <div className='flex items-center justify-center p-4 sm:p-8 min-h-[160px] w-fit min-w-full'>
        {children}
      </div>
    </div>
  );
};
