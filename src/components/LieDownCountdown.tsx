import type { CSSProperties } from 'react';
import styles from './LieDownCountdown.module.css';

interface Props {
  title: string;
  /** "누우려면 1시간 20분 남음" 또는 "지금은 누워도 안전해요" */
  remaining: string;
  caption: string;
  /** 0~1. 마지막 식사 → 목표 시각까지의 진행률 */
  progress: number;
  safe: boolean;
}

/** 마지막 식사 + lieDownAfterHours 시간까지 남은 시간을 보여주는 카드 */
export default function LieDownCountdown({
  title,
  remaining,
  caption,
  progress,
  safe,
}: Props) {
  const ringStyle = {
    '--progress': `${Math.round(progress * 100)}%`,
  } as CSSProperties;

  return (
    <section className={styles.card} data-safe={safe}>
      <p className={styles.title}>{title}</p>

      <div className={styles.body}>
        <div className={styles.ring} style={ringStyle}>
          <span className={styles.ringInner} role="img" aria-hidden="true">
            {safe ? '😴' : '🛏️'}
          </span>
        </div>

        <div className={styles.text}>
          <p className={styles.remaining}>{remaining}</p>
          <p className={styles.caption}>{caption}</p>
        </div>
      </div>
    </section>
  );
}
