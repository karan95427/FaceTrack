export default function Sidebar({ title, children }) {
  return (
    <aside className="glass thin-scrollbar rounded-lg p-4 lg:max-h-[calc(100vh-112px)] lg:overflow-auto">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h2>
      {children}
    </aside>
  );
}
