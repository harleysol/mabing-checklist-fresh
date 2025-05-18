'use client';

import type { GameCharacterData } from '@/types';

interface Props {
    character: GameCharacterData;
    onClickImage: (url: string) => void;
    onEdit: (char: GameCharacterData) => void;
}

export default function CharacterHeaderCell({
    character,
    onClickImage,
    onEdit,
}: Props) {
    return (
        <th className="p-2 border border-gray-700 text-center">
            <div className="flex flex-col items-center">
                <img
                    src={character.previewUrl || '/default.png'}
                    alt={character.name}
                    className="w-8 h-8 rounded-full object-cover mb-1 cursor-zoom-in"
                    onClick={e => {
                        e.stopPropagation();
                        onClickImage(character.previewUrl || '/default.png');
                    }}
                />
                <div
                    className="text-sm cursor-pointer hover:underline text-center"
                    onClick={() => onEdit(character)}
                >
                    {character.name}
                    <br />
                    <span className="text-xs text-gray-300">({character.job})</span>
                </div>
            </div>
        </th>
    );
}