// Multi-select filter chip. Only aria-pressed changes between states; the
// label stays the same (APG toggle button pattern). `spine` = topic colour.
export default function ToggleButton({ pressed, onToggle, spine, children }) {
  return (
    <button type="button" className={`chip${spine ? ` spine-${spine}` : ''}`} aria-pressed={pressed} onClick={onToggle}>
      {children}
    </button>
  );
}
