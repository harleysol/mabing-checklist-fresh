'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { TaskData } from '@/types';
import { devLog } from '@/utils/dev';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskData) => void;
  onDelete?: (id: number) => void;
  editingTask?: TaskData;
}

export default function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  editingTask
}: TaskDialogProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [newId, setNewId] = useState<number | null>(null);
  const isEdit = !!editingTask;
  const [task, setTask] = useState<TaskData>({
    id: 0,
    name: '',
    type: '',
    resetFreq: 'daily',
    inputMode: 'checkbox',
  });

  useEffect(() => {
    if (editingTask) setTask(editingTask);
  }, [editingTask]);

  useEffect(() => {
    if (open && !editingTask && newId === null) {
      setNewId(Date.now());
      setTask({
        id: 0,
        name: '',
        type: '',
        resetFreq: '',
        inputMode: '',
      });
    }
  }, [open, editingTask]);

  useEffect(() => {
    if (!editingTask) {
      setNewId(Date.now()); // ✅ 새 ID 생성
      devLog('🧪 새 숙제 ID 생성됨:', Date.now());
    }
  }, [editingTask]);

  const [errors, setErrors] = useState({
    type: false,
    resetFreq: false,
    inputMode: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const isAutoInputMode = task.type === '일반던전' || task.type === '사냥터' || task.type === '심층던전';
  const showInputModeError =
    submitted && errors.inputMode && !isAutoInputMode;

  useEffect(() => {
    if (!open) {
      setTask({
        id: 0,
        name: '',
        type: '',
        resetFreq: '',
        inputMode: '',
      });
      setErrors({
        type: false,
        resetFreq: false,
        inputMode: false,
      });
      setSubmitted(false);
      setNewId(null); // ✅ 이 줄도 있으면 더 확실함
      devLog('🧼 숙제 생성창 상태 초기화됨!');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      devLog('[keydown] key:', e.key);
      if (e.key === 'Enter') {
        e.preventDefault();
        devLog('[ENTER PRESSED]');
        formRef.current?.requestSubmit(); // ✅ 실제로 form 제출 시도
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    try {
      devLog('📩 숙제 handleSave 시작');
      devLog('💡 [TaskDialog] task 상태 (초기):', task);

      const newErrors = {
        type: task.type === '',
        resetFreq: task.resetFreq === '',
        inputMode: task.inputMode === '',
      };

      const hasError = Object.values(newErrors).some(Boolean);
      setErrors(newErrors);
      setSubmitted(true);

      if (hasError || (!editingTask && newId === null)) {
        devLog('🛑 [TaskDialog] 유효성 검사 실패! 저장 안됨!', newErrors);
        return;
      }

      const nameToSave =
        task.name.trim() !== '' ? task.name : task.type || '이름 없음';

      const data: TaskData = {
        id: editingTask?.id ?? newId!,
        name: nameToSave,
        type: task.type,
        resetFreq: task.resetFreq,
        inputMode: task.inputMode,
      };

      devLog('[TaskDialog] onSubmit 실행됨:', data);
      onSubmit(data);
      setTimeout(() => onOpenChange(false), 0);
    } catch (error) {
      devLog('🔥 숙제 생성 중 예외 발생:', error);
    }
  };

  const INPUT_MODES = {
    CHECKBOX: 'checkbox',
    DROPDOWN: 'dropdown',
    SILVER: 'silver-dropdown',
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>숙제 생성하기</DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            마빙이와 함께 체크리스트를 관리할 숙제를 설정하세요!
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSave}>
          <div className="space-y-4 text-sm">
            {/* 숙제 이름 */}
            <label className="block font-semibold">숙제 이름 (선택):</label>
            <Input
              ref={nameInputRef}
              value={task.name}
              onChange={e => setTask(prev => ({ ...prev, name: e.target.value }))}
              placeholder="숙제 이름"
            />

            {/* 숙제 타입 */}
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-semibold whitespace-nowrap">
                숙제 타입 (*필수):
              </label>
              <select
                className={`border rounded p-1 text-sm ${errors.type ? 'border-red-500' : ''
                  }`}
                value={task.type}
                onChange={e => {
                  const value = e.target.value as '' | '일반던전' | '사냥터' | '심층던전' | '기타';
                  setTask(prev => {
                    let updated: TaskData = { ...prev, type: value };

                    if (value === '일반던전' || value === '사냥터' || value === '심층던전') {
                      updated.inputMode = 'dropdown'; // 자동 설정
                    }

                    return updated;
                  });

                  if (errors.type && value !== '') {
                    setErrors(prev => ({ ...prev, type: false }));
                  }
                }}
              >
                <option value="">선택</option>
                <option value="일반던전">일반던전</option>
                <option value="사냥터">사냥터</option>
                <option value="심층던전">심층던전</option>
                <option value="기타">기타</option>
              </select>
              {errors.type && (
                <span className="text-xs text-red-500 ml-1 whitespace-nowrap max-w-[160px] truncate">
                  숙제 타입을 선택해주세요.
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              일반던전은 은화 떨어지고, 심층은 공물 잘감돼요… 그 외는 기타로 해주세요!! 부탁해요오!!
            </p>

            {/* 주기 */}
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm font-semibold whitespace-nowrap">
                초기화 주기 (*필수):
              </label>
              <select
                className={`border rounded p-1 text-sm ${errors.resetFreq ? 'border-red-500' : ''}`}
                value={task.resetFreq}
                onChange={e => {
                  const value = e.target.value as '' | 'daily' | 'weekly';
                  setTask(prev => ({ ...prev, resetFreq: value }));

                  if (errors.resetFreq && value !== '') {
                    setErrors(prev => ({ ...prev, resetFreq: false }));
                  }
                }}
              >
                <option value="">선택</option>
                <option value="daily">일간</option>
                <option value="weekly">주간</option>
              </select>
              {errors.resetFreq && (
                <span className="text-xs text-red-500 ml-1 whitespace-nowrap">
                  초기화 주기를 선택해주세요.
                </span>
              )}
            </div>

            {/* 입력 방식 */}
            <div className="mt-4">
              <label className="block font-semibold">입력 방식 (*필수):</label>

              <div className="flex items-center mt-1 gap-2">
                {/* 왼쪽: 라디오 버튼 묶음 */}
                <div
                  className={`flex p-2 border rounded w-full items-center gap-4 ${showInputModeError ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <label className="flex items-center gap-2 leading-tight text-sm">
                    <input
                      type="radio"
                      name="inputMode"
                      value="checkbox"
                      disabled={task.type === '일반던전' || task.type === '사냥터' || task.type === '심층던전'}
                      checked={task.inputMode === 'checkbox'}
                      onChange={() => {
                        setTask(prev => ({ ...prev, inputMode: 'checkbox' }));
                        if (errors.inputMode) {
                          setErrors(prev => ({ ...prev, inputMode: false }));
                        }
                      }}
                    />
                    체크박스
                  </label>

                  <label className="flex items-center gap-2 leading-tight text-sm">
                    <input
                      type="radio"
                      name="inputMode"
                      value="dropdown"
                      disabled={task.type === '일반던전' || task.type === '사냥터' || task.type === '심층던전'}
                      checked={task.inputMode === 'dropdown'}
                      onChange={() => {
                        setTask(prev => ({ ...prev, inputMode: 'dropdown' }));
                        if (errors.inputMode) {
                          setErrors(prev => ({ ...prev, inputMode: false }));
                        }
                      }}
                    />
                    드롭박스
                  </label>
                </div>

                {/* 오른쪽: 에러 메시지 */}
                {submitted && errors.inputMode && !isAutoInputMode && (
                  <span className="text-red-500 text-sm whitespace-nowrap ml-2">
                    입력 방식을 선택해주세요.
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 px-0 pt-2">
            <div className="w-full flex justify-between items-center">
              {editingTask && onDelete ? (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
                    if (confirmDelete) {
                      onDelete(editingTask.id);
                      onOpenChange(false);
                    }
                  }}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              ) : (
                <div /> // 빈 div로 공간 확보
              )}

              <Button
                type="submit"
                disabled={
                  submitted &&
                  (
                    errors.type ||
                    errors.resetFreq ||
                    (!isAutoInputMode && errors.inputMode)
                  )
                }
                className={clsx(
                  'p-2 rounded text-white transition-colors',
                  submitted &&
                    (errors.type || errors.resetFreq || (!isAutoInputMode && errors.inputMode))
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-black hover:bg-zinc-800'
                )}
              >
                생성
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}