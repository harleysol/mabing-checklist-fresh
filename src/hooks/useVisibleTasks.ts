import type { GameCharacterData, TaskData } from '@/types';

interface TaskValueMap {
    [key: string]: {
        selectValue?: string;
        customValue?: string;
    };
}

interface UseVisibleTasksParams {
    tasks: TaskData[];
    characters: GameCharacterData[];
    taskValues: TaskValueMap;
    selectedCharacter: string;
    showIncompleteOnly: boolean;
}

export function useVisibleTasks({
    tasks,
    characters,
    taskValues,
    selectedCharacter,
    showIncompleteOnly,
}: UseVisibleTasksParams): TaskData[] {
    const filteredChars =
        selectedCharacter === 'all'
            ? characters
            : characters.filter(c => String(c.id) === selectedCharacter);

    return tasks.filter(t => {
        if (!showIncompleteOnly) return true;

        return filteredChars.some(c => {
            const val = taskValues[`${c.id}-${t.id}`] || {};
            if (t.inputMode === 'checkbox') return !val.selectValue;
            return (
                val.selectValue === '' ||
                val.selectValue === undefined ||
                (val.selectValue === 'custom' && !val.customValue)
            );
        });
    });
}