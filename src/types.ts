/**
 * WIRO 홈 화면에서 쓰는 데이터 타입.
 * `public/data/home.json` (= DB 역할) 의 구조를 그대로 옮긴 것이다.
 * 화면에 보이는 모든 값은 이 타입을 통과해서 들어온다.
 */

/** 신호등 3단계. 이 세 값 외에는 존재하지 않는다. */
export type RiskLevel = 'green' | 'yellow' | 'red';

/** 소화 단계. 'idle' 은 JSON에 없는, "아직 식사 기록 없음" 전용 상태다. */
export type DigestionState = 'digesting' | 'easing' | 'safe' | 'idle';

export interface User {
  name: string;
  /** 식후 몇 시간 뒤부터 누워도 되는지 (카운트다운 목표) */
  lieDownAfterHours: number;
}

/** 화면에 뿌려지는 문구들. {name} 같은 자리표시자는 fillTemplate() 로 채운다. */
export interface Content {
  appName: string;
  greeting: string;
  digestionTitle: string;
  digestionCaption: string;
  countdownTitle: string;
  countdownRemaining: string;
  countdownSafe: string;
  countdownCaption: string;
  countdownNoMeal: string;
  timelineTitle: string;
  timelineEmpty: string;
  coachingTitle: string;
  addMealLabel: string;
  addMealHint: string;
  noMealEmoji: string;
  noMealMessage: string;
  disclaimer: string;
}

/** 신호등 색·라벨 매핑. 코드에 흩뿌리지 않고 JSON 한 곳에서만 정의한다. */
export interface RiskMetaItem {
  label: string;
  color: string;
  bg: string;
}
export type RiskMeta = Record<RiskLevel, RiskMetaItem>;

export interface DigestionStage {
  /** 식후 경과 시간(분)이 이 값 이상이면 이 단계가 된다. */
  minAfterMinutes: number;
  state: DigestionState;
  emoji: string;
  message: string;
}

export interface Meal {
  id: number;
  name: string;
  /** 사진 대신 쓰는 이모지 (과제 범위상 placeholder) */
  photo: string;
  /** 로컬 시각 ISO 문자열: "2026-09-15T12:30:00" */
  eatenAt: string;
  riskLevel: RiskLevel;
  /** AI가 자동 태깅했다고 가정하는 위험 성분 */
  tags: string[];
}

export interface CoachingRule {
  /** 이 태그가 오늘 식사에 있으면 아래 tip 을 보여준다. 'default' 는 매칭 실패 시 사용. */
  matchTag: string;
  tip: string;
}

/** "사진으로 식사 추가" 버튼이 시뮬레이션하는 AI 태깅 결과 후보 */
export interface AiScanSample {
  name: string;
  photo: string;
  riskLevel: RiskLevel;
  tags: string[];
}

/** home.json 전체 = 이 앱의 DB 한 덩어리 */
export interface HomeData {
  user: User;
  content: Content;
  riskMeta: RiskMeta;
  digestionStages: DigestionStage[];
  meals: Meal[];
  coaching: CoachingRule[];
  aiScanSamples: AiScanSample[];
}
