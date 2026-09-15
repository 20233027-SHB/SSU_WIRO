import AddMealButton from '../components/AddMealButton';
import CoachingCard from '../components/CoachingCard';
import DigestionCharacter from '../components/DigestionCharacter';
import Header from '../components/Header';
import LieDownCountdown from '../components/LieDownCountdown';
import MealTimeline from '../components/MealTimeline';
import { useHomeData } from '../hooks/useHomeData';
import { useNow } from '../hooks/useNow';
import type { DigestionStage } from '../types';
import {
  fillTemplate,
  formatClock,
  formatElapsed,
  formatRemaining,
  getCountdown,
  getEatenMeals,
  getLastMeal,
  minutesSince,
  pickCoachingTip,
  pickDigestionStage,
} from '../utils';
import styles from './HomePage.module.css';

/**
 * WIRO 홈 화면.
 *
 * 이 파일이 데이터 흐름의 허브다.
 *   ① useHomeData()  : JSON → state
 *   ② 파생 계산       : utils.ts 의 순수 함수로 "화면에 쓸 값"을 만든다
 *   ③ props 전달      : 자식 컴포넌트는 계산된 값을 받아 그리기만 한다
 */
export default function HomePage() {
  // ── ① DB(JSON) → state ────────────────────────────────────────────────
  const { data, loading, error, addMeal } = useHomeData();
  const now = useNow(1000); // 1초마다 갱신 → 경과시간·카운트다운이 살아 움직인다

  if (loading) {
    return (
      <main className={styles.phone}>
        <p className={styles.status}>불러오는 중…</p>
      </main>
    );
  }

  if (error !== null || data === null) {
    return (
      <main className={styles.phone}>
        <p className={styles.status}>{error ?? '데이터를 불러오지 못했어요'}</p>
      </main>
    );
  }

  const { user, content, riskMeta, digestionStages, meals, coaching } = data;

  // ── ② 파생 계산 (원본 데이터 + 현재 시각 → 화면에 쓸 값) ────────────────
  const todaysMeals = getEatenMeals(meals, now);
  const lastMeal = getLastMeal(meals, now);
  const minutesAfterMeal = lastMeal !== null ? minutesSince(lastMeal.eatenAt, now) : null;

  // 아직 오늘 먹은 게 없을 때 쓰는 단계 (JSON 문구를 그대로 가져와 조립)
  const idleStage: DigestionStage = {
    minAfterMinutes: 0,
    state: 'idle',
    emoji: content.noMealEmoji,
    message: content.noMealMessage,
  };

  const stage =
    minutesAfterMeal !== null
      ? pickDigestionStage(digestionStages, minutesAfterMeal) ?? idleStage
      : idleStage;

  const digestionCaption =
    minutesAfterMeal !== null
      ? fillTemplate(content.digestionCaption, { elapsed: formatElapsed(minutesAfterMeal) })
      : content.countdownNoMeal;

  const countdown = getCountdown(
    lastMeal?.eatenAt ?? null,
    user.lieDownAfterHours,
    now,
  );

  const countdownRemaining = countdown.safe
    ? content.countdownSafe
    : fillTemplate(content.countdownRemaining, { time: formatRemaining(countdown.ms) });

  const countdownCaption =
    lastMeal !== null
      ? fillTemplate(content.countdownCaption, {
          meal: lastMeal.name,
          time: formatClock(lastMeal.eatenAt),
        })
      : content.countdownNoMeal;

  const coachingTip = pickCoachingTip(coaching, todaysMeals, lastMeal);

  // ── ③ 계산된 값을 props 로 내려보낸다 ──────────────────────────────────
  return (
    <main className={styles.phone}>
      <Header content={content} user={user} now={now} />

      <DigestionCharacter
        title={content.digestionTitle}
        stages={digestionStages}
        stage={stage}
        caption={digestionCaption}
      />

      <LieDownCountdown
        title={content.countdownTitle}
        remaining={countdownRemaining}
        caption={countdownCaption}
        progress={countdown.progress}
        safe={countdown.safe}
      />

      <MealTimeline
        title={content.timelineTitle}
        meals={todaysMeals}
        riskMeta={riskMeta}
        emptyMessage={content.timelineEmpty}
      />

      <CoachingCard title={content.coachingTitle} tip={coachingTip} />

      <AddMealButton
        label={content.addMealLabel}
        hint={content.addMealHint}
        onAdd={addMeal}
      />

      <p className={styles.disclaimer}>{content.disclaimer}</p>
    </main>
  );
}
