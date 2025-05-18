'use client';

import type { GameCharacterData, TaskData } from '@/types';
import { devLog } from '@/utils/dev';
import TaskCell from './TaskCell';

interface Props {
    task: TaskData;
    characters: GameCharacterData[];
    taskValues: Record<string, { selectValue?: any; customValue?: string }>;
    selectedCharacter: string;
    showIncompleteOnly: boolean;
    onEdit: (task: TaskData) => void;
    onChangeValue: (
        charId: number,
        taskId: number,
        field: 'selectValue' | 'customValue',
        value: any
    ) => void;
}

export default function TaskRow({
    task,
    characters,
    taskValues,
    selectedCharacter,
    showIncompleteOnly,
    onEdit,
    onChangeValue,
}: Props) {

    devLog('[TaskRow] task:', task);

    if (!task || task.id === 0) return null;

    return (
        <tr>
            <td
                className="p-2 border border-gray-700 font-semibold text-center cursor-pointer hover:underline"
                onClick={() => onEdit(task)}
            >
                <div>{task.name}</div>
                <div className="text-xs text-gray-400 mt-1">· {task.resetFreq === 'daily' ? '일간' : '주간'}</div>
            </td>

            {characters.length > 0 ? (
                characters.map(c => {
                    const key = `${c.id}-${task.id}`;
                    const v = taskValues[key] || {};
                    const isCompleted =
                        task.inputMode === 'checkbox'
                            ? !!v.selectValue
                            : v.selectValue && v.selectValue !== '';

                    if (showIncompleteOnly && selectedCharacter === 'all' && isCompleted) {
                        return (
                            <td key={key} className="p-2 border border-gray-700 bg-gray-800"></td>
                        );
                    }

                    return (
                        <td key={key} className="p-2 border border-gray-700 text-center">
                            <TaskCell
                                characterId={c.id}
                                task={task}
                                value={v}
                                onChange={onChangeValue}
                            />
                        </td>
                    );
                })
            ) : (
                <>
                    <td
                        className="p-2 border border-gray-700 text-center text-gray-500 italic"
                        colSpan={2} // 캐릭터 셀 + 수정 셀 차지
                    >
                        (캐릭터 없음)
                    </td>
                </>
            )}
        </tr>
    );
}