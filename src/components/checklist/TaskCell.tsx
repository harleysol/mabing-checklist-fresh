import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { TaskData } from '@/types';
import { devLog } from '@/utils/dev';

interface TaskCellProps {
    characterId: number;
    task: TaskData;
    value: { selectValue?: any; customValue?: string };
    onChange: (
        charId: number,
        taskId: number,
        field: 'selectValue' | 'customValue',
        value: any
    ) => void;
}

export default function TaskCell({ characterId, task, value, onChange }: TaskCellProps) {
    devLog(`task.name: ${task.name}, inputMode: ${task.inputMode}, type: ${task.type}`);

    const isCompleted =
        task.inputMode === 'checkbox'
            ? !!value.selectValue
            : value.selectValue && value.selectValue !== '';


    if (task.inputMode === 'checkbox') {
        return (
            <Checkbox
                className="accent-black"
                checked={!!value.selectValue}
                onCheckedChange={val => onChange(characterId, task.id, 'selectValue', val)}
            />
        );
    }

    const dropdownOptions =
        task.inputMode === 'silver-dropdown'
            ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
            : task.type === '심층던전'
                ? Array.from({ length: 10 }, (_, i) => i + 1) // 1 ~ 10
                : task.type === '일반던전' || task.type === '사냥터'
                    ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
                    : Array.from({ length: 10 }, (_, i) => i + 1); // 기본값

    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
                <select
                    value={value.selectValue || ''}
                    onChange={(e) =>
                        onChange(characterId, task.id, 'selectValue', e.target.value)
                    }
                    className="bg-white text-black p-1 rounded border text-sm"
                >
                    <option value="">선택</option>
                    {dropdownOptions.map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                    <option value="custom">직접입력</option>
                </select>

                {value.selectValue === 'custom' && (
                    <Input
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder={
                            task.inputMode === 'silver-dropdown' ||
                                task.type === '일반던전' ||
                                task.type === '사냥터'
                                ? '은화 입력'
                                : task.type === '심층던전'
                                    ? '공물 입력'
                                    : '숫자 입력'
                        }
                        value={value.customValue || ''}
                        maxLength={3}
                        onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 3);
                            onChange(characterId, task.id, 'customValue', digitsOnly);
                        }}
                        className="w-16 bg-white text-black p-1 rounded border text-sm"
                    />
                )}
            </div>
        </div>
    );
}
