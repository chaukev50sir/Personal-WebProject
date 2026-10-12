import { useRef, useState } from 'react';
import PageHeading from '../components/PageHeading';
import Dialog from '../components/Dialog';
import { RESOURCES, formatLabel, topicLabel, typeLabel } from '../data/resources';

export default function ResourceDetail({ id, registered, onRegister }) {
  const resource = RESOURCES.find((r) => r.id === id);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const confirmRef = useRef(null);
  const successRef = useRef(null);
  const justConfirmed = useRef(false);

  if (!resource) {
    return (
      <>
        <PageHeading title="Resource not found">Resource not found</PageHeading>
        <p>We couldn't find that resource. <a href="#/catalogue">Go back to courses and archives</a>.</p>
      </>
    );
  }

  const isRegistered = registered.includes(resource.id);
  const actionWord = resource.type === 'archive' ? 'Save to my list' : 'Register';

  const confirm = () => {
    justConfirmed.current = true;
    onRegister(resource.id);
    setOpen(false);
  };

  // Cancel/Escape -> back to the trigger. Confirm removes the trigger, so focus
  // goes to the success message instead.
  const returnFocus = () => {
    const target = justConfirmed.current ? successRef.current : triggerRef.current;
    justConfirmed.current = false;
    target?.focus();
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li><a href="#/">Home</a></li>
          <li><a href="#/catalogue">Courses and archives</a></li>
          <li><a href={`#/resource/${resource.id}`} aria-current="page">{resource.title}</a></li>
        </ol>
      </nav>

      <PageHeading title={resource.title}>{resource.title}</PageHeading>

      <div className="with-sidebar sidebar-right">
        <article aria-labelledby="about-heading">
          <h2 id="about-heading">About this {typeLabel(resource.type).toLowerCase()}</h2>
          <p>{resource.summary}</p>
          <dl className="details-list">
            <div><dt>Type</dt><dd>{typeLabel(resource.type)}</dd></div>
            <div><dt>Topic</dt><dd>{topicLabel(resource.topic)}</dd></div>
            <div><dt>Format</dt><dd>{formatLabel(resource.format)}</dd></div>
            <div><dt>Length</dt><dd>{resource.duration}</dd></div>
            <div><dt>When</dt><dd>{resource.when}</dd></div>
          </dl>

          <h2>Accessibility</h2>
          <ul>{resource.access.map((a) => <li key={a}>{a}</li>)}</ul>

          {isRegistered ? (
            <p ref={successRef} tabIndex={-1} className="alert alert-success">
              {resource.type === 'archive'
                ? `${resource.title} is saved to your list.`
                : `You are registered for ${resource.title}. A confirmation email is on its way.`}
            </p>
          ) : (
            <button ref={triggerRef} type="button" className="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
              {actionWord}<span className="visually-hidden">: {resource.title}</span>
            </button>
          )}
        </article>

        <aside aria-labelledby="related-heading" className="panel">
          <h2 id="related-heading">Need a room to study?</h2>
          <p>The media room has NVDA, ZoomText and a braille display.</p>
          <a href="#/book">Book a study room</a>
        </aside>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`${actionWord}: ${resource.title}`}
        returnFocus={returnFocus}
        initialFocusRef={confirmRef}
        actions={(
          <>
            <button ref={confirmRef} type="button" className="button" onClick={confirm}>Confirm</button>
            <button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Cancel</button>
          </>
        )}
      >
        <p>{resource.when}. {formatLabel(resource.format)}.</p>
        <p>We'll use the email address on your library account. Press Escape or Cancel to go back without changes.</p>
      </Dialog>
    </>
  );
}
