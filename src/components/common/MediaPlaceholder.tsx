import type { MediaType } from '../../types';
import { Icon } from './Icon';
import s from './common.module.css';

const icon = { IMAGE: 'image', AUDIO: 'audio', VIDEO: 'video', TEXT: 'text' } as const;

/** Neutral stand-in for future media. When `src` is provided, renders the real media instead. */
export function MediaPlaceholder({ media, caption, src, tone = 'dark' }: { media: MediaType; caption: string; src?: string; tone?: 'dark' | 'paper' }) {
  if (src && media === 'IMAGE') return <img className={s.mediaReal} src={src} alt={caption} />;
  if (src && media === 'AUDIO') return <audio className={s.mediaReal} src={src} controls />;
  if (src && media === 'VIDEO') return <video className={s.mediaReal} src={src} controls />;
  return (
    <figure className={`${s.media} ${tone === 'paper' ? s.mediaPaper : ''}`}>
      <Icon name={icon[media]} size={22} />
      <figcaption>
        <span className="mono">{media} · NO SIGNAL</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
