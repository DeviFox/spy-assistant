import { useEffect, useRef } from 'react';
import { useOperation } from '../../store/operationStore';
import { findDocument } from '../../features/operation/engine';
import { operation } from '../../data/operation';
import { archiveEntries } from '../../data/archive';
import type { CaseDocument } from '../../types';
import { MediaPlaceholder } from '../../components/common/MediaPlaceholder';
import { Icon } from '../../components/common/Icon';
import s from './viewer.module.css';

const stamp = (ts: number) => new Date(ts).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });

/** Material viewer laid over the mission screen. Esc, the close button or the backdrop return to the task. */
export function Viewer() {
  const viewing = useOperation((st) => st.viewing);
  const view = useOperation((st) => st.view);
  const docState = useOperation((st) => (viewing?.kind === 'doc' ? st.documents[viewing.id] : undefined));
  const arcState = useOperation((st) => (viewing?.kind === 'arc' ? st.archive[viewing.id] : undefined));
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!viewing) return;
    const back = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && view(null);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      back?.focus?.();
    };
  }, [viewing, view]);

  if (!viewing) return null;
  const doc = viewing.kind === 'doc' ? findDocument(viewing.id) : undefined;
  const arc = viewing.kind === 'arc' ? archiveEntries.find((a) => a.id === viewing.id) : undefined;
  const received = docState?.receivedAt ?? arcState?.unlockedAt;
  const title = doc?.filename ?? arc?.title ?? viewing.id;

  return (
    <div className={s.backdrop} onMouseDown={(e) => e.target === e.currentTarget && view(null)}>
      <div className={`${s.dialog} page-in`} role="dialog" aria-modal="true" aria-label={title}>
        <div className={s.bar}>
          <span className={s.barMeta}>
            <span>{viewing.id}</span>
            {received && <span>RECEIVED {stamp(received)}</span>}
          </span>
          <button ref={closeRef} className={s.close} onClick={() => view(null)}>
            <Icon name="close" size={16} /> ЗАКРЫТЬ
          </button>
        </div>

        {doc && docState && <Sheet doc={doc} />}
        {arc && arcState && (
          <article className={s.entry}>
            <h2 className={s.entryTitle}>{arc.title}</h2>
            <p className={s.entryDesc}>{arc.description}</p>
            <MediaPlaceholder media={arc.media} caption={arc.description} src={arc.src} />
          </article>
        )}
        {!(doc && docState) && !(arc && arcState) && (
          <p className={s.denied}>ACCESS DENIED · материал засекречен.</p>
        )}
      </div>
    </div>
  );
}

/** A document rendered as a paper sheet. */
function Sheet({ doc }: { doc: CaseDocument }) {
  return (
    <article className={s.sheet} aria-label={doc.filename}>
      <header className={s.sheetHead}>
        <span>{operation.title} · {doc.id}</span>
        <span className={s.sheetClass}>{doc.classification}</span>
      </header>
      <div className={s.sheetBody}>
        {doc.content.map((b, i) => {
          switch (b.kind) {
            case 'heading': return <h1 key={i} className={s.sheetTitle}>{b.text}</h1>;
            case 'section': return <h2 key={i} className={s.sheetSection}>{b.text}</h2>;
            case 'paragraph': return <p key={i} className={s.sheetP}>{b.text}</p>;
            case 'fields': {
              const table = (
                <table key={i} className={s.sheetTable}>
                  <tbody>
                    {b.rows.map(([k, v]) => (
                      <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              );
              if (!b.photo) return table;
              return (
                <div key={i} className={s.withPhoto}>
                  {table}
                  <figure className={s.photo}>
                    <img src={b.photo.src} alt={b.photo.caption} />
                    <figcaption>{b.photo.caption}</figcaption>
                  </figure>
                </div>
              );
            }
            case 'media':
              if (b.src && b.media === 'IMAGE' && b.frame) {
                return (
                  <figure key={i} className={b.frame === 'photo' ? s.photo : s.scan}>
                    <a href={b.src} target="_blank" rel="noreferrer"><img src={b.src} alt={b.caption} /></a>
                    <figcaption>{b.caption}</figcaption>
                  </figure>
                );
              }
              return <MediaPlaceholder key={i} media={b.media} caption={b.caption} src={b.src} tone="paper" />;
          }
        })}
      </div>
      <footer className={s.sheetFoot}>
        <span>{doc.filename}</span>
        <span>{doc.category} · {doc.type}</span>
      </footer>
    </article>
  );
}
