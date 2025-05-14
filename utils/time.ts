export function getToday6AM(): number {
  const d = new Date();
  d.setHours(6, 0, 0, 0);
  return d.getTime();
}

export function getMonday6AM(): number {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7; // 월요일 기준으로 정렬
  d.setDate(d.getDate() - diff);
  d.setHours(6, 0, 0, 0);
  return d.getTime();
}

export function shouldResetTask(
  task: { resetFreq: string; lastReset?: number },
  now: number
): boolean {
  const last = task.lastReset ?? 0;
  return (
    (task.resetFreq === '일간' && now >= getToday6AM() && last < getToday6AM()) ||
    (task.resetFreq === '주간' && now >= getMonday6AM() && last < getMonday6AM())
  );
}