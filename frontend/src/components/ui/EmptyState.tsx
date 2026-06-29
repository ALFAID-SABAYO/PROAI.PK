interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl">
        🏠
      </div>
      <h3 className="font-display text-lg font-semibold text-surface-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-surface-800/70">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
