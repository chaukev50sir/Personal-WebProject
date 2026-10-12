import { createContext, useCallback, useContext, useRef, useState } from 'react';

// App-wide live regions, mounted once. Regions that mount together with their
// text are often not announced, so these stay in the DOM and only their text
// changes. Clearing first lets an identical message be announced again.
const AnnouncerContext = createContext(() => {});

export function AnnouncerProvider({ children }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const timer = useRef();

  const announce = useCallback((message, politeness = 'polite') => {
    const set = politeness === 'assertive' ? setAssertive : setPolite;
    set('');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => set(message), 50);
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true" data-testid="live-polite">
        {polite}
      </div>
      <div className="visually-hidden" aria-live="assertive" aria-atomic="true" data-testid="live-assertive">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

export const useAnnounce = () => useContext(AnnouncerContext);
