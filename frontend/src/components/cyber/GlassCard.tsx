import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`cyber-glass rounded-2xl p-5 sm:p-6 ${hover ? 'cyber-glass-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
