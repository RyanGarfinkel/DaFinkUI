interface ComponentPreviewProps {
  children: React.ReactNode;
  className?: string;
}

export const ComponentPreview = ({ children, className }: ComponentPreviewProps) => {
  return (
    <div
      className={`border border-surface-border rounded-lg p-8 flex items-center justify-center bg-surface min-h-[160px] ${className ?? ''}`}
    >
      {children}
    </div>
  );
};
