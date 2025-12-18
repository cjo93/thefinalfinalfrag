import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchRevealProps {
    text: string;
    className?: string;
    isActive?: boolean; // Trigger
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?/";

export const GlitchReveal: React.FC<GlitchRevealProps> = ({ text, className, isActive = true }) => {
    const [displayText, setDisplayText] = useState(text);

    useEffect(() => {
        if (!isActive) return;

        let interval: NodeJS.Timeout;
        let iter = 0;

        const scramble = () => {
            interval = setInterval(() => {
                setDisplayText(() =>
                    text
                        .split("")
                        .map((char, index) => {
                            if (index < iter) {
                                return text[index];
                            }
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        })
                        .join("")
                );

                if (iter >= text.length) {
                    clearInterval(interval);
                }

                iter += 1 / 2; // Speed of decode
            }, 30);
        };

        scramble();

        return () => clearInterval(interval);
    }, [text, isActive]);

    return (
        <motion.span className={className}>
            {displayText}
        </motion.span>
    );
};
