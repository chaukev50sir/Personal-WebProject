import { useEffect, useState } from 'react';

// Hash routing: deploys as static files, Back/Forward still work.
// Routes: #/  #/catalogue[?q=]  #/resource/:id  #/book
export function parseHash(hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  const [, section = '', param] = path.split('/');
  return { section: section || 'home', param, query: new URLSearchParams(search) };
}

let navigated = false;
export const hasNavigated = () => navigated;
export const __resetNavigated = () => { navigated = false; };

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => { navigated = true; setRoute(parseHash(window.location.hash)); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
