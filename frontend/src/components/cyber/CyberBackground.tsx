export function CyberBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/25 blur-[120px]" />
      <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
