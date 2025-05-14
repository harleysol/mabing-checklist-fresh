export function useDevResetLog(task, now) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] 초기화 체크: ${task.name} / ${task.resetFreq} @ ${new Date(now).toLocaleTimeString()}`);
  }
}