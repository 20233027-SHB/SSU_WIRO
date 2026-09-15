import { useEffect, useState } from 'react';
import type { HomeData, Meal } from '../types';
import { hydrateMeals, toLocalIso } from '../utils';

/**
 * DB(= public/data/home.json) → 화면 state 로 들어오는 단 하나의 입구.
 *
 *   public/data/home.json  ──fetch──▶  useState<HomeData | null>  ──▶  <HomePage />
 *
 * 컴포넌트는 이 훅이 돌려준 data 만 본다. 다른 경로로 데이터가 들어오는 곳은 없다.
 */

/** BASE_URL 을 붙여야 배포 경로가 바뀌어도 그대로 동작한다. */
const DATA_URL = `${import.meta.env.BASE_URL}data/home.json`;

export interface UseHomeDataResult {
  data: HomeData | null;
  loading: boolean;
  error: string | null;
  /** 사진 촬영 시뮬레이션: state 의 meals 에 한 끼 추가 → 화면 전체가 다시 그려진다 */
  addMeal: () => void;
}

export function useHomeData(): UseHomeDataResult {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1) 마운트 시 JSON 을 한 번 불러와 state 에 담는다.
  useEffect(() => {
    let alive = true;

    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`데이터를 불러오지 못했어요 (HTTP ${res.status})`);
        return res.json() as Promise<HomeData>;
      })
      .then((json) => {
        if (!alive) return;
        // eatenAt 의 날짜만 오늘로 맞춰 둔다. (나머지 값은 JSON 그대로)
        setData({ ...json, meals: hydrateMeals(json.meals, new Date()) });
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      alive = false;
    };
  }, []);

  // 2) 데이터가 바뀌는 유일한 지점. state 만 갱신하면 화면은 알아서 따라온다.
  const addMeal = () => {
    setData((prev) => {
      if (!prev) return prev;

      // AI가 사진을 인식했다고 가정하고, JSON 에 준비된 후보를 순서대로 쓴다.
      const sample = prev.aiScanSamples[prev.meals.length % prev.aiScanSamples.length];
      const nextId = prev.meals.reduce((max, meal) => Math.max(max, meal.id), 0) + 1;

      const newMeal: Meal = {
        id: nextId,
        name: sample.name,
        photo: sample.photo,
        eatenAt: toLocalIso(new Date()), // 방금 먹은 것으로 기록
        riskLevel: sample.riskLevel,
        tags: sample.tags,
      };

      return { ...prev, meals: [...prev.meals, newMeal] };
    });
  };

  return { data, loading: data === null && error === null, error, addMeal };
}
