export interface TaskData {
    id: number;
    name: string;
    type: string;
    resetFreq: '' | 'daily' | 'weekly';
    inputMode: '' | 'checkbox' | 'dropdown' | 'silver-dropdown';
    lastCompletedAt?: number;
}