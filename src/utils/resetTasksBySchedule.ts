import { devLog } from '@/utils/dev';
import { resetTasks } from '@/utils/resetTaskForm';

const getToday6AM = (): number => {
    const d = new Date();
    if (d.getHours() < 6) d.setDate(d.getDate() - 1);
    d.setHours(6, 0, 0, 0);
    return d.getTime();
};

const getMonday6AM = (): number => {
    const d = new Date();
    const day = d.getDay();
    const diff = (day + 6) % 7;
    if (day === 0 || (day === 1 && d.getHours() < 6)) d.setDate(d.getDate() - 7); // 🔥 이거 추가!
    else d.setDate(d.getDate() - diff);
    d.setHours(6, 0, 0, 0);
    return d.getTime();
};

export const resetTasksBySchedule = (setTasks: Function, setTaskValues: Function, tasks: any) => {
    const now = Date.now();
    const lastReset = new Date(localStorage.getItem('lastReset') || 0).getTime();
    const lastWeeklyReset = new Date(localStorage.getItem('lastWeeklyReset') || 0).getTime();

    let didReset = false;

    const updatedTaskValues = (freq: string, prevTaskValues: any) => {
        const resetTaskIds = tasks.filter((t: any) => t.resetFreq === freq).map((t: any) => t.id.toString());
        const newTaskValues: any = {};

        Object.entries(prevTaskValues).forEach(([key, value]) => {
            const taskId = key.split('-')[1];
            if (resetTaskIds.includes(taskId)) {
                newTaskValues[key] = {}; // 명확히 초기화됨
            } else {
                newTaskValues[key] = value; // 유지
            }
        });

        return newTaskValues;
    };

    if (now >= getToday6AM() && lastReset < getToday6AM()) {
        setTasks((prev: any) => resetTasks(prev, 'daily'));
        setTaskValues((prev: any) => ({ ...updatedTaskValues('daily', prev) }));

        localStorage.setItem('lastReset', String(now));

        devLog('✨ 일간 초기화 완료!');
        didReset = true;
    }

    if (now >= getMonday6AM() && lastWeeklyReset < getMonday6AM()) {
        setTasks((prev: any) => resetTasks(prev, 'weekly'));
        setTaskValues((prev: any) => ({ ...updatedTaskValues('weekly', prev) }));

        localStorage.setItem('lastWeeklyReset', String(now));

        devLog('🔄 주간 초기화 완료!');
        didReset = true;
    }


    if (didReset) devLog('🚀 상태 업데이트 완료!');
};