import { useState } from 'react';
import PageHeading from '../components/PageHeading';
import ResourceCard from '../components/ResourceCard';
import HeroShelf from '../components/HeroShelf';
import { RESOURCES } from '../data/resources';

const SERVICES = [
  { spine: 'digital', title: 'Free courses', text: 'Digital skills, languages and job-readiness, in person and online.', href: '#/catalogue', link: 'Browse courses' },
  { spine: 'languages', title: 'Learning archives', text: 'Recorded lectures, e-books and audiobooks, all with transcripts.', href: '#/catalogue', link: 'Browse archives' },
  { spine: 'careers', title: 'Study rooms', text: 'Rooms for 1 to 12 people, free for library members.', href: '#/book', link: 'Book a room' },
];

export default function Home() {
  const [q, setQ] = useState('');
  const events = RESOURCES.filter((r) => r.type === 'event');

  const onSearch = (e) => {
    e.preventDefault();
    window.location.hash = `#/catalogue${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`;
  };

  return (
    <>
      <div className="hero">
        <div>
          <PageHeading title="Home">Learn, borrow and meet at your library</PageHeading>
          <p className="lede">Free courses, recorded lectures, study rooms and events for everyone in the municipality.</p>

          <section aria-labelledby="home-search-heading" className="search-panel">
            <h2 id="home-search-heading">Search the catalogue</h2>
            <form role="search" aria-labelledby="home-search-heading" onSubmit={onSearch} className="search-row">
              <div className="field">
                <label htmlFor="home-q">Search courses, archives and events</label>
                <span id="home-q-hint" className="hint">For example: Excel, isiZulu, interview</span>
                <input type="search" id="home-q" value={q} aria-describedby="home-q-hint" onChange={(e) => setQ(e.target.value)} />
              </div>
              <button type="submit" className="button">Search</button>
            </form>
          </section>
        </div>
        <HeroShelf />
      </div>

      <section aria-labelledby="services-heading">
        <h2 id="services-heading">What you can do here</h2>
        <ul className="grid plain-list">
          {SERVICES.map((s) => (
            <li key={s.title} className={`service spine-${s.spine}`}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <a href={s.href}>{s.link}<span className="visually-hidden">: {s.title.toLowerCase()}</span></a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="events-heading">
        <h2 id="events-heading">Upcoming events</h2>
        <ul className="results">
          {events.map((ev) => <li key={ev.id}><ResourceCard resource={ev} /></li>)}
        </ul>
      </section>

      <aside aria-labelledby="access-heading" className="panel">
        <h2 id="access-heading">Accessibility at the library</h2>
        <p>Every public PC has NVDA, JAWS and a screen magnifier. The media room also has a braille display. Tell us about any support you need when you book.</p>
      </aside>
    </>
  );
}
