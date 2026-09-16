# WIRO 홈 화면 (Desk Critic MVP)

역류성 식도염 관리 서비스 **WIRO(위로)** 의 홈 화면 한 페이지.
음식 사진 한 장으로 식단 분석부터 식후 생활습관 알림까지 1:1로 케어하는 AI 코치.

> 이 과제의 목표는 기능 개수가 아니라 **"JSON(DB) 하나가 화면이 되는 과정"을 코드로 따라갈 수 있게 만드는 것**이다.

---

## 실행

```bash
npm install
npm run dev
```

http://localhost:5173 에서 확인. 모바일 폭(375~430px) 기준이고, 데스크톱에서는 가운데 목업으로 보인다.

- `npm run build` : 타입 체크 + 프로덕션 빌드
- `npm run lint` : 정적 검사

---

## 데이터 흐름 (이 프로젝트의 핵심)

```
public/data/home.json                 ← DB 역할. 화면에 보이는 모든 값의 출처
        │
        │  fetch (마운트 시 1회)
        ▼
useHomeData()                         ← src/hooks/useHomeData.ts
        │  useState<HomeData | null>
        │  addMeal() 로만 데이터가 바뀐다
        ▼
<HomePage>                            ← src/pages/HomePage.tsx
        │
        │  파생 계산 (src/utils.ts 의 순수 함수)
        │   ├ getLastMeal()          마지막 식사
        │   ├ minutesSince()         식후 경과 분
        │   ├ pickDigestionStage()   경과 분 → 캐릭터 단계
        │   ├ getCountdown()         남은 시간 / 진행률
        │   ├ pickCoachingTip()      태그 → 코칭 문구
        │   └ fillTemplate()         "{name}님" → "하빈님"
        │
        ├─▶ <Header       content user now />
        ├─▶ <DigestionCharacter stages stage caption />
        ├─▶ <LieDownCountdown   remaining caption progress safe />
        ├─▶ <MealTimeline       meals riskMeta />
        ├─▶ <CoachingCard       tip />
        └─▶ <AddMealButton      label hint onAdd />
                                      ↑
                    클릭 → addMeal() → state 의 meals 에 한 끼 추가 → 전체 리렌더
```

규칙 3가지:

1. **데이터 입구는 `useHomeData()` 하나뿐이다.** 컴포넌트가 JSON을 직접 읽는 곳은 없다.
2. **계산은 전부 `src/utils.ts` 의 순수 함수**에서 한다. 입력만 보고 출력을 만들기 때문에 어떤 필드가 어떤 글자가 되는지 함수 단위로 따라갈 수 있다.
3. **컴포넌트는 계산된 값을 받아 그리기만 한다.** 컴포넌트 안에 하드코딩된 표시 데이터는 없다.

---

## JSON을 수정하면 화면이 어떻게 바뀌나

`public/data/home.json` 을 저장하고 브라우저를 새로고침하면:

- `user.name` 을 바꾸면 헤더 인사말이, `user.lieDownAfterHours` 를 `1` 로 바꾸면 눕기 카운트다운의 목표 시간과 링 진행률이 즉시 바뀐다.
- `digestionStages` 의 `message`·`emoji`·`minAfterMinutes` 를 바꾸면 캐릭터 문구와 단계 트랙(3칸)이 그대로 따라 바뀐다. 배열에 단계를 하나 더 넣으면 트랙도 4칸이 된다.
- `meals` 에 항목을 추가하거나 `riskLevel` 을 `green ↔ red` 로 바꾸면 타임라인 카드·신호등 색·점 색이 함께 바뀐다.
- `riskMeta` 의 색과 라벨은 한 곳에서만 정의되므로, 여기만 고치면 화면의 모든 신호등 표현이 한 번에 바뀐다.
- `coaching` 의 `matchTag` 는 오늘 먹은 식사의 태그와 매칭된다. 마지막 식사의 태그가 우선이고, 매칭되는 게 없으면 `default` 문구가 나온다.

---

## Desk Critic 시연 시나리오

1. 현재 화면 설명 — 캐릭터 상태·카운트다운·타임라인·코칭이 전부 JSON 한 파일에서 나온 값임을 보여준다.
2. **[사진으로 식사 추가]** 버튼 클릭 → `state` 의 `meals` 에 한 끼(방금 시각)가 추가된다.
   - 타임라인에 카드가 생기고
   - 캐릭터가 "열심히 소화 중이에요"로 돌아가고
   - 카운트다운이 3시간부터 다시 흐르고
   - 코칭 문구가 새 식사의 태그에 맞게 바뀐다.
   → **데이터 한 곳이 바뀌자 화면 네 군데가 동시에 따라온 것**이 이 과제의 포인트.
3. `home.json` 을 열어 값 하나를 고치고 새로고침 → 같은 흐름을 데이터 쪽에서 다시 보여준다.

---

## 파일 구조

```
public/data/home.json         DB 역할의 정적 JSON
src/
├─ types.ts                   HomeData / Meal / DigestionStage … 타입 정의
├─ utils.ts                   JSON → 화면 값으로 바꾸는 순수 함수 모음
├─ hooks/
│  ├─ useHomeData.ts          fetch → state, addMeal()
│  └─ useNow.ts               1초마다 현재 시각 갱신 (카운트다운용)
├─ pages/
│  └─ HomePage.tsx            파생 계산 + 조립 (데이터 흐름의 허브)
├─ components/                순수 표시용 컴포넌트 6개 (+ CSS Modules)
├─ index.css                  디자인 토큰 / 리셋
└─ main.tsx                   진입점 (라우팅 없음, 페이지 1개)
```

기술 스택: React + TypeScript + Vite, CSS Modules, 상태관리 라이브러리 없이 `useState` / `useEffect` 만 사용. 외부 UI·차트 라이브러리 없음.

---

## 구현 메모

- `lieDownAfterHours` 는 JSON 예시 구조를 따라 `user` 안에 두었다 (`user.lieDownAfterHours`). 값이 한 곳에만 있어야 신호등·코칭처럼 "한 군데만 고치면 전부 바뀐다"가 성립한다.
- `meals[].eatenAt` 은 데모용 고정 날짜라서, 불러올 때 `hydrateMeals()` 가 **시:분은 그대로 두고 날짜만 오늘로** 옮긴다. 언제 실행해도 오늘의 기록처럼 동작한다.
- 타임라인에는 **현재 시각 기준으로 이미 먹은 식사만** 나온다. 그래서 캐릭터가 반영하는 "마지막 식사"와 타임라인의 마지막 카드가 항상 일치한다.
- 캐릭터·사진은 과제 범위상 이모지 + CSS로 표현했다.

## 범위 밖 (의도적으로 구현하지 않음)

실제 카메라·파일 업로드, 로그인, 라우팅, 백엔드 연동, 데이터 영속화(새로고침하면 JSON 원본으로 돌아간다).

---

WIRO는 의료 진단·치료 서비스가 아니며, 생활습관 관리를 돕는 참고용 정보를 제공합니다.
