'use client';

import { Input } from '@/components/ui/input';
import clsx from 'clsx';
import { RefObject } from 'react';

interface CharacterFormFieldsProps {
    name: string;
    job: string;
    submitted: boolean;
    errors: { name?: boolean; job?: boolean };
    onNameChange: (val: string) => void;
    onJobChange: (val: string) => void;
    nameInputRef: RefObject<HTMLInputElement>;
}

export default function CharacterFormFields({
    name,
    job,
    submitted,
    errors,
    onNameChange,
    onJobChange,
    nameInputRef,
}: CharacterFormFieldsProps) {

    return (
        <>
            <div className="flex items-center gap-2 mt-2">
                <label className="text-sm font-medium whitespace-nowrap">
                    이름 (*필수) :
                </label>
                <Input
                    placeholder="이름"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    className={clsx(
                        'w-full p-2 rounded border',
                        submitted && errors.name ? 'border-red-500' : 'border-gray-300'
                    )}
                />
                {submitted && errors.name && (
                    <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
                        이름을 입력해주세요.
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 mt-2">
                <label className="text-sm font-medium whitespace-nowrap">
                    직업 (*필수) :
                </label>
                <select
                    value={job}
                    onChange={e => onJobChange(e.target.value)}
                    className={clsx(
                        'w-32 p-2 rounded border',
                        submitted && errors.job ? 'border-red-500' : 'border-gray-300'
                    )}
                >
                    <option value="">선택</option>
                    <option>대검전사</option>
                    <option>전사</option>
                    <option>검술사</option>
                    <option>궁수</option>
                    <option>장궁병</option>
                    <option>석궁사수</option>
                    <option>마법사</option>
                    <option>빙결술사</option>
                    <option>화염술사</option>
                    <option>힐러</option>
                    <option>사제</option>
                    <option>수도사</option>
                    <option>도적</option>
                    <option>격투가</option>
                    <option>듀얼블레이드</option>
                    <option>음유시인</option>
                    <option>악사</option>
                    <option>댄서</option>
                </select>
                {submitted && errors.job && (
                    <span className="text-red-500 text-sm ml-2 whitespace-nowrap">
                        직업을 선택해주세요.
                    </span>
                )}
            </div>
        </>
    );
}