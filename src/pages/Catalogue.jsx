import { useEffect, useMemo, useRef, useState } from 'react';
import PageHeading from '../components/PageHeading';
import FilterGroup from '../components/FilterGroup';
import ToggleButton from '../components/ToggleButton';
import ResourceCard from '../components/ResourceCard';
import { useAnnounce } from '../components/Announcer';
import { FORMATS, RESOURCES, TOPICS, TYPES } from '../data/resources';

const ANNOUNCE_DELAY_MS = 600;

export function filterResources(resources, { query, types, topics, format }) {
  const q = query.trim().toLowerCase();
  return resources.filter((r) =>
    (!q || `${r.title} ${r.summary}`.toLowerCase().includes(q)) &&
    (types.length === 0 || types.includes(r.type)) &&
    (topics.length === 0 || topics.includes(r.topic)) &&
    (format === 'any' || r.format === format));
}

const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export default function Catalogue({ initialQuery = '' }) {
  const announce = useAnnounce();
  const [query, setQuery] = useState(initialQuery);
  const [types, setTypes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [format, setFormat] = useState('any');
  const resultsHeadingRef = useRef(null);

  const results = useMemo(
    () => filterResources(RESOURCES, { query, types, topics, format }),
    [query, types, topics, format],
  );

  // Debounced result-count announcement, skipped until the filters first change
  // (a simple first-run flag breaks under StrictMode's double effects).
  const filterKey = JSON.stringify({ query, types, topics, format });
  const initialKey = useRef(filterKey);
  const hasChanged = useRef(false);
  useEffect(() => {
    if (filterKey !== initialKey.current) hasChanged.current = true;
    if (!hasChanged.current) return undefined;
    const t = setTimeout(() => {
      announce(results.length === 0
        ? 'No resources match your filters.'
        : `Showing ${results.length} of ${RESOURCES.length} resources.`);
    }, ANNOUNCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [filterKey, results.length, announce]);

  const activeFilters = types.length + topics.length + (format !== 'any' ? 1 : 0) + (query ? 1 : 0);

  const clearAll = () => {
    setQuery(''); setTypes([]); setTopics([]); setFormat('any');
    // This button unmounts, so move focus somewhere useful.
    resultsHeadingRef.current?.focus();
  };

  return (
    <>
      <PageHeading title="Courses and archives">Courses and learning archives</PageHeading>
      <p>Search free courses, recorded lectures, e-books and events. Filters update the results straight away.</p>

      <div className="with-sidebar">
        <aside aria-labelledby="filter-heading" className="filters">
          <h2 id="filter-heading">Filter results</h2>

          <div className="field">
            <label htmlFor="catalogue-q">Search by keyword</label>
            <span id="catalogue-q-hint" className="hint">Results update as you type.</span>
            <input
              type="search"
              id="catalogue-q"
              value={query}
              aria-describedby="catalogue-q-hint"
              aria-controls="results-list"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <FilterGroup title="Resource type" defaultOpen activeCount={types.length}>
            <div className="chip-row">
              {TYPES.map((t) => (
                <ToggleButton key={t.id} pressed={types.includes(t.id)} onToggle={() => setTypes((l) => toggleIn(l, t.id))}>
                  {t.label}
                </ToggleButton>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Topic" activeCount={topics.length}>
            <div className="chip-row">
              {TOPICS.map((t) => (
                <ToggleButton key={t.id} spine={t.id} pressed={topics.includes(t.id)} onToggle={() => setTopics((l) => toggleIn(l, t.id))}>
                  {t.label}
                </ToggleButton>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Format" activeCount={format !== 'any' ? 1 : 0}>
            {/* Single choice: native radios */}
            <fieldset className="plain-fieldset">
              <legend className="visually-hidden">Format</legend>
              {FORMATS.map((f) => (
                <div className="choice" key={f.id}>
                  <input type="radio" id={`format-${f.id}`} name="format" value={f.id}
                    checked={format === f.id} onChange={() => setFormat(f.id)} />
                  <label htmlFor={`format-${f.id}`}>{f.label}</label>
                </div>
              ))}
            </fieldset>
          </FilterGroup>

          {activeFilters > 0 && (
            <button type="button" className="button button-secondary clear-btn" onClick={clearAll}>
              Clear all filters<span className="visually-hidden"> ({activeFilters} active)</span>
            </button>
          )}
        </aside>

        <section aria-labelledby="results-heading">
          <h2 id="results-heading" ref={resultsHeadingRef} tabIndex={-1}>Results</h2>
          {/* Not a live region: announcements go through the Announcer */}
          <p className="result-count" data-testid="result-count">
            Showing {results.length} of {RESOURCES.length} resources
          </p>
          {results.length === 0 && (
            <p className="empty">No resources match. Try removing a filter or using a shorter keyword.</p>
          )}
          {/* Always mounted so aria-controls has a target */}
          <ul id="results-list" className="results">
            {results.map((r) => (
              <li key={r.id}><ResourceCard resource={r} /></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
