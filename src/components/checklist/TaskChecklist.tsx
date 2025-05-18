'use client';
import * as LS_alias from '@/hooks/useLocalStorage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
// (기존 버튼 로그도 한 번 더)
import CharacterDialog from '@/components/character/CharacterDialog';
import CharacterFilter from '@/components/character/CharacterFilter';
import TaskDialog from '@/components/checklist/TaskDialog';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { useVisibleTasks } from '@/hooks/useVisibleTasks';
import type { GameCharacterData, TaskData } from '@/types';
import { devLog } from '@/utils/dev';
import { convertToBase64 } from '@/utils/image';
import { resetTasksBySchedule } from '@/utils/resetTasksBySchedule';
import { getResetTaskState } from '@/utils/tasks';
import { Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

import TaskTable from './TaskTable';
interface TaskFormErrors {
    type?: boolean;
    resetFreq?: boolean;
    inputMode?: boolean;
}

devLog('🧪 LS via alias:', LS_alias);
devLog('🧪 useLocalStorage via alias:', useLocalStorage);
devLog('🔥 Button is:', Button);
devLog('🔥 useLocalStorage:', useLocalStorage);
devLog('useLocalStorage:', useLocalStorage);
devLog('CharacterDialog:', CharacterDialog);
devLog('Checkbox:', Checkbox);
devLog('Button:', Button);
devLog('Dialog:', Dialog);
devLog('DialogContent:', DialogContent);
devLog('DialogFooter:', DialogFooter);
devLog('DialogHeader:', DialogHeader);
devLog('DialogTitle:', DialogTitle);
devLog('DialogTrigger:', DialogTrigger);
devLog('✨ 일간 초기화 실행됨!');
devLog('🔄 주간 초기화 실행됨!');

export default function TaskChecklist() {
    const [isClient, setIsClient] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [newTaskType, setNewTaskType] = useState('');
    const [newResetFreq, setNewResetFreq] = useState('');
    const [newInputMode, setNewInputMode] = useState('');
    const [taskFormErrors, setTaskFormErrors] = useState<TaskFormErrors>({});
    const [charFormErrors, setCharFormErrors] = useState({});
    const [taskSubmitted, setTaskSubmitted] = useState(false);
    const ExportImportButtons = dynamic(() =>
        import('./ExportImportButtons.tsx').then(mod => mod.default),
        { ssr: false }
    );

    const FeedbackDialog = dynamic(() =>
        import('./FeedbackDialog.tsx').then(mod => mod.default),
        { ssr: false }
    );
    const [isTaskOpen, setIsTaskOpen] = useState(false);
    const [isCharOpen, setIsCharOpen] = useState(false);
    const [editingChar, setEditingChar] = useState<GameCharacterData | null>(null);
    const [taskValues, setTaskValues] = useLocalStorage<Record<string, any>>(
        'task-values', // localStorage key
        {}
    );
    const isInitialEmpty = Object.keys(taskValues).length === 0;

    const clearChecklist = () => {
        if (confirm('⚠️ 정말로 체크리스트의 모든 내용을 완전히 삭제하시겠습니까? (캐릭터와 숙제 목록이 모두 사라집니다.)')) {
            devLog('🟢 clearChecklist 호출됨!');
            localStorage.removeItem('task-values');
            localStorage.removeItem('taskValues');
            localStorage.removeItem('customChecklist');
            localStorage.removeItem('characters');
            localStorage.removeItem('mabing-tasks');
            location.reload();
        } else {
            devLog('🔴 사용자가 취소 눌렀음');
        }
    };

    // 다이얼로그 컨트롤 상태
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskData | null>(null);

    const handleTaskDialogChange = (open: boolean) => {
        setIsTaskDialogOpen(open);
        if (!open) {
            setEditingTask(null);
        }
    };

    const handleCharDialogChange = (open: boolean) => {
        setIsCharOpen(open);
        if (!open) {
            setEditingChar(null); // ✅ 닫힐 때 초기화
        }
    };

    // 전역 상태
    const [characters, setCharacters] = useLocalStorage<GameCharacterData[]>('characters', []);
    const [tasks, setTasks] = useLocalStorage<TaskData[]>('mabing-tasks', []);
    const [selectedCharacter, setSelectedCharacter] = useState('all');
    const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

    // ── 이미지 확대용 상태 ──
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    const handleCharSubmit = async (char: GameCharacterData) => {
        // ⛔ 방어 코드 추가!
        if (!char.name.trim() || !char.job) {
            console.warn('❌ 유효하지 않은 캐릭터, 등록 취소:', char);
            return;
        }
        const previewUrl = char.imageFile
            ? await convertToBase64(char.imageFile) // ✅ base64 저장
            : '/default.png'; // ✅ 이미지 없으면 기본 이미지

        const finalChar = {
            ...char,
            previewUrl,
        };
        // 수정 모드인지 생성 모드인지 판단
        setCharacters(prev => {
            const exists = prev.find(c => c.id === char.id);
            if (exists) {
                return prev.map(c => (c.id === char.id ? finalChar : c));
            } else {
                return [...prev, finalChar];
            }
        });
    };

    const handleCharDelete = (id: number) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
        setEditingChar(null);
        setIsCharOpen(false);
        setEditingChar(null)
    };

    const handleSaveTask = (data: TaskData) => {
        if (data.id) {
            // 수정 모드: 기존 리스트에서 교체
            setTasks(prev =>
                prev.map(t => (t.id === data.id ? { ...t, ...data } : t))
            );
        } else {
            // 생성 모드: 새 ID 부여 후 추가
            const newId = Date.now();
            setTasks(prev => [...prev, { ...data, id: newId }]);
        }
        setIsTaskDialogOpen(false);
        setEditingTask(undefined);
    };

    const handleTaskSubmit = (task: TaskData) => {

        devLog('[handleTaskSubmit] 실행됨', task);

        const updatedTasks = [...tasks];
        const existingIndex = updatedTasks.findIndex(t => t.id === task.id);

        if (existingIndex !== -1) {
            updatedTasks[existingIndex] = task;
        } else {
            updatedTasks.push(task);
        }

        setTasks(updatedTasks);
    };

    const handleTaskDelete = (id: number) => {
        const updatedTasks = tasks.filter(t => t.id !== id);
        setTasks(updatedTasks);
        setEditingTask(null);
    };

    // ── 폼 초기화 함수 ──
    const resetTaskForm = () => {
        setNewTask('');
        setNewTaskType('');
        setNewResetFreq('');
        setNewInputMode('');
        setTaskFormErrors({});
    };

    // 예: 전체 숙제 초기화 버튼 눌렀을 때
    const handleResetAll = () => {
        const now = Date.now();
        const { updatedTasks, updatedValues } = getResetTaskState(
            tasks,
            characters,
            taskValues,
            now
        );
        setTasks(updatedTasks);
        setTaskValues(updatedValues);
    };

    // 숙제 생성 시 inputMode 자동 설정
    useEffect(() => {
        if (['일반던전', '사냥터'].includes(newTaskType)) {
            // 자동 모드(은화 드롭다운)로 넘어갈 땐 에러 해제
            setNewInputMode('silver-dropdown');
            setTaskFormErrors(prev => ({
                ...prev,
                inputMode: false
            }));
        } else {
            setNewInputMode('');
            setTaskFormErrors(prev => ({
                ...prev,
                inputMode: true
            }));
        }
    }, [newTaskType]);

    const visibleTasks = useVisibleTasks({
        tasks,
        characters,
        taskValues,
        selectedCharacter,
        showIncompleteOnly,
    });

    useEffect(() => {
        if (!isInitialEmpty) return;

        const now = Date.now();
        const { updatedTasks, updatedValues } = getResetTaskState(
            tasks,
            characters,
            taskValues,
            now
        );
        setTasks(updatedTasks);
        setTaskValues(updatedValues);
    }, []);

    const addTask = () => {
        // 1) 검증
        setTaskSubmitted(true);
        const errors: TaskFormErrors = {};

        if (!newTaskType) errors.type = true;
        if (!newResetFreq) errors.resetFreq = true;
        if (!newInputMode) errors.inputMode = true;

        if (Object.keys(errors).length > 0) {
            setTaskFormErrors(errors);
            return;
        }
        setTaskFormErrors({});
    };

    // 선택된 캐릭터만 필터링
    const filteredChars = selectedCharacter === 'all'
        ? characters
        : characters.filter(c => String(c.id) === selectedCharacter);

    // TaskTable에 넘기는 값 중 하나: 셀 값 변경 핸들러
    const handleValueChange = (
        charId: number,
        taskId: number,
        key: 'selectValue' | 'customValue',
        value: any
    ) => {
        const id = `${charId}-${taskId}`;
        setTaskValues(prev => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    };

    // ── 시간 기준 리셋 함수 ──
    const resetAllTasks = () => {
        const now = Date.now();
        const { updatedTasks, updatedValues } = getResetTaskState(
            tasks,
            characters,
            taskValues,
            now
        );
        setTasks(updatedTasks);
        setTaskValues(updatedValues);
    };

    useEffect(() => {
        resetTasksBySchedule(setTasks, setTaskValues, tasks);
    }, [setTasks, setTaskValues, tasks]);


    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        devLog('tasks 상태:', tasks);
        devLog('taskValues 상태:', taskValues);
    }, [tasks, taskValues]);

    useEffect(() => {
        console.log('tasks:', JSON.stringify(tasks, null, 2));
        console.log('taskValues:', JSON.stringify(taskValues, null, 2));
    }, []);

    if (!isClient) return null;

    return (
        <div className="p-6 bg-gray-800 text-white rounded-2xl shadow-xl overflow-auto relative"> {/* 👈 relative 추가 */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <ExportImportButtons />
                <div className="mt-2">
                    <FeedbackDialog />
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <img src="/mabing-icon.png" alt="마빙이" className="w-30 h-30 mt-5" />
                마빙이 체크리스트
            </h1>

            <div className="mb-4 flex gap-2 items-center">
                <Button onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    숙제 생성
                </Button>

                <Button onClick={() => setIsCharOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    캐릭터 생성
                </Button>

                <Button
                    onClick={clearChecklist}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                >
                    <Trash2 className="w-4 h-4" />
                    표 삭제
                </Button>
            </div>

            {characters.length > 0 && (
                <CharacterFilter
                    characters={characters}
                    selected={selectedCharacter}
                    onSelect={setSelectedCharacter}
                    showIncompleteOnly={showIncompleteOnly}
                    onToggle={setShowIncompleteOnly}
                />
            )}


            {/* 숙제 리스트 */}
            <TaskTable
                filteredChars={filteredChars}
                visibleTasks={visibleTasks}
                selectedCharacter={selectedCharacter}
                showIncompleteOnly={showIncompleteOnly}
                taskValues={taskValues}
                handleValueChange={handleValueChange}
                setEditingTask={setEditingTask}
                setIsTaskDialogOpen={setIsTaskDialogOpen}
                setEditingChar={setEditingChar}
                setIsCharOpen={setIsCharOpen}
                resetAllTasks={resetAllTasks}
                setPreviewImageUrl={setPreviewImageUrl}
                setIsImageDialogOpen={setIsImageDialogOpen}
            />

            <TaskDialog
                open={isTaskDialogOpen}
                onOpenChange={handleTaskDialogChange}
                editingTask={editingTask}
                onSubmit={handleTaskSubmit}
                onDelete={handleTaskDelete}
            />

            {/* 캐릭터 다이얼로그 */}
            <CharacterDialog
                open={isCharOpen}
                onOpenChange={handleCharDialogChange}
                editingChar={editingChar}
                onSubmit={handleCharSubmit}
                onDelete={handleCharDelete}
            />

            {isImageDialogOpen && (
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                    <DialogContent className="p-4">
                        <DialogTitle className="sr-only">이미지 확대</DialogTitle>
                        <img
                            src={previewImageUrl}
                            alt="캐릭터 확대"
                            className="max-w-full max-h-[80vh] rounded-lg mx-auto"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}