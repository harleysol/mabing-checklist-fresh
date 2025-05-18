import { Input } from '@/components/ui/input';

interface ResourceFieldsProps {
    silver: string;
    tribute: string;
    silverStart: string;
    tributeStart: string;
    onSilverChange: (v: string) => void;
    onTributeChange: (v: string) => void;
    onSilverStartChange: (v: string) => void;
    onTributeStartChange: (v: string) => void;
}

export function ResourceFields({
    silver, tribute, silverStart, tributeStart,
    onSilverChange, onTributeChange,
    onSilverStartChange, onTributeStartChange,
}: ResourceFieldsProps) {
    return (
        <>
            {/* 안내 문구 추가 */}
            <p className="text-sm text-center text-gray-500 mb-2">
                🛠 업데이트 후 열어드릴게요!
            </p>

            {/* 현재 은화 */}
            <label className="block text-black">
                현재 은화 (비활성화 중) :
                <Input
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="0"
                    value={silver}
                    disabled
                    onChange={e => onSilverChange(e.target.value.replace(/\D/g, ''))}
                    className="mt-1 w-20 bg-white text-black border border-gray-300"
                />
            </label>

            {/* 현재 공물 */}
            <label className="block text-black">
                현재 공물 (비활성화 중) :
                <Input
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="0"
                    value={tribute}
                    disabled
                    onChange={e => onTributeChange(e.target.value.replace(/\D/g, ''))}
                    className="mt-1 w-20 bg-white text-black border border-gray-300"
                />
            </label>

            {/* 은화 충전 분 */}
            <label className="block text-black">
                은화 충전 분 (비활성화 중) :
                <select
                    value={silverStart}
                    disabled
                    onChange={e => onSilverStartChange(e.target.value)}
                    className="ml-2 mt-1 w-20 bg-white text-black border border-gray-300 p-1 rounded"
                >
                    <option value="">--</option>
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
                        .map(min => (
                            <option key={min} value={min}>
                                {min}분
                            </option>
                        ))}
                </select>
            </label>

            {/* 공물 충전 시간 */}
            <label className="block text-black">
                공물 충전 시간 (비활성화 중) :
                <select
                    value={tributeStart}
                    disabled
                    onChange={e => onTributeStartChange(e.target.value)}
                    className="ml-2 mt-1 w-20 bg-white text-black border border-gray-300 p-1 rounded"
                >
                    <option value="">--</option>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
                        .map(hr => (
                            <option key={hr} value={hr}>
                                {hr}시
                            </option>
                        ))}
                </select>
            </label>
        </>
    );
}