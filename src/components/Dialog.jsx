import { useEffect, useRef } from 'react';

// Native <dialog> + showModal(): the page behind becomes inert and Escape
// closes it, so no hand-rolled focus trap is needed. The caller decides where
// focus returns, since the trigger may be gone after the action.
export default function Dialog({ open, onClose, title, children, actions, returnFocus, initialFocusRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      (initialFocusRef?.current ?? dlg.querySelector('button'))?.focus();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open, initialFocusRef]);

  // Callbacks live in refs so the 'close' listener is attached once. Re-attaching
  // per render removed it in the same commit that called dlg.close(), and focus
  // was never returned.
  const onCloseRef = useRef(onClose);
  const returnFocusRef = useRef(returnFocus);
  onCloseRef.current = onClose;
  returnFocusRef.current = returnFocus;

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return undefined;
    const handleClose = () => {
      onCloseRef.current?.();
      // Return focus after the browser finishes closing.
      setTimeout(() => returnFocusRef.current?.(), 0);
    };
    // Escape and dlg.close() both end in 'close', so this runs once per close.
    dlg.addEventListener('close', handleClose);
    return () => dlg.removeEventListener('close', handleClose);
  }, []);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-body">
      <h2 id="dialog-title">{title}</h2>
      <div id="dialog-body">{children}</div>
      <div className="dialog__actions">{actions}</div>
    </dialog>
  );
}
