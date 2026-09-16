import styles from './CoachingCard.module.css';

interface Props {
  title: string;
  /** 오늘 먹은 것의 태그에 매칭된 코칭 한 줄 */
  tip: string;
}

/** 오늘의 맞춤 코칭. 문구는 JSON coaching 배열에서 골라온 값이다. */
export default function CoachingCard({ title, tip }: Props) {
  return (
    <section className={styles.card}>
      <span className={styles.icon} role="img" aria-hidden="true">
        💡
      </span>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.tip}>{tip}</p>
      </div>
    </section>
  );
}
