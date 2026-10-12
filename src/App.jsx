import { useState } from 'react';
import { AnnouncerProvider } from './components/Announcer';
import { useHashRoute } from './hooks/useHashRoute';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ResourceDetail from './pages/ResourceDetail';
import BookRoom from './pages/BookRoom';
import PageHeading from './components/PageHeading';
import Logo from './components/Logo';

const NAV = [
  { section: 'home', href: '#/', label: 'Home' },
  { section: 'catalogue', href: '#/catalogue', label: 'Courses & archives' },
  { section: 'book', href: '#/book', label: 'Book a room' },
];

export default function App({ availabilityDelay }) {
  const route = useHashRoute();
  const [registered, setRegistered] = useState([]);

  const current = route.section === 'resource' ? 'catalogue' : route.section;

  let view;
  switch (route.section) {
    case 'home': view = <Home />; break;
    case 'catalogue': view = <Catalogue key={route.query.get('q') ?? ''} initialQuery={route.query.get('q') ?? ''} />; break;
    case 'resource':
      view = <ResourceDetail key={route.param} id={route.param} registered={registered}
        onRegister={(id) => setRegistered((r) => [...new Set([...r, id])])} />;
      break;
    case 'book': view = <BookRoom availabilityDelay={availabilityDelay} />; break;
    default:
      view = (
        <>
          <PageHeading title="Page not found">Page not found</PageHeading>
          <p><a href="#/">Go to the home page</a></p>
        </>
      );
  }

  return (
    <AnnouncerProvider>
      {/* Focus <main> directly so the hash route isn't changed */}
      <a className="skip-link" href="#main"
        onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to main content
      </a>

      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#/"><Logo />Riverside Library Learning Portal</a>
          <nav className="primary-nav" aria-label="Primary">
            <ul>
              {NAV.map((n) => (
                <li key={n.section}>
                  <a href={n.href} aria-current={current === n.section ? 'page' : undefined}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="page" tabIndex={-1}>
        {view}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>Riverside Public Library, open Monday to Saturday, 09:00 to 17:00</p>
          <p>Prototype for ticket MD-2026-0143. Not a live booking system.</p>
        </div>
      </footer>
    </AnnouncerProvider>
  );
}
