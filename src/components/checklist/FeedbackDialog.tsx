'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

export default function FeedbackDialog() {
    const [isFeedbackOpen, setFeedbackOpen] = useState(false);

    const submitFeedback = () => {
        const formLink = 'https://forms.gle/jEktNmjF78snsnCA9';
        window.open(formLink, '_blank');
        setFeedbackOpen(false);
    };

    return (
        <>
            <Button onClick={() => setFeedbackOpen(true)}>🐞 버그/건의사항</Button>

            <Dialog open={isFeedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogContent className="p-4">
                    <DialogHeader>
                        <DialogTitle>🐞 버그 / 건의사항 보내기</DialogTitle>
                    </DialogHeader>
                    <div className="text-center my-4">
                        구글폼에서 간단하게 의견을 남겨주세요! 😊
                    </div>
                    <DialogFooter className="p-4">
                        <Button onClick={submitFeedback}>📨 바로가기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}