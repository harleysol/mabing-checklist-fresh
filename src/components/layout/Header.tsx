import { greetings } from '@/data/greetings';
import { useEffect, useState } from 'react';

export default function Header() {
    const [msg, setMsg] = useState<string>('');

    useEffect(() => {
        const pick = greetings[Math.floor(Math.random() * greetings.length)];
        setMsg(pick);
    }, []);

    return (
        <header className="flex items-center space-x-4 p-4 bg-gray-800 text-white relative">
            <div className="relative">
                <img src="/slime.png" alt="마빙이" className="w-16 h-16" />
                {msg && (
                    <div className="absolute -top-2 -left-20 w-48 p-2 bg-white text-black rounded-lg shadow-lg">
                        {msg}
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0
                            border-t-4 border-t-transparent
                            border-b-4 border-b-transparent
                            border-r-4 border-r-white" />
                    </div>
                )}
            </div>
            <h1 className="text-2xl font-bold">마빙이 체크리스트</h1>
        </header>
    );
}