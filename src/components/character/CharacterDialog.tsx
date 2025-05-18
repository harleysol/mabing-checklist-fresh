'use client';

import CharacterFormFields from '@/components/character/CharacterFormFields';
import { CharImageUploader } from '@/components/character/CharacterImageUploader';
import { ResourceFields } from '@/components/checklist/ResourceFields';
import { Button } from '@/components/ui/button';
import type { GameCharacterData } from '@/types';
import { devLog } from '@/utils/dev';
import { convertToBase64 } from '@/utils/image';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../ui/dialog';

interface CharacterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (id: number) => void;
    editingChar: GameCharacterData;
    onSubmit: (data: GameCharacterData) => void;
}

export default function CharacterDialog({
    open,
    onOpenChange,
    onSubmit,
    onDelete,
    editingChar
}: CharacterDialogProps) {

    const isEdit = !!editingChar;
    const [name, setName] = useState('');
    const [job, setJob] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [silver, setSilver] = useState('');
    const [tribute, setTribute] = useState('');
    const [silverStart, setSilverStart] = useState('');
    const [tributeStart, setTributeStart] = useState('');
    const [errors, setErrors] = useState<{ name?: boolean; job?: boolean }>({});
    const [submitted, setSubmitted] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const image = newImageFile?.name ?? 'default.png';
    const [newId, setNewId] = useState<number | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [isCharOpen, setIsCharOpen] = useState(false);

    // 1) 편집 모드로 열릴 때만 기존 값 채워 주기
    useEffect(() => {
        if (open && editingChar) {
            setName(editingChar.name);
            setJob(editingChar.job);
            setPreview(editingChar.previewUrl);
            setSilver(String(editingChar.silver));
            setTribute(String(editingChar.tribute));
            setSilverStart(editingChar.silverStartPick);
            setTributeStart(editingChar.tributeStartPick);
        }
    }, [open, editingChar]);

    // 2) 다이얼로그가 닫힐 때 (open === false) 전체 폼 초기화
    useEffect(() => {
        if (!open) {
            setName('');
            setJob('');
            setFile(null);
            setPreview('');
            setSilver('');
            setTribute('');
            setSilverStart('');
            setTributeStart('');
            setErrors({});
            setSubmitted(false);
        }
    }, [open]);

    useEffect(() => {
        if (!editingChar) {
            setNewId(Date.now());
        }
    }, [editingChar]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            devLog('[keydown] key:', e.key);
            if (e.key === 'Enter') {
                e.preventDefault();
                devLog('[ENTER PRESSED]');
                formRef.current?.requestSubmit(); // ✅ 진짜 submit 발생!
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;

        // 파일이 없으면 preview와 file 상태 모두 초기화하고 종료
        if (!f) {
            setFile(null);
            setPreview('');
            return;
        }

        // 파일이 있으면 상태 세팅
        setFile(f);
        setPreview(await convertToBase64(f));
    };

    // 이름/직업 입력 처리
    const handleNameChange = (val: string) => {
        setName(val);
        if (submitted) setErrors(prev => ({ ...prev, name: val.trim() === '' }));
    };
    const handleJobChange = (val: string) => {
        setJob(val);
        if (submitted) setErrors(prev => ({ ...prev, job: val === '' }));
    };

    // 폼 제출 처리
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const validationErrors = {
            name: name.trim() === '',
            job: job === '',
        };

        const hasError = Object.values(validationErrors).some(Boolean);
        setErrors(validationErrors);
        setSubmitted(true);
        if (hasError) {
            devLog('⛔ 유효성 검사 실패:', validationErrors);
            return;
        }

        const newCharacter: GameCharacterData = {
            id: editingChar?.id ?? Date.now() + Math.floor(Math.random() * 1000),
            name: name.trim(),
            job,
            imageFile: file,
            previewUrl: preview || '/default.png',
            silver: Number(silver) || 0,
            tribute: Number(tribute) || 0,
            silverStartPick: silverStart,
            tributeStartPick: tributeStart,
        };

        onSubmit(newCharacter);
        setTimeout(() => onOpenChange(false), 0);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="p-4">
                    <DialogHeader>
                        <DialogTitle>캐릭터 생성하기</DialogTitle>
                        <DialogDescription className="text-gray-500 text-sm">
                            마빙이와 함께 체크리스트를 관리할 캐릭터를 설정하세요!
                        </DialogDescription>
                    </DialogHeader>

                    {/* Enter나 버튼 클릭 모두 이 form 으로 처리됩니다 */}
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

                        <CharacterFormFields
                            name={name}
                            job={job}
                            submitted={submitted}
                            errors={errors}
                            onNameChange={handleNameChange}
                            nameInputRef={nameInputRef}
                            onJobChange={handleJobChange}
                        />

                        <CharImageUploader
                            previewUrl={preview}
                            fileName={file?.name}
                            onFileChange={handleImageUpload}
                        />
                        <ResourceFields
                            silver={silver}
                            tribute={tribute}
                            silverStart={silverStart}
                            tributeStart={tributeStart}
                            onSilverChange={setSilver}
                            onTributeChange={setTribute}
                            onSilverStartChange={setSilverStart}
                            onTributeStartChange={setTributeStart}
                        />

                        <DialogFooter className="mt-4 px-0 pt-2">
                            <div className="w-full flex justify-between items-center">
                                {/* 왼쪽: 삭제 */}
                                {isEdit && onDelete ? (
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
                                            if (confirmDelete) {
                                                onDelete(editingChar.id);
                                                onOpenChange(false);
                                            }
                                        }}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <div /> // ✅ 이 빈 div를 추가해야 버튼이 우측으로 정렬됩니다!
                                )}

                                {/* 오른쪽: 생성/수정 */}
                                <Button
                                    type="submit"
                                    disabled={submitted && Object.values(errors).some(v => v)}
                                    className={clsx(
                                        'p-2 rounded text-white transition-colors',
                                        submitted && Object.values(errors).some(v => v)
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-black hover:bg-zinc-800'
                                    )}
                                >
                                    {isEdit ? '수정 완료' : '생성'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog >
        </>
    );
}