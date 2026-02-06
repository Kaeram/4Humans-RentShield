"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const ThreeDMarquee = ({
    items,
    className,
}: {
    items: ReactNode[];
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "h-[30rem] flex flex-col items-center justify-center bg-transparent w-full",
                className
            )}
        >
            <div
                className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full h-full overflow-hidden relative group/strip"
            >
                {/* Gradients for smooth fade in/out */}
                <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-neutral-900 via-neutral-900/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent z-10 pointer-events-none" />

                <MarqueeColumn items={items.slice(0, 2)} duration={60} />
                <MarqueeColumn items={items.slice(2, 4)} duration={75} reverse />
                <MarqueeColumn items={items.slice(4, 6)} duration={55} />
            </div>
        </div>
    );
};

const MarqueeColumn = ({
    items,
    duration,
    reverse = false,
}: {
    items: ReactNode[];
    duration: number;
    reverse?: boolean;
}) => {
    return (
        <div className="flex flex-col gap-6 relative h-full group/marquee">
            <div
                style={{
                    "--duration": `${duration}s`,
                    animationDirection: reverse ? "reverse" : "normal",
                } as React.CSSProperties}
                className="flex flex-col gap-6 animate-marquee-vertical group-hover/marquee:[animation-play-state:paused]"
            >
                {[...items, ...items, ...items, ...items].map((item, idx) => (
                    <div
                        key={idx}
                        className="flex-shrink-0"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};
