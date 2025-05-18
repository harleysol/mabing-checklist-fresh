import type { GameCharacterData, TaskData } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import CharacterHeaderCell from '../character/CharacterHeaderCell';
import TaskRow from './TaskRow';

interface TaskTableProps {
    filteredChars: GameCharacterData[];
    visibleTasks: TaskData[];
    selectedCharacter: string;
    showIncompleteOnly: boolean;
    taskValues: Record<string, { selectValue?: any; customValue?: string }>;
    handleValueChange: (
        charId: number,
        taskId: number,
        field: 'selectValue' | 'customValue',
        value: any
    ) => void;
    setEditingTask: Dispatch<SetStateAction<TaskData>>;
    setIsTaskDialogOpen: (open: boolean) => void;
    setEditingChar: (char: GameCharacterData) => void;
    setIsCharOpen: (open: boolean) => void;
    resetAllTasks: () => void;
    setPreviewImageUrl: (url: string) => void;
    setIsImageDialogOpen: (open: boolean) => void;
}

interface TaskTableProps {
    filteredChars: GameCharacterData[];
    visibleTasks: TaskData[];
}

export default function TaskTable({
    filteredChars,
    visibleTasks,
    selectedCharacter,
    showIncompleteOnly,
    taskValues,
    handleValueChange,
    setEditingTask,
    setIsTaskDialogOpen,
    setEditingChar,
    setIsCharOpen,
    resetAllTasks,
    setPreviewImageUrl,
    setIsImageDialogOpen,
}: TaskTableProps) {

    return (
        <>
            <table className="table-auto w-full border-collapse border border-gray-700">
                <thead>
                    <tr>
                        <th className="p-2 border border-gray-700 text-center">숙제</th>
                        {filteredChars.map(c => (
                            <CharacterHeaderCell
                                key={c.id}
                                character={c}
                                onClickImage={url => {
                                    setPreviewImageUrl(url);
                                    setIsImageDialogOpen(true);
                                }}
                                onEdit={c => {
                                    setEditingChar(c);
                                    setIsCharOpen(true);
                                }}
                            />
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {visibleTasks.map(t => (
                        <TaskRow
                            key={t.id}
                            task={t}
                            characters={filteredChars}
                            taskValues={taskValues}
                            selectedCharacter={selectedCharacter}
                            showIncompleteOnly={showIncompleteOnly}
                            onEdit={task => {
                                setEditingTask(task);
                                setIsTaskDialogOpen(true);
                            }}
                            onChangeValue={handleValueChange}
                        />
                    ))}
                </tbody>
            </table>
        </>
    );
}