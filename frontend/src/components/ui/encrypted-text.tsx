import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface EncryptedTextProps {
    text: string
    encryptedClassName?: string
    revealedClassName?: string
    revealDelayMs?: number
    className?: string
    highlightText?: string
    highlightClassName?: string
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

function getRandomChar() {
    return characters[Math.floor(Math.random() * characters.length)]
}

export function EncryptedText({
    text,
    encryptedClassName = 'text-neutral-500',
    revealedClassName = 'text-white',
    revealDelayMs = 100,
    className,
    highlightText,
    highlightClassName,
}: EncryptedTextProps) {
    const [displayText, setDisplayText] = useState<string>('')
    const [revealedCount, setRevealedCount] = useState(0)
    const animationRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const scrambleTimeRef = useRef<number>(0)
    const isCompleteRef = useRef(false)

    // Find the start index of highlight text if provided
    const highlightStartIndex = highlightText ? text.indexOf(highlightText) : -1
    const highlightEndIndex = highlightStartIndex >= 0 ? highlightStartIndex + highlightText!.length : -1

    useEffect(() => {
        // Initialize with scrambled text (preserve spaces)
        const initialText = text
            .split('')
            .map((char) => (char === ' ' ? ' ' : getRandomChar()))
            .join('')
        setDisplayText(initialText)
        setRevealedCount(0)
        isCompleteRef.current = false
        startTimeRef.current = performance.now()
        scrambleTimeRef.current = performance.now()

        const animate = (timestamp: number) => {
            if (isCompleteRef.current) return

            const elapsed = timestamp - startTimeRef.current
            const newRevealedCount = Math.floor(elapsed / revealDelayMs)

            // Update revealed count
            if (newRevealedCount !== revealedCount) {
                setRevealedCount(Math.min(newRevealedCount, text.length))
            }

            // Scramble unrevealed characters every 60ms
            if (timestamp - scrambleTimeRef.current > 60) {
                scrambleTimeRef.current = timestamp
                setDisplayText((prev) => {
                    return prev
                        .split('')
                        .map((_, i) => {
                            if (i < newRevealedCount || text[i] === ' ') {
                                return text[i]
                            }
                            return getRandomChar()
                        })
                        .join('')
                })
            }

            // Continue animation until all revealed
            if (newRevealedCount < text.length) {
                animationRef.current = requestAnimationFrame(animate)
            } else {
                // Final state
                isCompleteRef.current = true
                setDisplayText(text)
                setRevealedCount(text.length)
            }
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [text, revealDelayMs])

    // Render with word wrapping for "With Confidence" on new line
    const renderText = () => {
        const words = displayText.split(' ')
        const originalWords = text.split(' ')
        let charIndex = 0

        return words.map((word, wordIdx) => {
            const wordStart = charIndex
            const elements = word.split('').map((char, i) => {
                const globalIndex = wordStart + i
                const isRevealed = globalIndex < revealedCount
                const isHighlight = highlightStartIndex >= 0 &&
                    globalIndex >= highlightStartIndex &&
                    globalIndex < highlightEndIndex

                return (
                    <span
                        key={globalIndex}
                        className={cn(
                            isRevealed
                                ? (isHighlight && highlightClassName ? highlightClassName : revealedClassName)
                                : encryptedClassName
                        )}
                    >
                        {char}
                    </span>
                )
            })

            charIndex += word.length + 1 // +1 for space

            // Add line break before "With" to create two-line effect
            const originalWord = originalWords[wordIdx]
            const isWithWord = originalWord === 'With' && highlightText?.startsWith('With')

            return (
                <span key={wordIdx}>
                    {isWithWord && <br />}
                    {elements}
                    {wordIdx < words.length - 1 && ' '}
                </span>
            )
        })
    }

    return (
        <span className={cn(className)}>
            {renderText()}
        </span>
    )
}

export default EncryptedText
