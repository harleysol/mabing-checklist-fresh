'use client';

import type { GameCharacterData } from '@/types';

interface CharacterFilterProps {
    characters: GameCharacterData[];
    selected: string;
    onSelect: (id: string) => void;
    showIncompleteOnly: boolean;
    onToggle: (checked: boolean) => void;
}

export default function CharacterFilter({
    characters,
    selected,
    onSelect,
    showIncompleteOnly,
    onToggle,
}: CharacterFilterProps) {

    {
        characters.map(character => (
            <div key={character.id} className="flex items-center gap-2">
                <img
                    src={character.previewUrl}
                    alt={character.name}
                    className="w-6 h-6 rounded-full border"
                />
                <span>{character.name}</span>
            </div>
        ))
    }

    if (characters.length === 0) return null;

    return (
        <div className="mb-4 flex items-center gap-4">
            <label className="font-medium">캐릭터 보기 :</label>
            <select
                className="bg-gray-700 text-white p-2 rounded"
                value={selected}
                onChange={e => onSelect(e.target.value)}
            >
                <option value="all">모든 캐릭터</option>
                {characters.map(c => (
                    <option key={c.id} value={String(c.id)}>
                        {c.name}
                    </option>
                ))}
            </select>
            <label className="flex items-center gap-1 text-white">
                <input
                    type="checkbox"
                    checked={showIncompleteOnly}
                    onChange={e => onToggle(e.target.checked)}
                />
                체크 안한 숙제만 보기
            </label>
        </div>
    );
}
