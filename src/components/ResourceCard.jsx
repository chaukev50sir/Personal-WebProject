import { formatLabel, topicLabel, typeLabel } from '../data/resources';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// aria-hidden: the full date is in the <time> element.
function DateStamp({ iso }) {
  const d = new Date(iso);
  return (
    <p className="stamp" aria-hidden="true">
      <span className="stamp-weekday">{DAYS[d.getDay()]}</span>
      <span className="stamp-day">{d.getDate()}</span>
      <span className="stamp-month">{MONTHS[d.getMonth()]}</span>
    </p>
  );
}

export default function ResourceCard({ resource, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const isEvent = Boolean(resource.date);
  const body = (
    <>
      <H id={`card-${resource.id}`} className="card__title">{resource.title}</H>
      <ul className="tags">
        <li className="tag-topic">{topicLabel(resource.topic)}</li>
        <li>{typeLabel(resource.type)}</li>
        <li>{formatLabel(resource.format)}</li>
        <li>{resource.duration}</li>
      </ul>
      {isEvent && <p className="meta"><time dateTime={resource.date}>{resource.when}</time></p>}
      <p>{resource.summary}</p>
      <a href={`#/resource/${resource.id}`}>
        View details<span className="visually-hidden">: {resource.title}</span>
      </a>
    </>
  );

  return (
    <article className={`card spine-${resource.topic}${isEvent ? ' event' : ''}`} aria-labelledby={`card-${resource.id}`}>
      {isEvent ? <><DateStamp iso={resource.date} /><div>{body}</div></> : body}
    </article>
  );
}
