/** Accessible tab list (arrow keys move between tabs). */
export default function ReportTabs({ tabs, active, onChange }) {
  const onKeyDown = (event) => {
    const index = tabs.findIndex((t) => t.id === active);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      onChange(tabs[next].id);
      document.getElementById(`tab-${tabs[next].id}`)?.focus();
    }
  };

  return (
    <div role="tablist" aria-label="Report type" className="inline-flex rounded-xl bg-slate-100 p-1" onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
              selected ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
