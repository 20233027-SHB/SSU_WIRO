import type { DigestionStage } from '../types';
import { formatElapsed } from '../utils';
import styles from './DigestionCharacter.module.css';

interface Props {
  title: string;
  /** JSON 의 digestionStages 전체 (아래 단계 트랙을 그리는 데 쓴다) */
  stages: DigestionStage[];
  /** 지금 해당하는 단계 하나 */
  stage: DigestionStage;
  caption: string;
}

/**
 * WIRO 시그니처: 지금 소화 상태를 캐릭터로 보여준다.
 * 이모지·문구·단계 구분선까지 전부 JSON 의 digestionStages 에서 나온다.
 */
export default function DigestionCharacter({ title, stages, stage, caption }: Props) {
  return (
    <section className={styles.card} data-state={stage.state}>
      <p className={styles.title}>{title}</p>

      <div className={styles.body}>
        <div className={styles.blobWrap}>
          <span className={styles.halo} aria-hidden="true" />
          <span className={styles.blob} role="img" aria-label={stage.message}>
            {stage.emoji}
          </span>
        </div>

        <div className={styles.text}>
          <p className={styles.message}>{stage.message}</p>
          <p className={styles.caption}>{caption}</p>
        </div>
      </div>

      <ol className={styles.track}>
        {stages.map((item) => (
          <li
            key={item.state}
            className={styles.step}
            data-active={item.state === stage.state}
          >
            <span className={styles.stepEmoji}>{item.emoji}</span>
            <span className={styles.stepLabel}>{formatElapsed(item.minAfterMinutes)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
