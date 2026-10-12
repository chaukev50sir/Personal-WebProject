import { useId, useState } from 'react';

// Accordion section. A native <button> inside a heading gives Enter/Space
// support and keeps it reachable via heading navigation. aria-expanded is
// derived from state so it can't drift from what's on screen.
export default function FilterGroup({ title, defaultOpen = false, activeCount = 0, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="filter-group">
      <h3 className="filter-group__heading">
        <button
          type="button"
          id={buttonId}
          className="filter-group__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span>{title}</span>
          {activeCount > 0 && <span className="badge">{activeCount} selected</span>}
        </button>
      </h3>
      {/* hidden: collapsed chips leave the tab order */}
      <div id={panelId} role="group" aria-labelledby={buttonId} hidden={!open} className="filter-group__panel">
        {children}
      </div>
    </div>
  );
}
