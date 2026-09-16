import { useEffect, useState } from 'react';

/**
 * 1초마다 현재 시각을 새로 알려주는 훅.
 * 경과 시간·카운트다운처럼 "시간이 흐르면 저절로 변하는" 값의 기준점이 된다.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timerId);
  }, [intervalMs]);

  return now;
}
