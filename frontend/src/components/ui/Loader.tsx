import React from 'react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ text = 'Loading...', fullScreen = false }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-surface-border" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
      </div>
      {text && <p className="text-gray-400 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  return <div className="flex items-center justify-center p-12">{content}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface-hover rounded-lg ${className}`} />
  );
}
