"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffectSmooth = ({
    words,
    className,
    cursorClassName,
}: {
    words: {
        text: string;
        className?: string;
        newLine?: boolean;
    }[];
    className?: string;
    cursorClassName?: string;
}) => {
    const [displayedChars, setDisplayedChars] = useState(0);

    // Calculate total characters (including spaces between words)
    const fullText = words.map(w => w.text).join(' ');
    const totalChars = fullText.length;

    useEffect(() => {
        if (displayedChars < totalChars) {
            const timeout = setTimeout(() => {
                setDisplayedChars(prev => prev + 1);
            }, 50); // 50ms per character
            return () => clearTimeout(timeout);
        }
    }, [displayedChars, totalChars]);

    // Build the displayed content with cursor
    let charCount = 0;

    return (
        <div className={cn("text-center", className)}>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {words.map((word, wordIdx) => {
                    const wordStart = charCount;
                    const wordEnd = charCount + word.text.length;
                    charCount = wordEnd + 1; // +1 for space

                    // Check if cursor should be in this word
                    const cursorInWord = displayedChars >= wordStart && displayedChars <= wordEnd;
                    const cursorPosition = displayedChars - wordStart;

                    return (
                        <span key={wordIdx}>
                            {word.newLine && <br />}
                            <span className={cn("text-white", word.className)}>
                                {word.text.split('').map((char, charIdx) => {
                                    const globalCharIdx = wordStart + charIdx;
                                    const isVisible = globalCharIdx < displayedChars;
                                    const showCursorHere = cursorInWord && charIdx === cursorPosition;

                                    return (
                                        <span key={charIdx}>
                                            {showCursorHere && displayedChars < totalChars && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                    }}
                                                    className={cn(
                                                        "inline-block w-[3px] h-[1em] bg-lime-400 align-middle rounded-sm",
                                                        cursorClassName
                                                    )}
                                                />
                                            )}
                                            <span
                                                className={cn(
                                                    "transition-opacity duration-75",
                                                    isVisible ? "opacity-100" : "opacity-0"
                                                )}
                                            >
                                                {char}
                                            </span>
                                        </span>
                                    );
                                })}
                                {/* Cursor at end of word if cursor is right after this word */}
                                {cursorInWord && cursorPosition === word.text.length && displayedChars < totalChars && (
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className={cn(
                                            "inline-block w-[3px] h-[1em] bg-lime-400 align-middle rounded-sm",
                                            cursorClassName
                                        )}
                                    />
                                )}
                            </span>
                            {wordIdx < words.length - 1 && !words[wordIdx + 1]?.newLine && ' '}
                        </span>
                    );
                })}
            </h1>
        </div>
    );
};

export default TypewriterEffectSmooth;
