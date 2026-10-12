import { forwardRef } from 'react';

// Receives focus after a failed submit. No role="alert": focus already causes
// it to be read, and an alert as well makes NVDA read it twice.
const ErrorSummary = forwardRef(function ErrorSummary({ errors, onSelect }, ref) {
  const count = errors.length;
  return (
    <div ref={ref} tabIndex={-1} role="group" className="alert alert-error error-summary" aria-labelledby="error-summary-title">
      <h3 id="error-summary-title">
        There {count === 1 ? 'is 1 problem' : `are ${count} problems`} with your booking
      </h3>
      <ul>
        {errors.map((e) => (
          <li key={e.field}>
            <a href={e.href} onClick={(ev) => { ev.preventDefault(); onSelect(e.field); }}>{e.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ErrorSummary;
