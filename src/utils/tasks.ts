import type { GameCharacterData, TaskData } from '@/types';

type TaskValueMap = Record<string, { selectValue?: any; customValue?: string }>;


export function getResetTaskState(
    tasks: TaskData[],
    characters: GameCharacterData[],
    taskValues: TaskValueMap,
    now: number
): {
    updatedTasks: TaskData[];
    updatedValues: TaskValueMap;
} {
    const updatedTasks = tasks.map(task => ({
        ...task,
        completed: false,
        lastCompletedAt: undefined, // 또는 now
    }));

    const updatedValues: TaskValueMap = {};

    for (const char of characters) {
        for (const task of tasks) {
            const key = `${char.id}-${task.id}`;
            updatedValues[key] = {}; // 초기화
        }
    }

    return {
        updatedTasks,
        updatedValues,
    };
}

/*** 숙제를 초기화할지 여부 판단 */
export function shouldResetTask(task: TaskData): boolean {
    if (!task.lastCompletedAt) return true; // 처음이라면 무조건 초기화

    const last = new Date(task.lastCompletedAt);
    const now = new Date();

    if (task.resetFreq === 'daily') {
        return (
            now.getFullYear() !== last.getFullYear() ||
            now.getMonth() !== last.getMonth() ||
            now.getDate() !== last.getDate()
        );
    }

    if (task.resetFreq === 'weekly') {
        // 일요일 기준으로 주차 계산 (ISO Week는 사용 안 함)
        const getWeekStart = (date: Date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - d.getDay()); // 일요일로 맞추기
            return d;
        };

        const lastWeek = getWeekStart(last).getTime();
        const thisWeek = getWeekStart(now).getTime();

        return lastWeek !== thisWeek;
    }

    return false;
}