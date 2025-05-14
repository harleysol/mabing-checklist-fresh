import { Button } from '@/components/ui/button';

type Props = {
    resetTasks: () => void;
};

export function DebugButtons({ resetTasks }: Props) {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
            <Button onClick={resetTasks}>🔁 강제 초기화</Button>
            <Button onClick={() => location.reload()}>🔄 새로고침</Button>
        </div>
    );
}