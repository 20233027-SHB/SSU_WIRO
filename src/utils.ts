/**
 * JSON 원본 데이터 → 화면에 필요한 값으로 바꾸는 순수 함수 모음.
 *
 * 규칙: 이 파일의 함수는 전부 입력만 보고 출력을 만든다(부수효과 없음).
 * 덕분에 "JSON의 어떤 필드가 화면의 어떤 글자가 되는지"를 함수 하나씩 따라가며 확인할 수 있다.
 */
import type { CoachingRule, DigestionStage, Meal } from './types';

const MS_PER_MIN = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
/** 줄바꿈 금지 공백. "2시간 59분"이 줄 사이에서 쪼개지지 않게 한다. */
const NBSP = '\u00a0';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** "{name}님" + { name: '하빈' } → "하빈님" */
export function fillTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

/** Date → "2026-09-15T12:30:00" (로컬 기준. toISOString()은 UTC라 쓰지 않는다) */
export function toLocalIso(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  );
}

/**
 * JSON의 eatenAt 은 데모용으로 날짜가 고정돼 있다.
 * 시:분은 그대로 두고 날짜만 '오늘'로 옮겨서, 언제 실행해도 오늘의 기록처럼 동작하게 한다.
 */
export function hydrateMeals(meals: Meal[], now: Date): Meal[] {
  return meals.map((meal) => {
    const at = new Date(meal.eatenAt);
    const today = new Date(now);
    today.setHours(at.getHours(), at.getMinutes(), at.getSeconds(), 0);
    return { ...meal, eatenAt: toLocalIso(today) };
  });
}

/** 먹은 시각 오름차순 정렬 (원본 배열은 건드리지 않는다) */
export function sortByTime(meals: Meal[]): Meal[] {
  return [...meals].sort(
    (a, b) => new Date(a.eatenAt).getTime() - new Date(b.eatenAt).getTime(),
  );
}

/** 지금 시각 기준으로 "이미 먹은" 식사만. (저녁 식사는 저녁이 돼야 타임라인에 나타난다) */
export function getEatenMeals(meals: Meal[], now: Date): Meal[] {
  return sortByTime(meals).filter(
    (meal) => new Date(meal.eatenAt).getTime() <= now.getTime(),
  );
}

/** 가장 마지막에 먹은 식사. 캐릭터 상태·카운트다운·코칭이 전부 여기서 파생된다. */
export function getLastMeal(meals: Meal[], now: Date): Meal | null {
  const eaten = getEatenMeals(meals, now);
  return eaten.length > 0 ? eaten[eaten.length - 1] : null;
}

/** 해당 시각 이후 지난 시간(분) */
export function minutesSince(iso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / MS_PER_MIN));
}

/** 경과 분 → digestionStages 중 맞는 단계 하나 (조건을 만족하는 가장 높은 단계) */
export function pickDigestionStage(
  stages: DigestionStage[],
  minutesAfterMeal: number,
): DigestionStage | null {
  const sorted = [...stages].sort((a, b) => a.minAfterMinutes - b.minAfterMinutes);
  let picked: DigestionStage | null = null;
  for (const stage of sorted) {
    if (minutesAfterMeal >= stage.minAfterMinutes) picked = stage;
  }
  return picked ?? sorted[0] ?? null;
}

export interface Countdown {
  /** 누워도 되기까지 남은 밀리초 (0이면 안전) */
  ms: number;
  safe: boolean;
  /** 0~1 진행률 (링 그래프용) */
  progress: number;
}

/** 마지막 식사 시각 + lieDownAfterHours 시간을 목표로 남은 시간 계산 */
export function getCountdown(
  lastMealAt: string | null,
  lieDownAfterHours: number,
  now: Date,
): Countdown {
  if (!lastMealAt) return { ms: 0, safe: true, progress: 1 };

  const goalMs = lieDownAfterHours * MS_PER_HOUR;
  const elapsedMs = now.getTime() - new Date(lastMealAt).getTime();
  const remainingMs = Math.max(0, goalMs - elapsedMs);

  return {
    ms: remainingMs,
    safe: remainingMs === 0,
    progress: Math.min(1, Math.max(0, elapsedMs / goalMs)),
  };
}

/** 남은 밀리초 → "1시간 20분" / "23분 41초" / "9초" */
export function formatRemaining(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0 && minutes > 0) return `${hours}시간${NBSP}${minutes}분`;
  if (hours > 0) return `${hours}시간`;
  if (minutes > 0) return `${minutes}분${NBSP}${pad2(seconds)}초`;
  return `${seconds}초`;
}

/** 경과 분 → "2시간 10분" / "40분" */
export function formatElapsed(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours > 0 && rest > 0) return `${hours}시간${NBSP}${rest}분`;
  if (hours > 0) return `${hours}시간`;
  return `${minutes}분`;
}

/** ISO 문자열 → "오후 12:30" */
export function formatClock(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const period = hours < 12 ? '오전' : '오후';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${hour12}:${pad2(date.getMinutes())}`;
}

/** Date → "9월 15일 화요일" */
export function formatToday(now: Date): string {
  return `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS[now.getDay()]}요일`;
}

/**
 * 오늘 먹은 것의 태그 → 코칭 문구 한 줄.
 * 우선순위: ① 마지막 식사의 태그 → ② 오늘 나머지 식사의 태그 → ③ 'default'
 */
export function pickCoachingTip(
  rules: CoachingRule[],
  todaysMeals: Meal[],
  lastMeal: Meal | null,
): string {
  const fallback = rules.find((rule) => rule.matchTag === 'default')?.tip ?? '';
  const tagsByPriority = [
    ...(lastMeal?.tags ?? []),
    ...todaysMeals.flatMap((meal) => meal.tags),
  ];

  for (const tag of tagsByPriority) {
    const matched = rules.find((rule) => rule.matchTag === tag);
    if (matched) return matched.tip;
  }
  return fallback;
}
