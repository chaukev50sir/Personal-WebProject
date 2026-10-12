import { useEffect, useRef } from 'react';
import { hasNavigated } from '../hooks/useHashRoute';

// View <h1>: sets document.title and takes focus after in-app navigation, so
// the new view is announced. Not on first load, so the skip link stays first.
export default function PageHeading({ children, title }) {
  const ref = useRef(null);
  useEffect(() => {
    document.title = `${title} – Riverside Library Learning Portal`;
    if (hasNavigated()) ref.current?.focus();
  }, [title]);

  return (
    <h1 ref={ref} tabIndex={-1} className="page-title">
      {children}
    </h1>
  );
}
