
import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
    text: string;
    speed?: number;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            return;
        }

        let i = 0;
        setDisplayedText(''); // Start empty

        const intervalId = setInterval(() => {
            i++;
            // Slice is safe and deterministic
            setDisplayedText(text.slice(0, i));

            if (i >= text.length) {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return <span>{displayedText}</span>;
};
