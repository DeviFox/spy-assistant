import { useOperation } from '../../store/operationStore';
import { documents } from '../../data/documents';
import { equipment } from '../../data/equipment';
import { archiveEntries } from '../../data/archive';
import { Icon } from '../../components/common/Icon';
import { Redacted } from '../../components/common/Redacted';
import s from './mission.module.css';

const mediaIcon = { TEXT: 'text', IMAGE: 'image', AUDIO: 'audio', VIDEO: 'video' } as const;

/** Everything the agent has received so far: files to (re)read and equipment found. */
export function Materials() {
  const docs = useOperation((st) => st.documents);
  const archive = useOperation((st) => st.archive);
  const items = useOperation((st) => st.items);
  const view = useOperation((st) => st.view);

  const files = [
    ...documents.filter((d) => docs[d.id]).map((d) => ({
      key: `doc:${d.id}`, kind: 'doc' as const, id: d.id, name: d.filename, icon: 'files' as const, fresh: docs[d.id].status === 'available',
    })),
    ...archiveEntries.filter((a) => archive[a.id]).map((a) => ({
      key: `arc:${a.id}`, kind: 'arc' as const, id: a.id, name: a.title, icon: mediaIcon[a.media], fresh: false,
    })),
  ];

  return (
    <section className={s.materials} aria-label="Материалы">
      <header className={s.matHead}>
        <h2 className={s.matLabel}>FILES</h2>
        <span className="cap">{files.length}</span>
      </header>
      <ul className={s.matList}>
        {files.map((f) => (
          <li key={f.key}>
            <button className={s.matRow} onClick={() => view({ kind: f.kind, id: f.id })}>
              <Icon name={f.icon} size={16} />
              <span className={s.matName}>{f.name}</span>
              <span className={`${s.matState} ${f.fresh ? s.hot : ''}`}>{f.fresh ? 'NEW' : 'OPEN'}</span>
            </button>
          </li>
        ))}
      </ul>

      <header className={s.matHead}>
        <h2 className={s.matLabel}>EQUIPMENT</h2>
        <span className="cap">{Object.keys(items).length} / {equipment.length}</span>
      </header>
      <ul className={s.matList}>
        {equipment.map((e) => {
          const found = Boolean(items[e.id]);
          return (
            <li key={e.id} className={`${s.matItem} ${found ? s.found : ''}`} title={found ? e.details : undefined}>
              <Icon name={found ? e.icon : 'lock'} size={16} />
              <span className={s.matName}>
                <Redacted locked={!found} revealKey={`item:${e.id}`} chars={14}>{e.name}</Redacted>
                {!found && <span className="visually-hidden">Предмет не найден</span>}
              </span>
              <span className={s.matState}>{found ? 'FOUND' : 'CLASSIFIED'}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
