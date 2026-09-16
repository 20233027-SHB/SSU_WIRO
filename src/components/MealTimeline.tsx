import type { CSSProperties } from 'react';
import type { Meal, RiskMeta } from '../types';
import { formatClock } from '../utils';
import styles from './MealTimeline.module.css';

interface Props {
  title: string;
  /** 오늘 먹은 식사 (시간 오름차순) */
  meals: Meal[];
  /** 신호등 색·라벨 매핑. JSON 한 곳에서만 정의된 값을 그대로 받아 쓴다. */
  riskMeta: RiskMeta;
  emptyMessage: string;
}

/** 오늘의 식사 타임라인. 사진·이름·시각·신호등·AI 태그를 한 장의 카드로 보여준다. */
export default function MealTimeline({ title, meals, riskMeta, emptyMessage }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{meals.length}끼</span>
      </div>

      {meals.length === 0 ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <ol className={styles.list}>
          {meals.map((meal) => {
            const risk = riskMeta[meal.riskLevel];

            return (
              <li key={meal.id} className={styles.item}>
                <span
                  className={styles.rail}
                  style={{ '--dot': risk.color } as CSSProperties}
                  aria-hidden="true"
                />

                <article className={styles.card}>
                  <span className={styles.photo} role="img" aria-label={meal.name}>
                    {meal.photo}
                  </span>

                  <div className={styles.info}>
                    <div className={styles.topRow}>
                      <h3 className={styles.name}>{meal.name}</h3>
                      <span
                        className={styles.risk}
                        style={{ color: risk.color, background: risk.bg }}
                      >
                        {risk.label}
                      </span>
                    </div>

                    <p className={styles.time}>{formatClock(meal.eatenAt)}</p>

                    {meal.tags.length > 0 && (
                      <ul className={styles.tags}>
                        {meal.tags.map((tag) => (
                          <li key={tag} className={styles.tag}>
                            #{tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
